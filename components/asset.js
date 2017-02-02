/**
 *  @overview provides methods for querying and viewing assets via CloudHealth's API
 *  @see {@link https://github.com/cloudhealth/cht_api_guide/blob/master/assets_api.md|cht_api_guide}
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var https = require('https');
var querystring = require('querystring');
var utils = require('../utils/chapi');

/**
 *  @class Asset
 *  @memberof module:cox-chapi
 *  @param {string} [api_key]
 */
var Asset = function(api_key) {
  this.set_api_key(api_key);
}

/**
 *  sets the api key to use when making calls to CloudHealth's API
 *  @function module:cox-chapi.Asset#set_api_key
 *  @param {string} api_key
 */
Asset.prototype.set_api_key = function(api_key) {
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
Asset.prototype._options = function(method, path, params) {
  return utils._options('', method, path, params, this._api_key);
};

/**
 *  gets an array of names of object types that can be searched for
 *  @function module:cox-chapi.Asset#list_types
 *  @param {arrayCallback} cb - called with an array of types (as strings)
 */
Asset.prototype.list_types = function(cb) {
  var options = this._options('GET', '/api.json');

  utils.send_request(options, null, this._list_types_cb.bind(this, cb));
};

/**
 *  Helper callback for #list_types
 *  @private
 */
Asset.prototype._list_types_cb = function(cb, err, result) {
  if (err) return cb(err, result);
  cb(null, result.list);
};

/**
 *  gets an object containing field names, the name of the asset, and an array
 *  of relation fields
 *  @function module:cox-chapi.Asset#fields_for
 *  @param {string} asset_type - the asset type to list fields for
 *  @param {arrayCallback} cb - called with an array of objects detailing the fields
 */
Asset.prototype.fields_for = function(asset_type, cb) {
  var options = this._options('GET', '/api/' + asset_type + '.json');

  utils.send_request(options, null, this._fields_for_cb.bind(this, asset_type, cb));
};

/**
 *  Helper callback for #fields_for
 *  @private
 */
Asset.prototype._fields_for_cb = function(asset_type, cb, err, result) {
  if (err) return cb(err, result);
  cb(null, result.attributes);
};

/**
 *  Queries the list of assets of a given type for those matching specified fields
 *  @function module:cox-chapi.Asset#query
 *  @param {object} match - an object where the keys are field names and the
 *    values are the values to match for that field (leave null to get all
 *    assets of the given type)
 *  @param {string} match.asset_type - the type of asset to search for
 *  @param {arrayCallback} cb - called with an array of asset objects
 */
Asset.prototype.query = function(match, cb) {
  var path = '/api/search.json'
  var params = ['name=' + match.asset_type];

  if (Object.keys(match).length > 1) {
    params.push(this._encodeCHQL(match));
  }

  var options = this._options('GET', path, params);

  utils.send_request(options, null, this._query_cb.bind(this, match, cb));
};

/**
 *  Helper for #query
 *  @private
 */
Asset.prototype._query_cb = function(match, cb, err, result) {
  if (err) return cb(err, result);
  cb(null, result.list);
};

/**
 *  encodes an object into CloudHealth Query Language
 *  @private
 *  @function module:cox-chapi.Asset#_encodeCHQL
 *  @param {object} obj - the object to encode
 *  @return {string} the encoded string or null upon failure
 */
Asset.prototype._encodeCHQL = function(obj) {
  if (typeof obj !== 'object') {
    return null;
  }
  if (Array.isArray(obj)) {
    return null;
  }

  var str = '';
  for (var key in obj) {
    if (key === 'asset_type') {
      continue;
    }
    if (str !== '') {
      str += '+and+';
    }
    str += key + '=';
    if (typeof obj[key] === 'string') {
      str += '\'' + obj[key] + '\'';
    }
    else if (typeof obj[key] === 'boolean') {
      str += (obj[key])? 1 : 0;
    }
    else {
      str += obj[key];
    }
  }

  return encodeURIComponent('query=' + str);
}

module.exports = Asset;
