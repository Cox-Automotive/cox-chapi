var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var https = {
  request: sinon.stub(),
};
var EventEmitter = require('events');
var fs = require('fs');
var child_process = require('child_process');
var utils = proxyquire('../../../utils/chapi', {
  'fs': fs,
  'https': https,
  'child_process': child_process,
});

describe('chapi utils', function() {
  describe('_parse_stdin_data', function() {
    it('should return an array of params', function() {
      var params = utils._parse_stdin_data('one');

      var param_check = [
        'one',
      ];

      expect(params).to.eql(param_check);
    });

    it('should not split json input by spaces', function() {
      var spaced_json = ' { "one ": "1", "two":   "2" }  ';
      var params = utils._parse_stdin_data(spaced_json);

      var param_check = [spaced_json];

      expect(params).to.eql(param_check);
		});

    it('should split non-json by spaces', function() {
      var params = utils._parse_stdin_data('test one two three');

      var param_check = ['test', 'one', 'two', 'three'];

      expect(params).to.eql(param_check);
		});

    it('should not call cb with an array containing any empty strings', function() {
      var params = utils._parse_stdin_data('   one        ');

      var param_check = [
        'one',
      ];

      expect(params).to.eql(param_check);
		});
	});

  describe('read_stdin', function() {
    beforeEach(function(){
      process.stdin.removeAllListeners('error');
      process.stdin.removeAllListeners('data');
      process.stdin.removeAllListeners('end');
    });

    it('should call cb with data from stdin on success', function(done) {
      var data = '2 3';

      utils.read_stdin(function(err, data) {
        expect(err).to.be.null;
        expect(data).to.equal(data);
        done();
      });

      process.stdin.emit('data', data);
      process.stdin.emit('end');
		});

    it('should call cb with error on failure', function(done) {
      var error = new Error('test');

      utils.read_stdin(function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      process.stdin.emit('error', error);
		});
	});

  describe('execute', function() {
    it('should call func on component', function(done) {
      var params = [ 'test' ];
      var component = {};
      var func = function() {
        expect(this).to.equal(component);
        done();
      };

      utils.execute(component, func, params, function(){});
		});

    it('should call func giving it cb as a callback', function(done) {
      var params = [ 'test' ];
      var component = {};
      var func = function(param1, cb) {
        count++;
        cb();
      };
      var count = 0;

      utils.execute(component, func, params, function(comp){
        expect(count).to.equal(1);
        done();
      });
		});

    it('should call parse_chapi when params contains key-value pairs', function(done) {
      var params = [ '--key=value', '--key_2="value 2"' ];
      var component = {};
      var func = function(param1, cb) {
        expect(parse_chapi.called).to.be.true;
        parse_chapi.restore();
        done();
      };

      var parse_chapi = sinon.stub(utils, 'parse_chapi', function() {
        return ['test'];
      });

      utils.execute(component, func, params, function(){});
		});

    it('should call func with parse_chapi\'s return value for key-value input', function(done) {
      var params = [ '--key=value', '--key_2="value 2"' ];
      var component = {};
      var func = function(param1, cb) {
        expect(param1).to.equal(test);
        parse_chapi.restore();
        done();
      };
      var test = {test: 'test'};

      var parse_chapi = sinon.stub(utils, 'parse_chapi', function() {
        return [test];
      });

      utils.execute(component, func, params, function(){});
		});

    it('should call func with parsed object for json input', function(done) {
      var params = [ '{"test":"test"}' ];
      var component = {};
      var func = function(param1, cb) {
        expect(param1).to.eql({test: "test"});
        done();
      };

      utils.execute(component, func, params, function(){});
		});

    it('should call func with plain params strings for other input', function(done) {
      var params = [ 'one', 'two', 'three' ];
      var component = {};
      var func = function(param1, param2, param3, cb) {
        expect(param1).to.equal('one');
        expect(param2).to.equal('two');
        expect(param3).to.equal('three');
        done();
      };

      utils.execute(component, func, params, function(){});
		});

    it('should call func without params (cb as first arg) if no params are given', function(done) {
      var params = [];
      var cb = function() {};
      var func = function(first) {
        expect(first).to.equal(cb);
        expect(arguments.length).to.equal(1);
        done();
      };

      utils.execute({}, func, params, cb);
		});

    it('should not call print_response if the function returns null or undefined', function() {
      var params = [];
      var func = function() {
        return null;
      };
      var print_response = sinon.stub(utils, 'print_response');

      utils.execute({}, func, params);
      expect(print_response.called).to.be.false;

      func = function() {
        return undefined;
      };

      utils.execute({}, func, params);
      expect(print_response.called).to.be.false;

      print_response.restore();
    });

    it('should call print_response with the result if the function returns a value', function() {
      var params = [];
      var obj = {};
      var func = function() {
        return obj;
      };
      var print_response = sinon.stub(utils, 'print_response');

      utils.execute({}, func, params);
      expect(print_response.called).to.be.true;
      expect(print_response.calledWith(null, obj)).to.be.true;

      print_response.restore();
    });

    it('should give print_response any error returned by the function', function() {
      var params = [];
      var obj = new Error('test');
      var func = function() {
        return obj;
      };
      var print_response = sinon.stub(utils, 'print_response');

      utils.execute({}, func, params);
      expect(print_response.called).to.be.true;
      expect(print_response.calledWith(obj)).to.be.true;

      print_response.restore();
    });
	});

  describe('_set_settings', function() {
    it('should call cb with no error and api_key on success', function(done) {
      var open = sinon.stub(fs, 'open', function(path, opt, cb) {
        cb(null);
      });
      var write = sinon.stub(fs, 'write', function(fd, str, cb) {
        cb(null);
      });
      var new_settings = {
        creds: {
          api_key: 'test-api-key',
        },
        cache: {},
      };

      utils._set_settings(new_settings, function(err, settings) {
        expect(err).to.not.be.ok;
        expect(settings).to.eql(new_settings);
        open.restore();
        write.restore();
        done();
      });
		});

    it('should call cb with an error on failure', function(done) {
      var error1 = new Error('one');
      var open = sinon.stub(fs, 'open', function(path, opt, cb) {
        cb(error1);
      });
      var write = sinon.stub(fs, 'write', function(fd, str, cb) {
        cb();
      });
      var new_settings = {
        creds: {
          api_key: 'test-api-key',
        },
        cache: {},
      };

      utils._set_settings(new_settings, function(err1, settings) {
        expect(err1).to.equal(error1);
        open.restore();
        write.restore();

        var error2 = new Error('two');
        open = sinon.stub(fs, 'open', function(path, opt, cb) {
          cb();
        });
        write = sinon.stub(fs, 'write', function(fd, str, cb) {
          cb(error2);
        });

        utils._set_settings(new_settings, function(err2, settings) {
          expect(err2).to.equal(error2);
          open.restore();
          write.restore();
          done();
        });
      });
		});

    it('should throw an error on failure if cb is not given', function() {
      var error1 = new Error('one');
      var open = sinon.stub(fs, 'open', function(path, opt, cb) {
        cb(error1);
      });
      var write = sinon.stub(fs, 'write', function(fd, str, cb) {
        cb();
      });
      var new_settings = {
        creds: {
          api_key: 'test-api-key',
        },
        cache: {},
      };

      expect(utils._set_settings.bind(null, new_settings)).to.throw(error1);
      open.restore();
      write.restore();

      var error2 = new Error('two');
      open = sinon.stub(fs, 'open', function(path, opt, cb) {
        cb();
      });
      write = sinon.stub(fs, 'write', function(fd, str, cb) {
        cb(error2);
      });

      expect(utils._set_settings.bind(null, new_settings)).to.throw(error2);
      open.restore();
      write.restore();
		});

    it('should populate the cache and creds fields with a blank object if they aren\'t specified', function(done) {
      var open = sinon.stub(fs, 'open', function(path, opt, cb) {
        cb();
      });
      var write = sinon.stub(fs, 'write', function(fd, str, cb) {
        cb();
      });
      var new_settings = {};

      utils._set_settings(new_settings, function(err, settings) {
        expect(err).to.not.be.ok;
        expect(settings.cache).to.eql({});
        expect(settings.creds).to.eql({});
        open.restore();
        write.restore();
        done();
      });
		});

    it('should write to a file', function(done) {
      var open = sinon.stub(fs, 'open', function(path, opt, cb) {
        expect(path).to.match(/\.cloudhealthapi\.json/);
        cb();
      });
      var write = sinon.stub(fs, 'write', function(fd, str, cb) {
        expect(str).to.equal(JSON.stringify(new_settings));
        cb();
      });
      var new_settings = {
        creds: {
          api_key: 'test-api-key',
        },
        cache: {},
      };

      utils._set_settings(new_settings, function(err, settings) {
        expect(open.called).to.be.true;
        expect(write.called).to.be.true;
        open.restore();
        write.restore();
        done();
      });
		});
	});

  describe('_get_settings', function() {
    it('should read from a file', function(done) {
      var readFile = sinon.stub(fs, 'readFile', function(path, cb) {
        expect(path).to.match(/\.cloudhealthapi\.json/);
        cb(null, '{"thing": "thing"}');
      });

      utils._get_settings(function(err, settings) {
        expect(readFile.called).to.be.true;
        readFile.restore();
        done();
      });
		});

    it('should call cb with no error and an object on success', function(done) {
      var readFile = sinon.stub(fs, 'readFile', function(path, cb) {
        cb(null, '{"thing": "thing"}');
      });

      utils._get_settings(function(err, settings) {
        expect(err).to.not.be.ok;
        expect(settings).to.eql({thing: "thing"});
        readFile.restore();
        done();
      });
		});

    it('should call cb with an error on failure', function(done) {
      var error = new Error('err');
      var readFile = sinon.stub(fs, 'readFile', function(path, cb) {
        cb(error);
      });

      utils._get_settings(function(err, settings) {
        expect(err).to.equal(error);
        readFile.restore();
        done();
      });
		});

    it('should call _set_settings if the file doesn\'t exist', function(done) {
      var error = new Error('err');
      error.code = 'ENOENT';
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var readFile = sinon.stub(fs, 'readFile', function(path, cb) {
        cb(error);
      });

      utils._get_settings(function(err, settings) {
        expect(err).to.not.be.ok;
        expect(_set_settings.called).to.be.true;
        _set_settings.restore();
        readFile.restore();
        done();
      });
    });

	});

  describe('set_api_key', function() {
    var CHAPI_KEY, set_creds;

    before(function() {
      CHAPI_KEY = process.env['CHAPI_KEY'];
    });

    beforeEach(function() {
      set_creds = sinon.stub(utils, 'set_creds');
    });

    it('should set the CHAPI_KEY environment variable', function(done) {
      var api_key = 'test';
      set_creds.yields(null, api_key);
      utils.set_api_key(api_key, (err, new_api_key) => {
        expect(process.env['CHAPI_KEY']).to.equal(api_key);
        done();
      });
    });

    it('should call the callback with the api key that was set', function(done) {
      var api_key = 'test';
      set_creds.yields(null, api_key);
      utils.set_api_key(api_key, (err, new_api_key) => {
        expect(err).to.not.be.ok;
        expect(api_key).to.equal(new_api_key);
        done();
      });
    });

    it('should call the callback with any errors passed back by set_creds', function(done) {
      var api_key = 'test123';
      var error = new Error('test');
      set_creds.yields(error, api_key);
      utils.set_api_key(api_key, (err, new_api_key) => {
        expect(err).to.equal(error);
        expect(new_api_key).to.equal(api_key);
        done();
      });
    });

    it('should yield an error if no api_key was given', function(done) {
      utils.set_api_key(undefined, (err, new_api_key) => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

    afterEach(function() {
      set_creds.restore();
    })

    after(function() {
      process.env['CHAPI_KEY'] = CHAPI_KEY;
    });
  });

  describe('find_api_key', function() {
    var CHAPI_KEY, find_creds;

    beforeEach(function() {
      find_creds = sinon.stub(utils, 'find_creds');
    });

    before(function() {
      CHAPI_KEY = process.env['CHAPI_KEY'];
    });

    it('should yield the api key if CHAPI_KEY is set', function(done) {
      var api_key = 'test123';
      process.env['CHAPI_KEY'] = api_key;

      utils.find_api_key((err, found_api_key) => {
        expect(err).to.not.be.ok;
        expect(api_key).to.equal(found_api_key);
        done();
      });
    });

    it('should yield the api_key if only the settings file contains the key', function(done) {
      var api_key = 'test123';
      delete process.env['CHAPI_KEY'];
      find_creds.yields(null, {api_key: api_key});

      utils.find_api_key((err, new_api_key) => {
        expect(err).to.not.be.ok;
        expect(new_api_key).to.equal(api_key);
        done();
      });
    });

    it('should call the callback with an error if the api_key was not set', function(done) {
      delete process.env['CHAPI_KEY'];
      find_creds.yields(null, {});
      utils.find_api_key((err, found_api_key) => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

    it('should call find_creds if CHAPI_KEY is not set', function(done) {
      delete process.env['CHAPI_KEY'];
      var error = new Error('test');
      find_creds.yields(error);
      utils.find_api_key((err, found_api_key) => {
        expect(err).to.equal(error);
        done();
      });
    });

    afterEach(function() {
      find_creds.restore();
    })

    after(function() {
      process.env['CHAPI_KEY'] = CHAPI_KEY;
    });
  });

  describe('set_creds', function() {
    it('should call cb with no error and creds object on success', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_api_key = 'test-api-key';

      utils.set_creds(test_api_key, function(err, creds) {
        expect(err).to.not.be.ok;
        expect(creds).to.eql({api_key: test_api_key});
        _get_settings.restore();
        _set_settings.restore();
        done();
      });
		});

    it('should call _get_settings and _set_settings', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_api_key = 'test-api-key';

      utils.set_creds(test_api_key, function(err, creds) {
        expect(_get_settings.called).to.be.true;
        expect(_set_settings.called).to.be.true;
        _get_settings.restore();
        _set_settings.restore();
        done();
      });
    });

    it('should call cb with an error on failure', function(done) {
      var error1 = new Error('one');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error1);
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_api_key = 'test-api-key';

      utils.set_creds(test_api_key, function(err1, creds) {
        expect(err1).to.equal(error1);
        _get_settings.restore();
        _set_settings.restore();

        var error2 = new Error('two');
        _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
          cb(null, {creds: {}, cache: {}});
        });
        _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
          cb(error2);
        });

        utils.set_creds(test_api_key, function(err2, api_key) {
          expect(err2).to.equal(error2);
          _get_settings.restore();
          _set_settings.restore();
          done();
        });
      });
		});

    it('should throw an error on failure if cb is not given', function() {
      var error1 = new Error('one');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error1);
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_api_key = 'test-api-key';

      expect(utils.set_creds.bind(utils)).to.throw(Error);
      _get_settings.restore();
      _set_settings.restore();

      var error2 = new Error('two');
      _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(error2);
      });

      expect(utils.set_creds.bind(utils)).to.throw(Error);
      _get_settings.restore();
      _set_settings.restore();
		});
	});

  describe('find_creds', function() {
    it('should call _get_settings', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });

      utils.find_creds(function(err, creds) {
        expect(_get_settings.called).to.be.true;
        _get_settings.restore();
        done();
      });
    });

    it('should call cb with no error and an object on success', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {api_key: '1234'}, cache: {}});
      });

      utils.find_creds(function(err, creds) {
        expect(err).to.not.be.ok;
        expect(creds).to.eql({api_key: '1234'});
        _get_settings.restore();
        done();
      });
		});

    it('should call cb with an error on failure', function(done) {
      var error = new Error('err');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error);
      });

      utils.find_creds(function(err, creds) {
        expect(err).to.equal(error);
        _get_settings.restore();
        done();
      });
		});
	});

  describe('set_cache', function() {
    it('should call cb with no error and creds object on success', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_cache_name = 'test';
      var test_cache = 'myTest';

      utils.set_cache(test_cache_name, test_cache, function(err, cache) {
        expect(err).to.not.be.ok;
        expect(cache).to.eql(test_cache);
        _get_settings.restore();
        _set_settings.restore();
        done();
      });
		});

    it('should call _get_settings and _set_settings', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_cache_name = 'test';
      var test_cache = 'myTest';

      utils.set_cache(test_cache_name, test_cache, function(err, cache) {
        expect(_get_settings.called).to.be.true;
        expect(_set_settings.called).to.be.true;
        _get_settings.restore();
        _set_settings.restore();
        done();
      });
    });

    it('should call cb with an error on failure', function(done) {
      var error1 = new Error('one');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error1);
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_cache_name = 'test';
      var test_cache = 'myTest';

      utils.set_cache(test_cache_name, test_cache, function(err1, cache) {
        expect(err1).to.equal(error1);
        _get_settings.restore();
        _set_settings.restore();

        var error2 = new Error('two');
        _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
          cb(null, {creds: {}, cache: {}});
        });
        _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
          cb(error2);
        });

        utils.set_cache(test_cache_name, test_cache, function(err2, cache) {
          expect(err2).to.equal(error2);
          _get_settings.restore();
          _set_settings.restore();
          done();
        });
      });
		});

    it('should throw an error on failure if cb is not given', function() {
      var error1 = new Error('one');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error1);
      });
      var _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(null, settings);
      });
      var test_cache_name = 'test';
      var test_cache = 'myTest';

      expect(utils.set_cache.bind(utils)).to.throw(Error);
      _get_settings.restore();
      _set_settings.restore();

      var error2 = new Error('two');
      _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      _set_settings = sinon.stub(utils, '_set_settings', function(settings, cb) {
        cb(error2);
      });

      expect(utils.set_cache.bind(utils)).to.throw(Error);
      _get_settings.restore();
      _set_settings.restore();
		});
	});

  describe('find_cache', function() {
    it('should call _get_settings', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {}});
      });
      var test_cache_name = 'test';

      utils.find_cache(test_cache_name, function(err, cache) {
        expect(_get_settings.called).to.be.true;
        _get_settings.restore();
        done();
      });
    });

    it('should call cb with no error and an object on success', function(done) {
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(null, {creds: {}, cache: {test: 'myTest'}});
      });
      var test_cache_name = 'test';

      utils.find_cache(test_cache_name, function(err, cache) {
        expect(err).to.not.be.ok;
        expect(cache).to.eql('myTest');
        _get_settings.restore();
        done();
      });
		});

    it('should call cb with an error on failure', function(done) {
      var error = new Error('err');
      var _get_settings = sinon.stub(utils, '_get_settings', function(cb) {
        cb(error);
      });
      var test_cache_name = 'test';

      utils.find_cache(test_cache_name, function(err, cache) {
        expect(err).to.equal(error);
        _get_settings.restore();
        done();
      });
		});
	});

  describe('parse_chapi', function() {
    it('should return an array containing an object as the first parameter', function() {
      var params = [
        '--one=1',
      ];

      var result = utils.parse_chapi(params);

      expect(Array.isArray(result)).to.be.true;
      expect(typeof result[0]).to.equal('object');
      expect(result).to.eql([{one: "1"}]);
		});

    it('return array should contain all non-key-value pairs as the 2nd, 3rd, ... elements', function() {
      var params = [
        'abcdefg',
        '--one=1',
        '2048735',
      ];

      var result = utils.parse_chapi(params);

      expect(Array.isArray(result)).to.be.true;
      expect(result[0]).to.eql({one: "1"});
      expect(result[1]).to.equal('abcdefg');
      expect(result[2]).to.equal('2048735');
		});

    it('first param object should contain all key-value pairs given in params', function() {
      var params = [
        '--one=1',
        '--two_=two',
      ];

      var result = utils.parse_chapi(params);

      expect(result[0]).to.eql({one: "1", two_: "two"});
		});

    it('should properly parse values with spaces', function() {
      var params = [
        '--one= 1',
        '--two= 2 ',
        '--three=th  r ee',
        '--four= f o u r ',
      ];

      var result = utils.parse_chapi(params);

      expect(result[0]).to.eql({one: " 1", two: " 2 ", three: "th  r ee", four: " f o u r "});
		});

    it('first param object should contain key=true for each key-value pair missing a value', function() {
      var params = [
        '--one',
        '--two=true',
        '--three=false',
      ];

      var result = utils.parse_chapi(params);

      expect(result[0]).to.eql({one: "true", two: "true", three: "false"});
		});
	});

  describe('run', function() {
    var fork, accessSync, print_response, exit, script_process;

    beforeEach(function() {
      script_process = new EventEmitter();
      fork = sinon.stub(child_process, 'fork');
      fork.returns(script_process);
      accessSync = sinon.stub(fs, 'accessSync');
      print_response = sinon.stub(utils, 'print_response');
      exit = sinon.stub(process, 'exit');
    });

    it('should print an error and exit if the script to run doesn\'t exist', function() {
      var error = new Error('test');
      accessSync.throws(error);

      utils.run('test');

      expect(print_response.called).to.be.true;
    });

    it('should call fork to create a new child process for the script', function() {
      utils.run('test');

      expect(fork.called).to.be.true;
    });

    it('should call print_response on any errors thrown by the script', function() {
      utils.run('test');
      var error = new Error('test');
      script_process.emit('error', error);

      expect(print_response.called).to.be.true;
      expect(print_response.calledWith(error)).to.be.true;
    });

    it('should call print_response with an error if the script exits with a nonzero status code', function() {
      utils.run('test');
      var statusCode = 1;
      script_process.emit('exit', statusCode);

      expect(print_response.called).to.be.true;
    });

    it('should throw no errors, print nothing, and return an EventEmitter if the script runs without error', function() {
      var e = utils.run('test');
      script_process.emit('exit', 0);

      expect(print_response.called).to.be.false;
      expect(e instanceof EventEmitter).to.be.true;
    });

    it('should only respond to the first error emitted by the executed script', function() {
      utils.run('test');
      var error = new Error('test1');
      script_process.emit('error', error);
      script_process.emit('error', new Error('test2'));

      expect(print_response.calledOnce).to.be.true;
      expect(print_response.calledWith(error)).to.be.true;
    });

    it('should only respond to the first exit event emitted by the executed script', function() {
      utils.run('test');
      script_process.emit('exit', 1);
      script_process.emit('exit', 1);

      expect(print_response.calledOnce).to.be.true;
    });

    afterEach(function() {
      fork.restore();
      accessSync.restore();
      print_response.restore();
      exit.restore();
    });
	});

  describe('get_package_json', function() {
    var readFile, parse;

    beforeEach(function() {
      readFile = sinon.stub(fs, 'readFile');
    });

    it('should read from a file', function(done) {
      readFile.yields(null, "{}");

      utils.get_package_json(function(err, json) {
        expect(readFile.called).to.be.true;
        done();
      });
		});

    it('should call cb with no error and an object on success', function(done) {
      var package_json = {
        test: "test",
      };
      readFile.yields(null, JSON.stringify(package_json));

      utils.get_package_json(function(err, json) {
        expect(err).to.not.be.ok;
        expect(json).to.eql(package_json);
        done();
      });
		});

    it('should call cb with an error on failure to read file', function(done) {
      var error = new Error('err');
      readFile.yields(error);

      utils.get_package_json(function(err, json) {
        expect(err).to.equal(error);
        done();
      });
		});

    it('should call cb with an error on failure to parse package.json contents', function(done) {
      var package_json = JSON.stringify({
        test: "test",
      });
      var error = new Error('err');
      parse = sinon.stub(JSON, "parse");
      parse.throws(error);
      readFile.yields(null, package_json);

      utils.get_package_json(function(err, json) {
        expect(err).to.equal(error);
        expect(package_json).to.equal(json);
        done();
      });
		});

    afterEach(function() {
      readFile.restore();
      try {
        parse.restore();
      }
      catch (e) {}
    });
	});

  describe('print_response', function() {
    var mode;
    before(function() {
      mode = process.env['CHAPI_DEV_MODE'];
    });

    beforeEach(function() {
      process.env['CHAPI_DEV_MODE'] = true;
    })

    it('should throw an error if called with an error', function() {
      var print_response = utils.print_response.bind(null, new Error('test'));
      expect(print_response).to.throw(Error);
		});

    it('should print json if an error occurs and json is not null', function(done) {
      var error = sinon.stub(console, 'error', function(str) {
        error.restore();
        expect(str).to.equal('test');
        done();
      });
      try {
        utils.print_response(new Error(), 'test');
      }
      catch (err) {
      }
		});

    it('should call JSON.stringify on the given object', function(done) {
      var log = sinon.stub(console, 'log', function(str) {});
      var stringify = sinon.stub(JSON, 'stringify', function(str) {
        stringify.restore();
        log.restore();
        done();
      });
      utils.print_response(null, '{}');
		});

    it('should call console log if err is not given', function(done) {
      var log = sinon.stub(console, 'log', function(str) {
        log.restore();
        expect(str).to.equal("{}");
        done();
      });
      utils.print_response(null, {});
		});

    it('should not throw an error if CHAPI_DEV_MODE is not true', function(done) {
      delete process.env['CHAPI_DEV_MODE'];

      var msg = 'test';
      var error = sinon.stub(console, 'error', function(str) {
        expect(str).to.equal(msg);
        error.restore();
        done();
      });

      try {
        utils.print_response(new Error(msg));
      }
      catch (e) {
        expect('Custom message: an error was thrown').to.be.false;
      }
    });

    after(function() {
      process.env['CHAPI_DEV_MODE'] = mode;
    });
	});

  describe('send_request', function() {
    beforeEach(function() {
      https.request.reset();
    });

    it('should call https.request', function() {
      var req = new EventEmitter();
      req.end = function(){};
      https.request.returns(req);

      utils.send_request({}, null, function(){});

      expect(https.request.called).to.be.true;
    });

    it('should pass the options object to https.request', function() {
      var req = new EventEmitter();
      req.end = function(){};
      https.request.returns(req);
      var options = {
        test: 'test',
      };

      utils.send_request(options, null, function(){});

      expect(https.request.args[0][0]).to.equal(options);
    });

    it('should return an error when https.request fails', function(done) {
      var req = new EventEmitter();
      req.end = function(){};
      https.request.returns(req);

      utils.send_request({}, null, function(err, json){
        expect(err).to.not.be.null;
        done();
      });

      req.emit('error', 'test message');
    });

    it('should return an error when the response code is not 200', function(done) {
      var req = new EventEmitter();
      req.end = function(){};

      var res = new EventEmitter();
      res.setEncoding = function(){};
      res.statusCode = 404;

      https.request.returns(req);
      https.request.callsArgWith(1, res);

      utils.send_request({}, null, function(err, json){
        expect(err).to.not.be.null;
        done();
      });

      res.emit('end');
    });

    it('should call the callback with the response payload object on success', function(done) {
      var payload = {
        test: 'test',
      };

      var req = new EventEmitter();
      req.end = function(){};

      var res = new EventEmitter();
      res.setEncoding = function(){};
      res.statusCode = 200;

      https.request.returns(req);
      https.request.callsArgWith(1, res);

      utils.send_request({}, null, function(err, json){
        expect(err).to.be.null;
        expect(json).to.eql(payload);
        expect(typeof json).to.equal('object');
        expect(Array.isArray(json)).to.be.false;
        done();
      });

      res.emit('data', JSON.stringify(payload));
      res.emit('end');
    });

    it('should return only headers when flags.headers is true', function(done) {
      var options = {};
      var flags = {headers: true};
      var headers = {
        link: "<https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=5>; rel=\"last\", <https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=2>; rel=\"next\"",
        'x-per-page': '30',
        'x-total': '170',
      };

      var req = new EventEmitter();
      req.end = function(){};

      var res = new EventEmitter();
      res.setEncoding = function(){};
      res.statusCode = 200;
      res.headers = headers;

      https.request.returns(req);
      https.request.callsArgWith(1, res);

      utils.send_request(flags, options, null, function(err, result){
        expect(err).to.be.null;
        expect(result).to.eql(headers);
        done();
      });

      res.emit('end');
    });

    it('should send the send_data object as is if given', function() {
      var send_data = JSON.stringify({
        test: 'test',
      });

      var req = new EventEmitter();
      req.end = function(){};
      req.write = sinon.spy();

      https.request.returns(req);

      utils.send_request({}, send_data, function(){});

      expect(req.write.calledOnce);
      expect(req.write.args[0][0]).to.equal(send_data);
    });

    it('should treat the third arg as callback if it\'s a function', function(done) {
      var req = new EventEmitter();
      req.end = function(){};

      var res = new EventEmitter();
      res.setEncoding = function(){};
      res.statusCode = 200;

      https.request.returns(req);
      https.request.callsArgWith(1, res);

      utils.send_request({}, null, function(err, json){
        done();
      });

      res.emit('end');
    });

    it('should stringify send_data that is not already a string', function(done) {
      var req = new EventEmitter();
      req.end = function(){};
      req.write = sinon.stub();

      var res = new EventEmitter();
      res.setEncoding = function(){};
      res.statusCode = 200;

      https.request.returns(req);
      https.request.callsArgWith(1, res);

      utils.send_request({}, {test: "test"}, function(err, json){
        expect(req.write.calledWith('{"test":"test"}')).to.be.true;
        done();
      });

      res.emit('end');
    });
  });

  describe('_options', function() {
    it('should accept null/undefined in place of path', function() {
      var options = utils._options('/test', 'GET', undefined, [], '1234');

      expect(options).to.eql({
        host: 'chapi.cloudhealthtech.com',
        port: 443,
        path: '/test?api_key=1234',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
    });

    it('should accept a path without any parameters', function() {
      var options = utils._options('/test', 'GET', '/other', [], '1234');

      expect(options).to.eql({
        host: 'chapi.cloudhealthtech.com',
        port: 443,
        path: '/test/other?api_key=1234',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
    });

    it('should accept a path with parameters', function() {
      var options = utils._options('/test', 'GET', '/other', ['test=false'], '1234');

      expect(options).to.eql({
        host: 'chapi.cloudhealthtech.com',
        port: 443,
        path: '/test/other?test=false&api_key=1234',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
    });

    it('should capitalize the method', function() {
      var options = utils._options('/test', 'post', '/other', ['test=true'], '1234');

      expect(options).to.eql({
        host: 'chapi.cloudhealthtech.com',
        port: 443,
        path: '/test/other?test=true&api_key=1234',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
    });
  });
});
