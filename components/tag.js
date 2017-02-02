/**
 *  @overview provides methods for adding, changing, and removing tags from
 *            accounts and assets via CloudHealth's API (to get a list of tags
 *            for an asset or account, see
 *            {@link module:cox-chapi.Asset#query|asset api} or
 *            {@link module:cox-chapi.Account#get|account api})
 *  @see {@link https://github.com/cloudhealth/cht_api_guide/blob/master/customer_tags_api.md|cht_api_guide}
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var utils = require('../utils/chapi');

/**
 *  @class Tag
 *  @memberof module:cox-chapi
 *  @param {string} [api_key]
 */
var Tag = function(api_key) {
  this.set_api_key(api_key);
}

/**
 *  sets the api key to use when making calls to CloudHealth's API
 *  @function module:cox-chapi.Tag#set_api_key
 *  @param {string} api_key
 */
Tag.prototype.set_api_key = function(api_key) {
  this._api_key = api_key;
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
Tag.prototype._options = function(method, path, params) {
  return utils._options('/customer_tags', method, path, params, this._api_key);
};

/**
 *  adds/updates tags for an account or asset
 *  @function module:cox-chapi.Tag#set
 *  @param {number} aws_id - the aws id (owner_id) of the account
 *  @param {string} [asset_id] - the id of the asset
 *  @param {object} tags - the tags to set
 *  @param {stringCallback} cb - called with a message saying how many tags were set
 */
Tag.prototype.set = function(aws_id, asset_id, tags, cb) {
  // set tags for account
  if (arguments.length === 3) {
    cb = tags;
    tags = undefined;
  }
  // handle utils.parse_chapi moving tags to first element
  if (typeof aws_id === 'object') {
    var temp = aws_id;
    aws_id = asset_id;
    asset_id = tags;
    tags = temp;
  }
  // handle setting tags for account
  else if (typeof asset_id === 'object') {
    tags = asset_id;
    asset_id = undefined;
  }

  return this._set(aws_id, asset_id, tags, cb);
};

/**
 *  Helper for #set
 *  @private
 */
Tag.prototype._set = function(aws_id, asset_id, tags, cb) {
  var options = this._options('POST');

  var body = {
    assets: [
      {
        tags: tags,
      },
    ],
  };

  if (asset_id) {
    body.assets[0].aws_account_id = aws_id;
    body.assets[0].instance_id = asset_id;
  }
  else {
    body.assets[0].type = "AwsAccount";
    body.assets[0].owner_id = aws_id;
  }

  return utils.send_request(options, body, this._set_cb.bind(this, aws_id, asset_id, tags, cb));
};

/**
 *  Helper callback for #set
 */
Tag.prototype._set_cb = function(aws_id, asset_id, tags, cb, err, result) {
  if (err) return cb(err, result);
  if (result.failures.length) {
    return cb(new Error(result.failures[0]), result.successful);
  }
  cb(null, result.successful);
};

/**
 *  delete tags from an account or asset
 *  @function module:cox-chapi.Tag#delete
 *  @param {number} aws_id - the aws id (owner_id) of the account
 *  @param {string} [asset_id] - the id of the asset
 *  @param {string[]|object} tags - the tags to delete
 *  @param {stringCallback} cb - called with a message saying how many tags were deleted
 */
Tag.prototype.delete = function(aws_id, asset_id, tags, cb) {
  // set tags for account
  if (arguments.length === 3) {
    cb = tags;
    tags = undefined;
  }
  // handle utils.parse_chapi moving tags to first element
  if (typeof aws_id === 'object') {
    var temp = aws_id;
    aws_id = asset_id;
    asset_id = tags;
    tags = temp;
  }
  // handle setting tags for account
  else if (typeof asset_id === 'object') {
    tags = asset_id;
    asset_id = undefined;
  }

  // build a new tags object with each key set to null
  var to_delete = {};
  if (Array.isArray(tags)) {
    for (var i=0; i<tags.length; i++) {
      to_delete[tags[i]] = null;
    }
  }
  else {
    for (var key in tags) {
      if (tags.hasOwnProperty(key)) to_delete[key] = null;
    }
  }

  this.set(aws_id, asset_id, to_delete, cb);
};

module.exports = Tag;
