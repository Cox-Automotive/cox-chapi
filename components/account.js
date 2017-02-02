/**
 *  @overview provides methods for accessing and updating accounts via CloudHealth's API
 *  @see {@link https://github.com/cloudhealth/cht_api_guide/blob/master/account_api.md|cht_api_guide}
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var https = require('https');
var async = require('async');
var utils = require('../utils/chapi');

/**
 *  @class Account
 *  @memberof module:cox-chapi
 *  @param {string} [api_key]
 */
var Account = function(api_key) {
  this.set_api_key(api_key);
}

/**
 *  creates and returns an options object that can be given to utils.send_request
 *  @private
 *  @param {string} method - the method to use (ie. GET, POST, etc.)
 *  @param {string} [path] - a string to append to the path field of options
 *  @param {string[]} [params] - an array of parameters to add to the url in the
 *    form "key=value"
 *  @return {object} an options object
 */
Account.prototype._options = function(method, path, params) {
  return utils._options('/v1/aws_accounts', method, path, params, this._api_key);
};

/**
 *  sets the api key to use when making calls to CloudHealth's API
 *  @function module:cox-chapi.Account#set_api_key
 *  @param {string} api_key
 */
Account.prototype.set_api_key = function(api_key) {
  this._api_key = api_key;
}

/**
 *  gets a JSON object containing all the accounts
 *  @function module:cox-chapi.Account#list
 *  @param {object} [flags] - an object specifying the following options
 *  @param {number} [flags.page] - the page number of the page to get
 *  @param {number} [flags.page_count] - the number of accounts to list per page
 *  @param {boolean} [flags.all] - if true, return complete list (all pages) but this may take longer
 *  @param {boolean} [flags.stats] - if true, the page count, number of entries per
 *                                   page, and number of pages will be given in an
 *                                   object rather than the array of accounts
 *  @param {arrayCallback} cb - called with an array of accounts
 */
Account.prototype.list = function(flags, cb) {
  if (typeof flags === 'function') {
    cb = flags;
    flags = {};
  }

  if (flags.all) {
    return this._list_all(cb);
  }
  else {
    return this._list(flags, cb);
  }
};

/**
 *  Helper for #list
 *  @private
 */
Account.prototype._list = function(flags, cb) {
  var send_request_flags = {};
  var params = [];
  if (flags.stats) {
    send_request_flags.headers = true;
  }
  else {
    if (flags.page) params.push('page=' + flags.page);
    if (flags.page_count) params.push('page_count=' + flags.page_count);
  }

  var options = this._options('GET', '', params);

  utils.send_request(send_request_flags, options, null, this._list_cb.bind(this, flags, cb));
};

/**
 *  Helper callback for #list
 *  @private
 */
Account.prototype._list_cb = function(flags, cb, err, result) {
  if (err) return cb(err, result);

  // handle call for only stats
  if (flags.stats) {
    var stats = {
      page_count: result.link && (result.link.match(/&page=([0-9]+)>;\s?rel="last"/))[1],
      per_page: result["x-per-page"],
      total: result["x-total"],
    };
    return cb(null, stats);
  }
  else {
    return cb(null, result.aws_accounts);
  }
};

/**
 *  gets a list of all accounts rather than paginating and returning a single page
 *  @private
 *  @function module:cox-chapi.Account#_list_all
 *  @param {arrayCallback} cb - called with an array of accounts
 */
Account.prototype._list_all = function(cb) {
  this.list({stats: true}, (err, stats) => {
    if (err) return cb(err);
    var calls = [];
    for (var i=0, len=stats.page_count; i<len; i++) {
      calls.push(this.list.bind(this, {page: i+1}));
    }
    async.parallel(calls, (err, results) => {
      if (err) return cb(err);
      var accounts = results.reduce((prev, curr) => prev.concat(curr), []);
      cb(null, accounts);
    });
  });
}

/**
 *  gets a JSON object containing data for a single account
 *  @function module:cox-chapi.Account#get
 *  @param {number} id - the id of the account
 *  @param {objectCallback} cb - called with the account
 */
Account.prototype.get = function(id, cb) {
  var options = this._options('GET', '/' + id);

  utils.send_request(options, null, cb);
};

/**
 *  gets accounts such that field matches the value
 *  @function module:cox-chapi.Account#find_by
 *  @param {string} field - the name of the field to search by
 *  @param {string} value - the value to match
 *  @param {Array} [list] - an optional array of accounts to search (if given,
 *                          the search will not make http requests, improving
 *                          speed)
 *  @param {arrayCallback} cb - called with an array containing the matching
 *                              accounts
 */
Account.prototype.find_by = function(field, value, list, cb) {
  if (typeof list === 'function') {
    cb = list;
    list = null;
  }

  return this._find_by(field, value, list, cb);
}

/**
 *  Helper for #find_by
 *  @private
 */
Account.prototype._find_by = function(field, value, list, cb) {
  if (list) {
    var matches = list.filter(
      (account) => account[field] && account[field].toString().match(new RegExp(value, 'i'))
    );
    cb(null, matches);
  }
  else {
    this.list({all: true}, (err, matches) => {
      if (err) return cb(err);
      this.find_by(field, value, matches, cb);
    });
  }
};

/**
 *  Creates an account from the json object
 *  @function module:cox-chapi.Account#create
 *  @param {object} account - an object specifying fields for the new account
 *  @param {objectCallback} cb - called with the new account
 */
Account.prototype.create = function(account, cb) {
  var options = this._options('POST');

  utils.send_request(options, JSON.stringify(account), cb);
};

/**
 *  Updates fields for the account with the specified id to match the given object
 *  @function module:cox-chapi.Account#update
 *  @param {object} account - an object specifying fields with updated values
 *  @param {number} account.id - the id of the account
 *  @param {objectCallback} cb - called with the updated account
 */
Account.prototype.update = function(account, cb) {
  var options = this._options('PUT', '/' + account.id);

  delete account.id;

  utils.send_request(options, JSON.stringify(account), cb);
};

/**
 *  Deletes the account with the specified id
 *  @function module:cox-chapi.Account#destroy
 *  @param {number} id - the id of the account
 *  @param {stringCallback} cb - called with a success message
 */
Account.prototype.destroy = function(id, cb) {
  var options = this._options('DELETE', '/' + id);

  utils.send_request(options, null, this._delete_cb.bind(this, id, cb));
};

/**
 *  Helper callback for #delete
 *  @private
 */
Account.prototype._delete_cb = function(id, cb, err, result) {
  if(err) {
    cb(err, result);
  }
  else {
    cb(null, 'account destroyed');
  }
};

module.exports = Account;
