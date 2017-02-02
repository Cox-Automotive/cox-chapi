var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var CloudHealth = require('../../..');
var utils = CloudHealth.utils;
var fs = require('fs');
var tty = require('tty');
var commands = proxyquire('../../../utils/commands', {
  'fs': fs,
  '..': CloudHealth,
  'tty': tty,
});

describe('chapi commands', function() {
  describe('make_api_call', function() {
    var find_api_key, execute, resolve_component, resolve_func;

    beforeEach(function() {
      find_api_key = sinon.stub(utils, 'find_api_key');
      execute = sinon.stub(utils, 'execute');
      resolve_component = sinon.stub(commands, 'resolve_component');
      resolve_func = sinon.stub(commands, 'resolve_func');
    });

    it('should get the api_key', function(done) {
      var test_func = function() {};
      var test_component = {
        func: test_func,
      };
      find_api_key.yields(null, '1234');
      resolve_component.returns(test_component);
      resolve_func.returns(test_func);
      execute.callsArg(3);

      commands.make_api_call('component', 'func', ['param1'], (err, result) => {
        expect(find_api_key.called).to.be.true;
        done();
      });
    });

    it('should yield an error if getting the api_key fails', function(done) {
      var error = new Error('test');
      find_api_key.yields(error);

      commands.make_api_call('component', 'func', ['param1'], (err, result) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should yield an error if execute fails', function(done) {
      var error = new Error('test');
      var test_func = function() {};
      var test_component = {
        func: test_func,
      };
      find_api_key.yields(null, '1234');
      resolve_component.returns(test_component);
      resolve_func.returns(test_func);
      execute.callsArgWith(3, error);

      commands.make_api_call('component', 'func', ['param1'], (err, result) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should call execute with a component, function, params, and callback', function(done) {
      var test_func = function() {};
      var test_component = {
        func: test_func,
      };
      var params = ['test'];
      find_api_key.yields(null, '1234');
      resolve_component.returns(test_component);
      resolve_func.returns(test_func);
      execute.callsArg(3);

      var cb = (err, result) => {
        expect(err).to.not.be.ok;
        expect(execute.calledWith(test_component, test_func, params, cb));
        done();
      };

      commands.make_api_call('component', 'func', params, cb);
    });

    it('should yield the result of calling func on component with params', function(done) {
      var test_func = function() {
        return 'test';
      };
      var test_component = {
        func: test_func,
      };
      find_api_key.yields(null, '1234');
      resolve_component.returns(test_component);
      resolve_func.returns(test_func);
      execute.callsArgWith(3, null, test_func());

      commands.make_api_call('component', 'func', ['param1'], (err, result) => {
        expect(result).to.equal('test');
        done();
      });
    })

    afterEach(function() {
      find_api_key.restore();
      execute.restore();
      resolve_component.restore();
      resolve_func.restore();
    });
	});

  describe('resolve_component', function() {
    it('should resolve to account properly', function() {
      var result = commands.resolve_component('acct', '1234');
      expect(result.constructor.name).to.equal('Account');

      result = commands.resolve_component('account', '1234');
      expect(result.constructor.name).to.equal('Account');

      result = commands.resolve_component('accounts', '1234');
      expect(result.constructor.name).to.equal('Account');
    });

    it('should resolve to asset properly', function() {
      var result = commands.resolve_component('asst', '1234');
      expect(result.constructor.name).to.equal('Asset');

      result = commands.resolve_component('asset', '1234');
      expect(result.constructor.name).to.equal('Asset');

      result = commands.resolve_component('assets', '1234');
      expect(result.constructor.name).to.equal('Asset');
    });

    it('should resolve to perspective properly', function() {
      var result = commands.resolve_component('pers', '1234');
      expect(result.constructor.name).to.equal('Perspective');

      result = commands.resolve_component('perspective', '1234');
      expect(result.constructor.name).to.equal('Perspective');

      result = commands.resolve_component('perspectives', '1234');
      expect(result.constructor.name).to.equal('Perspective');
    });

    it('should resolve to tag properly', function() {
      var result = commands.resolve_component('tag', '1234');
      expect(result.constructor.name).to.equal('Tag');

      result = commands.resolve_component('tags', '1234');
      expect(result.constructor.name).to.equal('Tag');

      result = commands.resolve_component('tagging', '1234');
      expect(result.constructor.name).to.equal('Tag');
    });

    it('should resolve to report properly', function() {
      var result = commands.resolve_component('report', '1234');
      expect(result.constructor.name).to.equal('Report');

      result = commands.resolve_component('reports', '1234');
      expect(result.constructor.name).to.equal('Report');

      result = commands.resolve_component('reporting', '1234');
      expect(result.constructor.name).to.equal('Report');
    });

    it('should return an error if no match is found', function() {
      var result = commands.resolve_component('flibby', '1234');
      expect(result instanceof Error).to.be.true;
    });

    it('should capitalize the first letter and lowercase the rest of the input', function() {
      var result = commands.resolve_component('flibby', '1234');
      expect(result.message).to.match(/^Flibby/);
    });
	});

  describe('resolve_inputs', function() {
    var show_help, set_api_key, run_script, show_version, use_api;

    beforeEach(function() {
      show_help = sinon.stub(commands, 'show_help');
      set_api_key = sinon.stub(commands, 'set_api_key');
      run_script = sinon.stub(commands, 'run_script');
      show_version = sinon.stub(commands, 'show_version');
      use_api = sinon.stub(commands, 'use_api');
    });

    it('should treat no input as "help"', function() {
      var args = [];

      commands.resolve_inputs(args);

      expect(show_help.called).to.be.true;
    });

    it('should resolve to "help" properly', function() {
      var args = ['help'];
      commands.resolve_inputs(args);
      expect(show_help.called).to.be.true;
      show_help.reset();

      var args = ['--help'];
      commands.resolve_inputs(args);
      expect(show_help.called).to.be.true;
      show_help.reset();

      var args = ['usage'];
      commands.resolve_inputs(args);
      expect(show_help.called).to.be.true;
      show_help.reset();

      var args = ['--usage'];
      commands.resolve_inputs(args);
      expect(show_help.called).to.be.true;
    });

    it('should resolve to "run" properly', function() {
      var args = ['run'];
      commands.resolve_inputs(args);
      expect(run_script.called).to.be.true;
      run_script.reset();

      var args = ['script'];
      commands.resolve_inputs(args);
      expect(run_script.called).to.be.true;
      run_script.reset();

      var args = ['exec'];
      commands.resolve_inputs(args);
      expect(run_script.called).to.be.true;
      run_script.reset();

      var args = ['execute'];
      commands.resolve_inputs(args);
      expect(run_script.called).to.be.true;
      run_script.reset();

      var args = ['-R'];
      commands.resolve_inputs(args);
      expect(run_script.called).to.be.true;
    });

    it('should resolve to "set_api_key" properly', function() {
      var args = ['set_api_key'];
      commands.resolve_inputs(args);
      expect(set_api_key.called).to.be.true;
      set_api_key.reset();

      args = ['set-api-key'];
      commands.resolve_inputs(args);
      expect(set_api_key.called).to.be.true;
      set_api_key.reset();

      args = ['set_key'];
      commands.resolve_inputs(args);
      expect(set_api_key.called).to.be.true;
      set_api_key.reset();

      args = ['set-key'];
      commands.resolve_inputs(args);
      expect(set_api_key.called).to.be.true;
      set_api_key.reset();

      args = ['-A'];
      commands.resolve_inputs(args);
      expect(set_api_key.called).to.be.true;
    });

    it('should resolve to "version" properly', function() {
      var args = ['version'];
      commands.resolve_inputs(args);
      expect(show_version.called).to.be.true;
      show_version.reset();

      var args = ['--version'];
      commands.resolve_inputs(args);
      expect(show_version.called).to.be.true;
      show_version.reset();

      var args = ['-V'];
      commands.resolve_inputs(args);
      expect(show_version.called).to.be.true;
    });

    it('should default to calling the api', function() {
      var args = ['test123'];
      commands.resolve_inputs(args);
      expect(use_api.called).to.be.true;
    });

    afterEach(function() {
      show_help.restore();
      set_api_key.restore();
      run_script.restore();
      show_version.restore();
      use_api.restore();
    });
	});

  describe('resolve_func', function() {
    it('should return an error if the function starts with "_"', function() {
      var _func = function() {};
      var component = {
        _func: _func,
      };

      var result = commands.resolve_func(component, "_func");

      expect(result).to.be.instanceof(Error);
    });

    it('should return an error if the function doesn\'t exist', function() {
      var component = {};

      var result = commands.resolve_func(component, "func");

      expect(result).to.be.instanceof(Error);
    });

    it('should return the function on success', function() {
      var func = function() {};
      var component = {
        func: func,
      };

      var result = commands.resolve_func(component, "func");

      expect(result).to.equal(func);
    });
	});

  describe('run_script', function() {
    var run;

    beforeEach(function() {
      run = sinon.stub(utils, 'run');
    });

    it('should call utils.run with the given args', function() {
      var name = 'script';
      var args = ['one', 'two', 'three'];

      commands.run_script(name, ...args);

      expect(run.calledWith(name, ...args)).to.be.true;
    });

    afterEach(function() {
      run.restore();
    })
	});

  describe('set_api_key', function() {
    var set_api_key, print_response;

    beforeEach(function() {
      set_api_key = sinon.stub(utils, 'set_api_key');
      print_response = sinon.stub(utils, 'print_response');
    });

    it('should print an error when utils.set_api_key fails', function() {
      var api_key = '1234';
      var error = new Error('test');
      set_api_key.yields(error);

      commands.set_api_key(api_key);

      expect(set_api_key.called).to.be.true;
      expect(print_response.called).to.be.true;
      expect(print_response.args[0][0]).to.equal(error);
    });

    it('should call utils.set_api_key and print a message on success', function() {
      var api_key = '1234';
      set_api_key.yields(null, api_key);

      commands.set_api_key(api_key);

      expect(set_api_key.called).to.be.true;
      expect(print_response.called).to.be.true;
      expect(print_response.args[0][0]).to.not.be.ok;
    });

    afterEach(function() {
      set_api_key.restore();
      print_response.restore();
    });
	});

  describe('show_help', function() {
    var error;

    beforeEach(function() {
      error = sinon.stub(console, 'error');
    });

    it('should print a message', function() {
      commands.show_help();

      expect(error.called).to.be.true;
    });

    afterEach(function() {
      error.restore();
    });
	});

  describe('show_version', function() {
    var get_package_json, print_response;

    beforeEach(function() {
      get_package_json = sinon.stub(utils, 'get_package_json');
      print_response = sinon.stub(utils, 'print_response');
    });

    it('should access package.json', function() {
      commands.show_version();

      expect(get_package_json.called).to.be.true;
    });

    it('should print any error when accessing package.json', function() {
      var error = new Error('test');
      get_package_json.yields(error);

      commands.show_version();

      expect(get_package_json.called).to.be.true;
      expect(print_response.called).to.be.true;
      expect(print_response.args[0][0]).to.equal(error);
    });

    it('should print a message on success', function() {
      get_package_json.yields(null, {});

      commands.show_version();

      expect(get_package_json.called).to.be.true;
      expect(print_response.called).to.be.true;
      expect(print_response.args[0][0]).to.not.be.ok;
      expect(typeof print_response.args[0][1]).to.equal('string');
    });

    afterEach(function() {
      get_package_json.restore();
      print_response.restore();
    });
	});

  describe('use_api', function() {
    var print_response, isatty, make_api_call, read_stdin, _parse_stdin_data;

    beforeEach(function() {
      print_response = sinon.stub(utils, 'print_response');
      isatty = sinon.stub(tty, 'isatty');
      make_api_call = sinon.stub(commands, 'make_api_call');
      read_stdin = sinon.stub(utils, 'read_stdin');
      _parse_stdin_data = sinon.stub(utils, '_parse_stdin_data');
    });

    it('should call make_api_call and not call read_stdin when no input is piped in', function() {
      isatty.returns(true);
      var args = ['1', '2'];

      commands.use_api(args);

      expect(make_api_call.called).to.be.true;
      expect(read_stdin.called).to.be.false;
    });

    it('should call make_api_call and read_stdin when input is piped in', function() {
      isatty.returns(false);
      read_stdin.yields(null, 'test');
      _parse_stdin_data.returns(['test']);
      var args = ['1', '2'];

      commands.use_api(args);

      expect(make_api_call.called).to.be.true;
      expect(read_stdin.called).to.be.true;
    });

    it('should print any error yielded by read_stdin', function() {
      var error = new Error('test');
      isatty.returns(false);
      read_stdin.yields(error);
      var args = ['1', '2'];

      commands.use_api(args);

      expect(make_api_call.called).to.be.false;
      expect(read_stdin.called).to.be.true;
      expect(print_response.called).to.be.true;
      expect(print_response.args[0][0]).to.equal(error);
    });

    it('should call _parse_stdin_data to parse the input data', function() {
      isatty.returns(false);
      var input_data = 'test';
      read_stdin.yields(null, input_data);
      _parse_stdin_data.returns([input_data]);
      var args = ['1', '2'];

      commands.use_api(args);

      expect(make_api_call.called).to.be.true;
      expect(read_stdin.called).to.be.true;
      expect(_parse_stdin_data.calledWith(input_data)).to.be.true;
    });

    afterEach(function() {
      print_response.restore();
      isatty.restore();
      make_api_call.restore();
      read_stdin.restore();
      _parse_stdin_data.restore();
    });
	});
});
