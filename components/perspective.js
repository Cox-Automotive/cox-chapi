/**
 *  @overview provides methods for accessing and updating perspectives via CloudHealth's API
 *  @see {@link https://github.com/cloudhealth/cht_api_guide/blob/master/perspectives_api.md|cht_api_guide}
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var https = require('https');
var utils = require('../utils/chapi.js');

/**
 *  @class Perspective
 *  @memberof module:cox-chapi
 *  @param {string} [api_key]
 */
var Perspective = function(api_key) {
  this.set_api_key(api_key);
}

/**
 *  sets the api key to use when making calls to CloudHealth's API
 *  @function module:cox-chapi.Perspective#set_api_key
 *  @param {string} api_key
 */
Perspective.prototype.set_api_key = function(api_key) {
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
Perspective.prototype._options = function(method, path, params) {
  return utils._options('/v1/perspective_schemas', method, path, params, this._api_key);
};

/**
 *  gets a JSON object containing data for a perspective
 *  @function module:cox-chapi.Perspective#get
 *  @param {object} [flags] - an optional flags object
 *  @param {boolean} [flags.cache] - if true, this method will re-use a stored list
 *                                   of perspectives from the last time the --cache
 *                                   flag wasn't used when looking up ids from names
 *  @param {number} id - the id of the perspective
 *  @param {objectCallback} cb - called with an object representing the perspective
 */
Perspective.prototype.get = function(flags, id, cb) {
  if (typeof id === 'function') {
    cb = id;
    id = flags;
    flags = null;
  }
  // ensure id is a string
  id = '' + id;
  // if "id" is a name, lookup the name
  if (!id.match(/^[0-9]+$/)) {
    this._lookup_id(flags, id, (err, id) => {
      if (err) return cb(err, id);
      this.get(id, cb);
    });
  }
  else {
    return this._get(flags, id, cb);
  }
}

/**
 *  helper for #get
 *  @private
 */
Perspective.prototype._get = function(flags, id, cb) {
  var options = this._options('GET', '/' + id, ['include_version=true']);
  utils.send_request(options, null, this._get_cb.bind(this, flags, id, cb));
};

/**
 *  Helper callback for #get
 *  @private
 */
Perspective.prototype._get_cb = function(flags, id, cb, err, result) {
  if (err) return cb(err, result);

  result = result.schema;

  result.id = id;
  return cb(null, result);
};

/**
 *  gets the id of the perspective with the given name
 *  @function module:cox-chapi.Perspective#_lookup_id
 *  @private
 *  @param {object} flags - a flags object
 *  @param {boolean} [flags.cache] - if true, this method will re-use a stored list
 *                                   of perspectives from the last time the --cache
 *                                   flag wasn't used
 *  @param {string} name - the name of the perspective
 *  @param {stringCallback} cb - called with the perspective id
 */
Perspective.prototype._lookup_id = function(flags, name, cb) {
  this.list(flags, (err, data) => {
    if (err) return cb(err, data);
    var key_index = Object.keys(data).findIndex(
      (id) => data[id].name.toLowerCase() === name.toLowerCase()
    );
    cb(null, Object.keys(data)[key_index]);
  });
}

/**
 *  gets an id for a group
 *  @function module:cox-chapi.Perspective#_lookup_group_id
 *  @private
 *  @param {object} pers - an object representing a perspective
 *  @param {string} group_name - the name of the group to search for
 *  @param {stringCallback} cb - called with the group id associated with
 *                               group_name, or group_name if not found
 */
Perspective.prototype._lookup_group_id = function(pers, group_name, cb) {
  var groups = this.list_groups(pers, (err, groups) => {
    if (err) return cb(err);

    // get the group from the list of groups
    var group = groups.find(
      (group) => group.name.toLowerCase() === group_name.toLowerCase()
    );

    // return the id, or name if name didn't match any groups
    var id = group_name;
    if (group) {
      id = group.ref_id;
    }
    cb(null, id);
  });
}

/**
 *  gets an array of groups for a perspective
 *  @function module:cox-chapi.Perspective#list_groups
 *  @param {object|string} pers - an object representing a perspective, or
 *                                the perspective's id
 *  @param {arrayCallback} cb - an array of groups for the perspective
 */
Perspective.prototype.list_groups = function(pers, cb) {
  // check if we have an id or the perspective object
  if (typeof pers === 'object') {
    // get the groups object from the list of constants
    var groups = pers.constants.find(
      (constant) => constant.type.toLowerCase() === 'static group'
    );
    cb(null, groups.list);
  }
  else {
    // get a perspective object from the id and try again
    this.get(pers, (err, perspective) => {
      if (err) return cb(err);
      this.list_groups(perspective, cb);
    });
  }
}

/**
 *  adds an account to a group in a perspective
 *  @function module:cox-chapi.Perspective#add_to_group
 *  @param {object|string} pers - an object representing the perspective, or
 *                                the perspective's id
 *  @param {mixed} accts - the account to add to a group, the account's id, or
 *                        an array of a mixture of those
 *  @param {string} group_name - the name of the group to add an account to
 *  @param {objectCallback} cb - called with the updated perspective
 */
Perspective.prototype.add_to_group = function(pers, accts, group_name, cb) {
  // if pers is an object, rather than an id
  if (typeof pers === 'object') {
    // convert acct to an array of account ids to add
    if (!Array.isArray(accts)) {
      accts = [accts];
    }
    accts = accts.map(
      (acct) => (typeof acct === 'object')? acct.id : acct
    );

    this._lookup_group_id(pers, group_name, (err, id) => {
      if (err) return cb(err);

      // get the rule specifying accounts that belong to this group
      var rule = this._get_rule(pers, id);

      for (let acct of accts) {
        // add a condition for this account to the rule
        rule.condition.clauses.push({
          asset_ref: acct,
          op: '=',
          val: acct,
        });
      }

      // if more than one clause, specify 'OR' for combining conditions
      if (rule.condition.clauses.length > 1) {
        rule.condition.combine_with = 'OR';
      }

      // update the perspective with the new info
      this.update(pers, cb);
    });
  }
  else {
    // if pers is an id, get the perspective and try again
    this.get(pers, (err, pers) => {
      if (err) return cb(err);
      this.add_to_group(pers, accts, group_name, cb);
    });
  }
}

/**
 *  Gets the rule in pers that specifies membership to the group with group_id
 *  @function module:cox-chapi.Perspective#_get_rule
 *  @private
 *  @param {object} pers - a perspective containing rules
 *  @param {string} group_id - the id of the group that the rule points to
 *  @return {object} the matching rule, or a new rule that has already been
 *                   added to the perspective
 */
Perspective.prototype._get_rule = function(pers, group_id) {
  // get the rule specifying accounts that belong to this group
  var rule;

  if (pers.rules.length) {
    rule = pers.rules.find(
      (rule) => rule.asset === 'AwsAccount' && rule.to === group_id && rule.from === undefined
    );
  }
  // if the rule doesn't exist, make a rule
  if (!rule) {
    rule = {
      asset: 'AwsAccount',
      to: group_id,
      type: 'filter',
      condition: {
        clauses: [],
      },
    };
    pers.rules.push(rule);
  }
  return rule;
};

/**
 * remove previous references to an account within the rules of the schema
 * @function module:cox-chapi.Perspective#remove_prev_refs
 * @param {object} options options object of params
 * @param {object} options.pers - a perspective containing rules
 * @param  {string} options.account_ref_id ref_id of the account
 * @param  {objectCallback} cb - called with the updated pers object

 */
Perspective.prototype.remove_prev_refs = function({ pers, account_ref_id }, cb) {
  pers.rules.forEach((rule) => {
    if (rule.asset === 'AwsAccount'){
      rule.condition.clauses = rule.condition.clauses.filter(clause => clause.asset_ref != account_ref_id);
    };
  });
  pers.rules = pers.rules.filter(rule => rule.condition.clauses.length);
  cb(null, pers);
}

/**
 *  gets a JSON object containing all the perspectives
 *  @function module:cox-chapi.Perspective#list
 *  @param {object} [flags] - an optional flags object
 *  @param {boolean} [flags.cache] - if true, this method will re-use a stored list
 *                                   of perspectives from the last time the --cache
 *                                   flag wasn't used
 *  @param {objectCallback} cb - called with an object with an array of perspective names/ids
 */
Perspective.prototype.list = function(flags, cb) {
  if (typeof flags === 'function') {
    cb = flags;
    flags = {};
  }

  // if the cache flag is set, try to fetch cache
  if (flags.cache) {
    utils.find_cache('perspective_list', (err, cache_list) => {
      if (err) return cb(err, cache_list);
      if (!cache_list) return this.list(cb);
      cb(null, cache_list);
    });
  }
  else {
    return this._list(flags, cb);
  }
};

/**
 *  Helper for #list
 *  @private
 */
Perspective.prototype._list = function(flags, cb) {
  var options = this._options('GET');

  utils.send_request(options, null, this._list_cb.bind(this, flags, cb));
};

/**
 *  Helper callback for #list
 *  @private
 */
Perspective.prototype._list_cb = function(flags, cb, err, result) {
  if (err) return cb(err, result);

  utils.set_cache('perspective_list', result, (err, cache_list) => {
    if (err) return cb(err, cache_list);
    cb(null, cache_list);
  });
};

/**
 *  Creates an perspective from the json object
 *  @function module:cox-chapi.Perspective#create
 *  @param {object} perspective - an object specifying fields for the new perspective
 *  @param {objectCallback} cb - called with the new perspective
 */
Perspective.prototype.create = function(perspective, cb) {
  if (perspective.hasOwnProperty('schema')) {
    perspective = perspective.schema;
  }

  var options = this._options('POST');

  utils.send_request(options, JSON.stringify({schema: perspective}), cb);
};

/**
 *  Updates fields for the perspective with the specified id to match the given object
 *  @function module:cox-chapi.Perspective#update
 *  @param {object} perspective - an object holding new data to update the perspective with
 *  @param {number} perspective.id - the id of the perspective
 *  @param {objectCallback} cb - called with the updated perspective
 */
Perspective.prototype.update = function(perspective, cb) {
  if (perspective.hasOwnProperty('schema')) {
    perspective = perspective.schema;
  }
  // filters out constant type 'Version' which is no longer acceptable
  var constants = perspective.constants;
  perspective.constants = constants.filter((constant) => {
    return constant.type !== 'Version';
  })
  const expiredObj = {};
  perspective.constants.forEach((constant) => {
    constant.list.forEach((account) => {
      if(account.name === "expired") {
        expiredObj[account.ref_id] = account;
      }
    })
    constant.list = constant.list.filter((account) => {
      return account.name !== "expired";
    })
  });

  let { rules } = perspective;
  rules.forEach((rule) => {
    rule.condition.clauses = rule.condition.clauses.filter((clause) => {
      return !expiredObj[clause.asset_ref];
    })
  })

  rules = rules.filter(rule => rule.condition.clauses.length > 0)

  perspective.rules = rules;

  var options = this._options('PUT', '/' + perspective.id);

  utils.send_request(options, JSON.stringify({schema: perspective}), cb);
};

/**
 *  Deletes the perspective with the specified id
 *  @function module:cox-chapi.Perspective#destroy
 *  @param {object} [flags] - leave null/undefined if not specifying options
 *  @param {boolean} [flags.force] - if true, delete regardless of dependencies
 *  @param {boolean} [flags.hard_delete] - if true, skips archiving the perspective before deletion
 *  @param {number} id - the id of the perspective
 *  @param {stringCallback} cb - called with a success message
 */
Perspective.prototype.destroy = function(flags, id, cb) {
  if (typeof flags !== 'object') {
    cb = id;
    id = flags;
    flags = {};
  }

  return this._destroy(flags, id, cb);
};

/**
 *  Helper for #destroy
 *  @private
 */
Perspective.prototype._destroy = function(flags, id, cb) {
  var path = '/' + id;

  if(flags.hard_delete) {
    path += '&force=true&hard_delete=true';
  }
  else if(flags.force) {
    path += '&force=true';
  }

  var options = this._options('DELETE', path);

  utils.send_request(options, null, this._destroy_cb.bind(this, flags, id, cb));
};

/**
 *  Helper callback for #destroy
 *  @private
 */
Perspective.prototype._destroy_cb = function(flags, id, cb, err, result) {
  if(err) {
    return cb(err, result);
  }
  else {
    return cb(null, 'perspective destroyed');
  }
};

module.exports = Perspective;
