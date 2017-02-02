/**
 *  @overview provides methods for fetching reports via CloudHealth's API
 *  @see {@link https://github.com/CloudHealth/cht_api_guide#reporting-api}
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var utils = require('../utils/chapi');
var async = require('async');

/**
 *  @class Report
 *  @memberof module:cloud-health-api
 *  @param {string} [api_key]
 */
function Report(api_key) {
  this.set_api_key(api_key);
}

/**
 *  sets the api key to use when making calls to CloudHealth's API
 *  @function module:cloud-health-api.Report#set_api_key
 *  @param {string} api_key
 */
Report.prototype.set_api_key = function set_api_key(api_key) {
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
Report.prototype._options = function _options(method, path, params) {
  return utils._options('/olap_reports', method, path, params, this._api_key);
};

/**
 *  gets a list of topics (or reports for a topic if a topic id is specified)
 *  @function module:cloud-health-api.Report#list
 *  @param {object} [flags] - an optional object specifying the following options
 *  @param {boolean} [flags.nest] - if true, each topic will have a "reports"
 *    field containing the result of calling this function for that topic
 *  @param {boolean} [flags.all] - same as nest
 *  @param {string} [topic] - the topic to list subtopics for
 *  @param {arrayCallback} cb - called with an array of objects, each containing
 *    a name and id field for a topic
 */
Report.prototype.list = function list(flags, topic, cb) {
  if (typeof flags === 'function') {
    cb = flags;
    topic = '';
    flags = undefined;
  }
  else if (typeof topic === 'function') {
    cb = topic;
    topic = '';
    if (typeof flags === 'string') {
      topic = '/' + flags;
      flags = undefined;
    }
  }
  else {
    topic = '/' + topic;
  }

  this._list(flags, topic, cb);
};

/**
 *  Helper for #list
 *  @private
 */
Report.prototype._list = function _list(flags, topic, cb) {
  if (flags && (flags.nest || flags.all)) {
    this._nest(cb);
  }
  else {
    var options = this._options('GET', topic);

    utils.send_request(options, null, this._list_cb.bind(this, flags, topic, cb));
  }
};

/**
 *  Helper callback for #list
 *  @private
 */
Report.prototype._list_cb = function _list_cb(flags, topic, cb, err, result) {
  if (err) return cb(err, result);

  var topics = this._format_list(result);
  cb(null, topics);
};

/**
 *  gets a list of topics, each having an array of reports named "reports"
 *  @private
 *  @function module:cloud-health-api.Report#_nest
 *  @param {arrayCallback} cb - called with the list of topics
 */
Report.prototype._nest = function _nest(cb) {
  this.list((err, topics) => {
    if (err) return cb(err);

    var list_calls = [];
    for (var i=0; i<topics.length; i++) {
      var topic = topics[i];
      list_calls.push(((index, topic, list_cb) => {
        this.list(topic.id, (err, reports) => {
          if (err) return list_cb(err);
          list_cb(null, {index: index, reports: reports});
        });
      }).bind(this, i, topic));
    }
    async.parallel(list_calls, (err, reports) => {
      if (err) return cb(err);

      for (var report of reports) {
        topics[report.index].reports = report.reports;
      }
      cb(null, topics);
    });
  });
};

/**
 *  Formats the result of calling "list"
 *  @private
 *  @function module:cloud-health-api.Report#_format_list
 *  @param {object} result - the result of calling "list"
 *  @return {array} an array of topics extracted from the result
 */
Report.prototype._format_list = function _format_list(result) {
  var links = result.links;
  var keys = Object.keys(links);
  var topics = [];
  for (var i=0; i<keys.length; ++i) {
    var key = keys[i];
    var topic = {
      name: key,
    }
    var match = links[key].href.match(/report_id=([0-9]+)/);
    if (match) {
      topic.id = match[1];
    }
    else {
      topic.id = links[key].href.match(/olap_reports\/(.+)$/)[1];
    }
    topics.push(topic);
  }
  return topics;
};

/**
 *  gets data for the report with the given id
 *  @function module:cloud-health-api.Report#get
 *  @param {string} id - the id of the report
 *  @param {objectCallback} cb - yields the report data
 */
Report.prototype.get = function get(id, cb) {
  if ((''+id).match(/^[0-9]+$/)) {
    id = `custom/${id}`;
  }

  var options = this._options('GET', '/' + id);

  utils.send_request(options, null, cb);
};

/**
 *  lists the possible dimensions for generating a report under a base
 *  @function module:cloud-health-api.Report#dimensions
 *  @param {object} [flags] - an object containing flags
 *  @param {boolean} [flags.short] - specifies to yield only the name and label
 *    of dimensions and measures
 *  @param {string} base - the category/sub-category for the report to show in
 *    the form "category/sub-category" (ie. "usage/instance" or "cost/history")
 *  @param {objectCallback} cb - yields an object containing dimensions (used
 *    for x-axis or category) and measures (used for y-axis)
 */
Report.prototype.dimensions = function dimensions(flags, base, cb) {
  if (typeof flags !== 'object') {
    cb = base;
    base = flags;
    flags = undefined;
  }

  this._dimensions(flags, base, cb);
};

/**
 *  Helper for #dimensions
 *  @private
 */
Report.prototype._dimensions = function _dimensions(flags, base, cb) {
  var options = this._options('GET', '/' + base + '/new');

  utils.send_request(options, null, this._dimensions_cb.bind(this, flags, base, cb));
};

/**
 *  Helper callback for #dimensions
 *  @private
 */
Report.prototype._dimensions_cb = function _dimensions_cb(flags, base, cb, err, result) {
  if (err) return cb(err, result);

  if (flags && flags.short) {
    result.dimensions = result.dimensions.map((dimension) =>
      ({label: dimension.label, name: dimension.name})
    );
    result.measures = result.measures.map((measure) =>
      ({label: measure.label, name: measure.name})
    );
  }

  cb(null, result);
};

/**
 *  returns data for a custom report built from the parameters you specify
 *  @function module:cloud-health-api.Report#generate
 *  @param {string} base - the category/sub-category for the report to show in
 *    the form "category/sub-category" (ie. "usage/instance" or "cost/history")
 *  @param {string} x - the id of the dimension to use for the x-axis
 *  @param {string} y - the id of the measure to use for the y-axis
 *  @param {string} category - the id of the dimension to use for categorizing
 *    the report's data
 *  @param {stirng} [interval] - the time interval by which to break up the data
 *    (only use if either the x or category dimensions are "time")
 *  @param {objectCallback} cb - yields an object containing data for the report
 *    as well as data about the report (including dimensions, filters, interval,
 *    measures, report name, status, and the last time the report was updated)
 */
Report.prototype.generate = function generate(base, x, y, category, interval, cb) {
  if (typeof interval === 'function') {
    cb = interval;
    interval = undefined;
  }

  this._generate(base, x, y, category, interval, cb);
};

/**
 *  Helper for #generate
 *  @private
 */
Report.prototype._generate = function _generate(base, x, y, category, interval, cb) {
  if (interval && interval !== '') {
    interval = 'interval=' + interval;
  }
  else {
    interval = '';
  }

  var options = this._options('GET', '/' + base, ['dimensions[]=' + x, 'dimensions[]' + category, 'measures[]=' + y, interval]);

  utils.send_request(options, null, cb);
};

module.exports = Report;
