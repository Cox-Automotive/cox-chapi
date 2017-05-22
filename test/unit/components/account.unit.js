var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var async = {
  parallel: function(){},
};
var utils = require('../../../utils/chapi');
var Account = proxyquire('../../../components/account', {
  'async': async
});
var EventEmitter = require('events');
var real_async = require('async');

describe('Account', function() {
  var a;

  describe('constructor', function() {
    it('should call set_api_key if called with api_key', function() {
      var spy = sinon.spy(Account.prototype, 'set_api_key');

      var a = new Account('my-test-key');

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0]).to.equal('my-test-key');

      spy.restore();
    });
  });

  describe('#_list_all', function() {
    beforeEach(function() {
      a = new Account();
    });

    it('should make a request with the stats flag set to true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(flags.headers).to.be.true;
        done();
      });

      a._list_all(function() {});

      request.restore();
    });

    it('should make a request once for each page plus the call for stats', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        if (flags.headers) {
          var headers = {
            link: "<https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=10>; rel=\"last\", <https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=2>; rel=\"next\"",
            'x-per-page': '5',
            'x-total': '50',
          };
          cb(null, headers);
        }
        else {
          cb(null, {aws_accounts: []});
        }
      });

      // this essentially un-stubs async.parallel just for this test case
      var parallel_stub = sinon.stub(async, 'parallel', function(arr, cb) {
        real_async.parallel(arr, function(err, results) {
          cb(err, results);
        });
      });

      a._list_all(function() {
        expect(request.callCount).to.be.at.least(11);
        parallel_stub.restore();
        done();
      });

      request.restore();
    });

    it('should return an array containing all entries', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        if (flags.headers) {
          var headers = {
            link: "<https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=10>; rel=\"last\", <https://chapi.cloudhealthtech.com/v1/aws_accounts?api_key=somekey&page=2>; rel=\"next\"",
            'x-per-page': '5',
            'x-total': '50',
          };
          cb(null, headers);
        }
        else {
          cb(null, {aws_accounts: ['test']});
        }
      });

      // this essentially un-stubs async.parallel just for this test case
      var parallel_stub = sinon.stub(async, 'parallel', function(arr, cb) {
        real_async.parallel(arr, function(err, results) {
          cb(err, results);
        });
      });

      a._list_all(function(err, accounts) {
        expect(accounts.length).to.equal(10);
        parallel_stub.restore();
        done();
      });

      request.restore();
    });

    it('should return an error if #list returns an error', function(done) {
      var error = new Error('fake error');

      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        cb(error);
      });

      // this essentially un-stubs async.parallel just for this test case
      var parallel_stub = sinon.stub(async, 'parallel', function(arr, cb) {
        real_async.parallel(arr, function(err, results) {
          cb(err, results);
        });
      });

      a._list_all(function(err, json) {
        expect(err).to.be.ok;
        expect(err).to.equal(error);
        parallel_stub.restore();
        done();
      });

      request.restore();
    });

    it('should return an error if async.parallel returns an error', function(done) {
      var error = new Error('fake error');

      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        cb(null, {aws_accounts: []});
      });

      var parallel_stub = sinon.stub(async, 'parallel');
      async.parallel.callsArgWith(1, error);

      a._list_all(function(err, json) {
        expect(err).to.be.ok;
        expect(err).to.equal(error);
        parallel_stub.restore();
        done();
      });

      request.restore();
    });
  });

  describe('#set_api_key', function() {
    it('should set the api key', function() {
      var a = new Account();
      var str = 'my-new-api-key';
      a.set_api_key(str);
      expect(a._api_key).to.equal(str);
    });
  });

  describe('#list', function() {
    before(function() {
      a = new Account();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.list({}, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Account('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.list({}, function(err, json) {});

      request.restore();
    });

    it('should call #_list_all if the "all" flag is true', function(done) {
      var list_all = sinon.spy(a, '_list_all');

      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(list_all.called).to.be.true;
        done();
      });

      a.list({all: true}, function(err, json) {});

      list_all.restore();
      request.restore();
    });

    it('should treat the first arg as callback if it\'s a function', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        cb(null, {});
      });

      a.list(function(err, json) {
        done();
      });

      request.restore();
    });

    it('should set flags.headers to true if the stats flag is true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(flags.headers).to.be.true;
        done();
      });

      a.list({stats: true}, function(err, json) {});

      request.restore();
    });

    it('should specify the page with the page flag\'s value, if set', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(options.path).to.match(/.+page=7/);
        done();
      });

      a.list({page: 7}, function(err, json) {});

      request.restore();
    });

    it('should specify the page count with the page count flag\'s value, if set', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(options.path).to.match(/.+page_count=50/);
        done();
      });

      a.list({page_count: 50}, function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      a.list({}, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an array of accounts', function(done) {
      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        cb(null, {aws_accounts: []});
      });

      a.list({}, function(err, accounts) {
        expect(Array.isArray(accounts)).to.be.true;
        done();
      });

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(flags, options, send_data, cb) {
        cb(error);
      });

      a.list({}, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });
  });

  describe('#get', function() {
    before(function() {
      a = new Account();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.get({}, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Account('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.get(1, function(err, json) {});

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      a.get(id, function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      a.get(1, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.get(1, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });
  });

  describe('#find_by', function() {
    var list;

    before(function() {
      a = new Account();
      list = sinon.stub(a, 'list');
    });

    beforeEach(function() {
      list.reset();
    });

    it('should call the callback with no error and an array on success', function(done) {
      var test_field = 'test1';
      var test_value = 'test2';
      var test_list = [];

      a.find_by(test_field, test_value, test_list, (err, result) => {
        expect(err).to.not.be.ok;
        expect(Array.isArray(result)).to.be.true;
        done();
      });
    });

    it('should treat the third argument as a callback if no list is given', function(done) {
      var test_field = 'test1';
      var test_value = 'test2';

      list.yields(null, []);

      a.find_by(test_field, test_value, (err, result) => {
        done();
      });
    });

    it('should call #list if no list is given', function(done) {
      var test_field = 'test1';
      var test_value = 'test2';

      list.yields(null, []);

      a.find_by(test_field, test_value, (err, result) => {
        expect(list.called).to.be.true;
        done();
      });
    });

    it('should call the callback with an error on failure', function(done) {
      var test_field = 'test1';
      var test_value = 'test2';
      var error = new Error();

      list.yields(error);

      a.find_by(test_field, test_value, (err, result) => {
        expect(list.called).to.be.true;
        expect(err).to.equal(error);
        done();
      });
    });

    it('should return only matching accounts', function(done) {
      var test_field = 'test1';
      var test_value = 'test2';

      var matching_acct = {
        [test_field]: test_value,
      };
      var account_one = {
        [test_field]: 'not_test_value',
      };
      var account_two = {
        ['not_test_field']: 'not_test_value',
      };
      var account_three = {
        ['not_test_field']: test_value,
      };
      var fake_list = [
        matching_acct,
        account_one,
        account_two,
        account_three,
      ];

      list.yields(null, fake_list);

      a.find_by(test_field, test_value, (err, result) => {
        expect(err).to.not.be.ok;
        expect(result).to.eql([matching_acct]);
        done();
      });
    });

    after(function() {
      list.restore();
    });
  });

  describe('#create', function() {
    before(function() {
      a = new Account();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.create({}, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Account('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.create({}, function(err, json) {});

      request.restore();
    });

    it('should use the POST http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('POST');
        done();
      });

      a.create({}, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.create({}, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should return any object returned by #_send_request', function(done) {
      var test_json = {
        test: 'test',
      };

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, test_json);
      });

      a.create({}, function(err, json) {
        expect(json).to.equal(test_json);
        done();
      });

      request.restore();
    });
  });

  describe('#update', function() {
    before(function() {
      a = new Account();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.update({id: 1}, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Account('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.update({id: 1}, function(err, json) {});

      request.restore();
    });

    it('should use the PUT http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('PUT');
        done();
      });

      a.update({id: 1}, function(err, json) {});

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      a.update({id: id}, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.update({id: 1}, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should return any object returned by #_send_request', function(done) {
      var test_json = {
        test: 'test',
      };

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, test_json);
      });

      a.update({id: 1}, function(err, json) {
        expect(json).to.equal(test_json);
        done();
      });

      request.restore();
    });
  });

  describe('#destroy', function() {
    before(function() {
      a = new Account();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.destroy(1, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Account('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.destroy(1, function(err, json) {});

      request.restore();
    });

    it('should use the Delete http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('DELETE');
        done();
      });

      a.destroy(1, function(err, json) {});

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      a.destroy(id, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.destroy(1, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should return "account destroyed" on success', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null);
      });

      a.destroy(1, function(err, str) {
        expect(str).to.equal('account destroyed');
        done();
      });

      request.restore();
    });
  });
});
