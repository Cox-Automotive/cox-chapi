var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var utils = require('../../../utils/chapi');
var Tag = proxyquire('../../../components/tag', {
  'utils': utils,
});

describe('Tag', function() {
  describe('constructor', function() {
    var spy;

    before(function() {
      spy = sinon.spy(Tag.prototype, 'set_api_key');
    });

    beforeEach(function() {
      spy.reset();
    });

    it('should call set_api_key if called with api_key', function() {
      var api_key = 'my-test-key';
      var t = new Tag(api_key);

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0]).to.equal(api_key);
    });

    after(function() {
      spy.restore();
    });
  });

  describe('#set_api_key', function() {
    it('should set the api key', function() {
      var t = new Tag();
      var api_key = 'my-new-api-key';
      t.set_api_key(api_key);
      expect(t._api_key).to.equal(api_key);
    });
  });

  describe('#set', function() {
    var t, send_request;

    beforeEach(function() {
      t = new Tag();
      send_request = sinon.stub(utils, 'send_request');
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set('1234', {test: "test"}, function(err, result) {
        expect(typeof send_request.args[0][0]).to.equal('object');
        done();
      });
    });

    it('should append the api_key to options.path', function(done) {
      var api_key = 'append-apikey';
      t = new Tag(api_key);
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set('1234', {test: "test"}, function(err, result) {
        expect(send_request.args[0][0].path).to.match(new RegExp('.+api_key=' + api_key));
        done();
      });
    });

    it('should use the POST http method', function(done) {
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set('1234', {test: "test"}, function(err, result) {
        expect(send_request.args[0][0].method).to.equal('POST');
        done();
      });
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');
      send_request.yields(error);

      t.set('1234', {test: "test"}, function(err, result) {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should set tags for an account if three arguments are given', function(done) {
      var acct_id = '1234';
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set(acct_id, {test: "test"}, function(err, result) {
        var body_data = send_request.args[0][1].assets[0];
        expect(body_data.type).to.equal('AwsAccount');
        expect(body_data.owner_id).to.equal(acct_id);
        done();
      });
    });

    it('should set tags for an asset if four arguments are given', function(done) {
      var acct_id = '1234';
      var asset_id = '5678';
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set(acct_id, asset_id, {test: "test"}, function(err, result) {
        var body_data = send_request.args[0][1].assets[0];
        expect(body_data.aws_account_id).to.equal(acct_id);
        expect(body_data.instance_id).to.equal(asset_id);
        done();
      });
    });

    it('should allow the first of 4 args to be tags (because of parse_chapi)', function(done) {
      var acct_id = '1234';
      var asset_id = '5678';
      var tags = {
        test: 'test',
      };
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set(tags, acct_id, asset_id, function(err, result) {
        var body_data = send_request.args[0][1].assets[0];
        expect(body_data.aws_account_id).to.equal(acct_id);
        expect(body_data.instance_id).to.equal(asset_id);
        expect(body_data.tags).to.equal(tags);
        done();
      });
    });

    it('should allow the first of 3 args to be tags (because of parse_chapi)', function(done) {
      var acct_id = '1234';
      var tags = {
        test: 'test',
      };
      var response_json = {
        successful: '1 tags altered',
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set(tags, acct_id, function(err, result) {
        var body_data = send_request.args[0][1].assets[0];
        expect(body_data.type).to.equal('AwsAccount');
        expect(body_data.owner_id).to.equal(acct_id);
        expect(body_data.tags).to.equal(tags);
        done();
      });
    });

    it('should yeild an error if send_request yields a result with any failures', function(done) {
      var acct_id = '1234';
      var err_msg = 'test error message';
      var response_json = {
        successful: '0 tags altered',
        failures: [ err_msg ],
      };
      send_request.yields(null, response_json);

      t.set({test: "test"}, acct_id, function(err, result) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal(err_msg);
        done();
      });
    });

    it('should yeild a string on success', function(done) {
      var message = '1 tag altered';
      var response_json = {
        successful: message,
        failures: [],
      };
      send_request.yields(null, response_json);

      t.set('1234', {test: "test"}, function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(message);
        done();
      });
    });

    afterEach(function() {
      send_request.restore();
    });
  });

  describe('#delete', function() {
    var t, set;

    beforeEach(function() {
      t = new Tag();
      set = sinon.stub(t, 'set');
    });

    it('should call defer to tag#set function', function(done) {
      set.yields(null, '1 tag altered');

      t.delete('1234', ["test"], function(err, result) {
        expect(set.called).to.be.true;
        done();
      });
    });

    it('should yield an error if tag#set fails', function(done) {
      var error = new Error('test');
      set.yields(error);

      t.delete('1234', ["test"], function(err, result) {
        expect(err).to.be.equal(error);
        done();
      });
    });

    it('should accept three arguments', function(done) {
      var acct_id = '1234';
      var tags = [
        "test"
      ];
      set.yields(null, '1 tags altered');

      t.delete(acct_id, tags, function(err, result) {
        expect(set.args[0][0]).to.equal(acct_id);
        expect(set.args[0][1]).to.equal(undefined);
        expect(set.args[0][2]).to.eql({test: null});
        done();
      });
    });

    it('should accept four arguments', function(done) {
      var acct_id = '1234';
      var asset_id = '5678';
      var tags = [
        "test"
      ];
      set.yields(null, '1 tags altered');

      t.delete(acct_id, asset_id, tags, function(err, result) {
        expect(set.args[0][0]).to.equal(acct_id);
        expect(set.args[0][1]).to.equal(asset_id);
        expect(set.args[0][2]).to.eql({test: null});
        done();
      });
    });

    it('should allow the first of 4 args to be tags (because of parse_chapi)', function(done) {
      var acct_id = '1234';
      var asset_id = '5678';
      var tags = [
        "test"
      ];
      set.yields(null, '1 tags altered');

      t.delete(tags, acct_id, asset_id, function(err, result) {
        expect(set.args[0][0]).to.equal(acct_id);
        expect(set.args[0][1]).to.equal(asset_id);
        expect(set.args[0][2]).to.eql({test: null});
        done();
      });
    });

    it('should allow the first of 3 args to be tags (because of parse_chapi)', function(done) {
      var acct_id = '1234';
      var tags = [
        "test"
      ];
      set.yields(null, '1 tags altered');

      t.delete(tags, acct_id, function(err, result) {
        expect(set.args[0][0]).to.equal(acct_id);
        expect(set.args[0][1]).to.equal(undefined);
        expect(set.args[0][2]).to.eql({test: null});
        done();
      });
    });

    it('should yeild a string on success', function(done) {
      var message = '1 tag altered';
      set.yields(null, message);

      t.delete('1234', ["test"], function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(message);
        done();
      });
    });

    it('should accept an object of tags instead of an array of tags', function(done) {
      var acct_id = '1234';
      var tags = {
        test1: "test1",
        test2: null,
        test3: true,
      };
      set.yields(null, '1 tags altered');

      t.delete(acct_id, tags, function(err, result) {
        expect(set.args[0][0]).to.equal(acct_id);
        expect(set.args[0][1]).to.equal(undefined);
        expect(set.args[0][2]).to.eql({test1: null, test2: null, test3: null});
        done();
      });
    });

    it('should only delete tags that match keys belonging to an object, not its prototype', function(done) {
      var acct_id = '1234';
      var tag_proto = {
        test2: 'test2',
      };
      var tags = Object.create(tag_proto);
      tags.test1 = "test1";
      set.yields(null, '1 tags altered');

      t.delete(acct_id, tags, function(err, result) {
        expect(set.args[0][2]).to.eql({test1: null});
        done();
      });
    });

    afterEach(function() {
      set.restore();
    });
  });
});
