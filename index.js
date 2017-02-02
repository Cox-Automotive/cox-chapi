/**
 *  @overview Contains components that encapuslate the Rest APIs for the popular
 *            CloudHealth cloud management system
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var Account = require('./components/account');
var Perspective = require('./components/perspective');
var Asset = require('./components/asset');
var Tag = require('./components/tag');
var Report = require('./components/report');
var utils = require('./utils/chapi');

/**
 *  @module cox-chapi
 */
var CloudHealth = {
  Account,
  Perspective,
  Asset,
  Tag,
  Report,
  utils,
};

module.exports = CloudHealth;

/**
 *  @callback objectCallback
 *  @global
 *  @param {Error} err - an error object
 *  @param {object} obj - a simple object
 */

/**
 *  @callback arrayCallback
 *  @global
 *  @param {Error} err - an error object
 *  @param {Array} arr - an array
 */

/**
 *  @callback stringCallback
 *  @global
 *  @param {Error} err - an error object
 *  @param {string} str - a string
 */

/**
 *  @callback mixedCallback
 *  @global
 *  @param {Error} err - an error object
 *  @param {mixed} data - some data (may be string, object, array, or other type)
 */
