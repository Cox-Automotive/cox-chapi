/**
 *  @overview this library provides several shared functions that are used
 *            throughout the cox-chapi module
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var fs = require('fs');
var https = require('https');
var child_process = require('child_process');

/**
 *  @namespace module:cox-chapi.utils
 */
var utils = {
  _get_settings,
  _options,
  _parse_stdin_data,
  _set_settings,
  execute,
  find_api_key,
  find_cache,
  find_creds,
  get_package_json,
  parse_chapi,
  print_response,
  read_stdin,
  run,
  send_request,
  set_api_key,
  set_cache,
  set_creds,
};

/**
 *  gets the settings object by reading from a settings file
 *  @memberof module:cox-chapi.utils
 *  @private
 *  @param {objectCallback} cb - called with the settings object
 */
function _get_settings(cb) {
  fs.readFile(process.env['HOME'] + '/.cloudhealthapi.json', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        this._set_settings({}, cb);
      }
      else {
        cb(err, content);
      }
    }
    else {
      var settings = JSON.parse(content);
      cb(null, settings);
    }
  });
}

/**
 *  creates and returns an options object that can be given to utils.send_request
 *  @private
 *  @param {string} base - the base path
 *  @param {string} method - the method to use (ie. GET, POST, etc.)
 *  @param {string|null} path - a string to append to the path field of options
 *  @param {string[]|null} params - an array of parameters to add to the url in the
 *    form "key=value"
 *  @param {string} api_key - the api_key
 *  @return {object} an options object
 */
function _options(base, method, path, params, api_key) {
  if (!path) path = '';
  if (!params) params = [];
  params.push('api_key=' + api_key);

  var start = true;
  while (params.length) {
    if (start) {
      path += '?';
      start = false;
    }
    else path += '&';

    path += params.shift();
  }

  return {
    host: 'chapi.cloudhealthtech.com',
    port: 443,
    path: base + path,
    method: method.toUpperCase(),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  };
}

/**
 *  parses a string of data as parameters given to the chapi command-line utility
 *  @private
 *  @memberof module:cox-chapi.utils
 *  @param {string} data - the string containing parameter data
 *  @return {string[]} an array of parameters
 */
function _parse_stdin_data(data) {
  var params;

  // if data should be treated as json
  if (data.trim().match(/^\{(.|\r|\t|\n)*\}$/)) {
    params = [data.trim().replace(/(\n|\r|\t)/g, '')];
  }
  // split the data by spaces
  else {
    params = data.split(/\s+/);
  }

  // clean empty elements on the ends that resulted from calling "split"
  if(params.length && params[params.length - 1] == '') {
    params.pop();
  }
  if(params.length && params[0] == '') {
    params.shift();
  }
  return params;
}

/**
 *  sets the settings object by writing to a settings file
 *  @memberof module:cox-chapi.utils
 *  @private
 *  @param {object} settings - the new settings object
 *  @param {objectCallback} [cb] - called with the new settings object
 */
function _set_settings(settings, cb) {
  fs.open(process.env['HOME'] + '/.cloudhealthapi.json', 'w', (err1, fd) => {
    if (err1) {
      if (cb) return cb(err1);
      else throw err1;
    }

    if (!settings.cache) {
      settings.cache = {};
    }
    if (!settings.creds) {
      settings.creds = {};
    }

    fs.write(fd, JSON.stringify(settings), (err2) => {
      if (err2) {
        if (cb) return cb(err2);
        else throw err2;
      }
      cb(null, settings);
    });
  });
}

/**
 *  Executes func on component with params as parameters
 *  @memberof module:cox-chapi.utils
 *  @param {object} component
 *  @param {function} func
 *  @param {string[]} params
 *  @param {mixedCallback} [cb] - called with the result of func (required if func takes a callback)
 */
function execute(component, func, params, cb) {
  params = params.slice();
  if (params.length > 0) {
    params = this.parse_chapi(params);
  }

  params.push(cb);
  var response = func.apply(component, params);
  if (response !== undefined && response !== null) {
    if (response instanceof Error) {
      this.print_response(response);
    }
    else {
      this.print_response(null, response);
    }
  }
}

/**
 *  gets the api_key for the current environment
 *  @memberof module:cox-chapi.utils
 *  @param {objectCallback} cb - called with the api_key
 */
function find_api_key(cb) {
  var api_key = process.env['CHAPI_KEY'];
  if (api_key) {
    cb(null, api_key);
  }
  else {
    this.find_creds((err, creds) => {
      if (err) return cb(err, creds);
      if (creds.api_key) {
        cb(null, creds.api_key);
      }
      else {
        cb(new Error('No API key found. Make sure to set CHAPI_KEY to your api_key'));
      }
    });
  }
}

/**
 *  gets the cache with the given cache_name from the settings file if it exists
 *  @memberof module:cox-chapi.utils
 *  @param {mixedCallback} cb - called with the cache value
 */
function find_cache(cache_name, cb) {
  this._get_settings((err, settings) => {
    if (err) return cb(err);
    cb(null, settings.cache[cache_name]);
  });
}

/**
 *  gets the creds object from the settings file if it exists
 *  @deprecated use find_api_key instead
 *  @memberof module:cox-chapi.utils
 *  @param {objectCallback} cb - called with the credentials object
 */
function find_creds(cb) {
  this._get_settings((err, settings) => {
    if (err) return cb(err);
    cb(null, settings.creds);
  });
}

/**
 *  Gets the package.json file
 *  @param {objectCallback} cb - yields an object containing package.json data
 */
function get_package_json(cb) {
  fs.readFile(`${__dirname}/../package.json`, (err, contents) => {
    if (err) return cb(err, contents);
    var json;
    try {
      json = JSON.parse(contents);
    }
    catch (e) {
      return cb(e, contents);
    }
    cb(null, json);
  })
}

/**
 *  parses an array of key-value pairs (ie. --key=value) into a javscript object
 *  @memberof module:cox-chapi.utils
 *  @param {string[]} params - an array of chapi strings of the form "--key=value"
 *  @return {Array} an array whose first parameter is an object containing the
 *                  key-value pairs, and the remaining parameters are any non-key-value
 *                  pairs in the order that they were given
 */
function parse_chapi(params) {
  var obj = {};
  var new_params = [];
  for (var i=0; i<params.length; i++) {
    var param = params[i];
    // if params is not a key-value, don't parse it
    if (!param.match(/^--.+/)) {
      // if param is json, parse the json
      if (param.match(/^\s*\{.*\}\s*$/)) {
        param = JSON.parse(param);
      }
      new_params.push(param);
    }
    else {
      param = param.slice(2);
      var key, value;
      if (param.match(/=/)) {
        var pair = param.split('=');
        key = pair[0], value = pair[1];
      }
      else {
        key = param;
        value = 'true';
      }
      obj[key] = value;

      // prepend the obj to the array, if if doesn't contain it already
      if (!new_params.length || new_params[0] !== obj) {
        new_params.unshift(obj);
      }
    }
  }
  return new_params;
}

/**
 *  prints the contents of a json object or an error message. Intended
 *  as a callback
 *  @memberof module:cox-chapi.utils
 *  @param {object} err
 *  @param {mixed} res
 */
function print_response(err, res) {
  if (err) {
    if (res) console.error(res);
    if (process.env['CHAPI_DEV_MODE']) throw err;
    else {
      console.error(err.message);
      process.exit(1);
    }
  }
  else {
    console.log(JSON.stringify(res));
  }
}

/**
 *  Reads from stdin and sends data through callback
 *  @memberof module:cox-chapi.utils
 *  @param {stringCallback} cb - called with the data that was read in
 */
function read_stdin(cb) {
  var data = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(chunk) {
    data += chunk;
  });

  process.stdin.on('end', function() {
    cb(null, data);
  });

  process.stdin.on('error', function(err) {
    cb(err);
  });
}

/**
 *  executes a script in the scripts folder with the given arguments
 *  @memberof module:cox-chapi.utils
 *  @param {string} script - the name of the script to run (without .js)
 *  @return {EventEmitter} an EventEmitter for the child process
 */
function run(script, ...args) {
  var path = `${__dirname}/../scripts/${script}.js`;

  var invoked = false;

  try {
    fs.accessSync(path, fs.F_OK);
  }
  catch (err) {
    this.print_response(new Error(`${script}.js is not an accessible script`));
    return;
  }
  var script_process = child_process.fork(path, args);

  script_process.on('error', (err) => {
    if (invoked) return;
    invoked = true;
    this.print_response(err);
  });

  script_process.on('exit', (code) => {
    if (invoked) return;
    invoked = true;
    if (code !== 0) {
      this.print_response(new Error(`script ${script} exited with exit code ${code}`));
    }
  });

  return script_process;
}

/**
 *  function for sending an HTTPS call for CloudHealth's API
 *  @memberof module:cox-chapi.utils
 *  @param {object} [flags] - an optional flags object
 *  @param {boolean} [flags.headers] - if true, yield only the headers returned
 *  @param {object} options - options to use for the https.request function
 *  @param {string} send_data - data to send
 *  @param {objectCallback} cb - called with the parsed json response body
 */
function send_request(flags, options, send_data, cb) {
  if (typeof send_data === 'function') {
    cb = send_data;
    send_data = options;
    options = flags;
    flags = null;
  }

  if (send_data && typeof send_data !== 'string') {
    send_data = JSON.stringify(send_data);
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');

    if (flags && flags.headers) {
      cb(null, res.headers);
      return;
    }

    var data = '';

    res.on('data', function(chunk) {
      data = data + chunk;
    });

    res.on('end', function() {
      var json = data;
      if (data !== '') {
        json = JSON.parse(data);
      }

      if((res.statusCode < 200) || (res.statusCode >= 300)) {
        cb(new Error('Request received status code: ' + res.statusCode + '\n'), json);
      }
      else {
        cb(null, json);
      }
    });
  });

  req.on('error', function(message) {
    cb(new Error(message));
  });

  if((send_data !== null) && (typeof send_data !== 'undefined')) {
    req.write(send_data);
  }
  req.end();
};

/**
 *  sets the api_key for an environment
 *  @memberof module:cox-chapi.utils
 *  @param {string} api_key - the api_key to use for CloudHealth
 *  @param {objectCallback} [cb] - called with the api_key
 */
function set_api_key(api_key, cb) {
  if (!api_key) {
    return cb(new Error('No api_key given'), api_key);
  }
  process.env['CHAPI_KEY'] = api_key;
  this.set_creds(api_key, (err, creds) => {
    if (err) return cb(err, creds);
    cb(null, api_key);
  });
}

/**
 *  sets a cache with the given cache_name object by writing to a settings file
 *  @memberof module:cox-chapi.utils
 *  @param {string} cache_name - the name of the cache variable to set
 *  @param {mixed} cache - the new cache variable
 *  @param {mixedCallback} [cb] - called with the new cache variable
 */
function set_cache(cache_name, cache, cb) {
  this._get_settings((err1, settings) => {
    if (err1) {
      if (cb) return cb(err1);
      else throw err1;
    }
    console.log('inside set_cache');
    settings.cache[cache_name] = cache;

    this._set_settings(settings, (err2, settings) => {
      if (err2) {
        if (cb) return cb(err2);
        else throw err2;
      }
      cb(null, cache);
    });
  });
}

/**
 *  sets the credentials object by writing to a settings file
 *  @memberof module:cox-chapi.utils
 *  @deprecated use set_api_key instead
 *  @param {string} api_key - the api_key to use for CloudHealth
 *  @param {objectCallback} [cb] - called with the credentials object
 */
function set_creds(api_key, cb) {
  this._get_settings((err1, settings) => {
    if (err1) {
      if (cb) return cb(err1);
      else throw err1;
    }

    settings.creds = {
      api_key: api_key,
    };

    this._set_settings(settings, (err2, settings) => {
      if (err2) {
        if (cb) return cb(err2);
        else throw err2;
      }
      cb(null, settings.creds);
    });
  });
}

module.exports = utils;
