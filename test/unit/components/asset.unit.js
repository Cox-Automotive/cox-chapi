var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var https = {
  request: sinon.stub(),
};
var utils = require('../../../utils/chapi');
var Asset = proxyquire('../../../components/asset', {
  'https': https,
  'utils': utils,
});
var EventEmitter = require('events');

describe('Asset', function() {
  var a;

  describe('constructor', function() {
    it('should call set_api_key if called with api_key', function() {
      var spy = sinon.spy(Asset.prototype, 'set_api_key');

      var a = new Asset('my-test-key');

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0]).to.equal('my-test-key');

      spy.restore();
    });
  });

  describe('#_encodeCHQL', function() {
    before(function() {
      a = new Asset();
    });

    it('should return an encoded string', function() {
      var obj = {test: "test"};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.not.equal(result);
    });

    it('should return null if the first parameter is not an object', function() {
      var not_obj_1 = 'test';
      var not_obj_2 = [];

      var result_1 = a._encodeCHQL(not_obj_1);
      var result_2 = a._encodeCHQL(not_obj_2);

      expect(result_1).to.equal(null);
      expect(result_2).to.equal(null);
    });

    it('should not quote numbers', function() {
      var obj = {test: 2};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.match(/test=2/);
    });

    it('should wrap strings in quotes', function() {
      var obj = {test: "2"};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.match(/test=(["'])2\1/);
    });

    it('should replace booleans with numbers', function() {
      var obj = {one: true, two: false};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.match(/one=[0-9]+/);
      expect(decodeURIComponent(result)).to.not.match(/one=0+/);
      expect(decodeURIComponent(result)).to.match(/two=0+/);
    });

    it('should concatenate fields with +and+', function() {
      var obj = {one: 1, two: 2};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.match(/(one=1\+and\+two=2)|(two=2\+and\+one=1)/);
    });

    it('should prepend "query=" to the result', function() {
      var obj = {test: 1};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.match(/^query=/);
    });

    it('should ignore (not encode) the "asset_type" field of an object', function() {
      var obj = {test: 1, asset_type: 'asset'};

      var result = a._encodeCHQL(obj);

      expect(typeof result).to.equal('string');
      expect(decodeURIComponent(result)).to.not.match(/asset_type=/);
      expect(decodeURIComponent(result)).to.not.match(/\+and\+/);
    });

    it('should return null if no object is given', function() {
      var result = a._encodeCHQL();

      expect(result).to.be.null;
    });
  });

  describe('#set_api_key', function() {
    it('should set the api key', function() {
      var a = new Asset();
      var str = 'my-new-api-key';
      a.set_api_key(str);
      expect(a._api_key).to.equal(str);
    });
  });

  describe('#list_types', function() {
    before(function() {
      a = new Asset();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.list_types(function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Asset('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.list_types(function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      a.list_types(function(err, json) {});

      request.restore();
    });

    it('should call the callback with an array of asset types', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {list: []});
      });

      a.list_types(function(err, types) {
        expect(Array.isArray(types)).to.be.true;
        done();
      });

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.list_types(function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });
  });

  describe('#fields_for', function() {
    before(function() {
      a = new Asset();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.fields_for('AwsAccounts', function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Asset('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.fields_for('AwsAccounts', function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      a.fields_for('AwsAccounts', function(err, json) {});

      request.restore();
    });

    it('should call the callback with an object containing an array of field names', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {attributes: []});
      });

      a.fields_for('AwsAccounts', function(err, fields) {
        expect(Array.isArray(fields)).to.be.true;
        done();
      });

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.fields_for('AwsAccounts', function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });
  });

  describe('#query', function() {
    before(function() {
      a = new Asset();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      a.query({asset_type: 'test'}, function(err, json) {});

      request.restore();
    });

    it('should append the api_key to options.path', function(done) {
      var special_a = new Asset('append-apikey');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+api_key=append-apikey/);
        done();
      });

      special_a.query({asset_type: 'test'}, function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      a.query({asset_type: 'test'}, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an array of assets', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {list: []});
      });

      a.query({asset_type: 'test'}, function(err, assets) {
        expect(Array.isArray(assets)).to.be.true;
        done();
      });

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      a.query({asset_type: 'test'}, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should include the asset type as a url parameter', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/name=fakeAssetType/);
        done();
      });

      a.query({asset_type: 'fakeAssetType'}, function(err, json) {});

      request.restore();
    });

    it('should call _encodeCHQL with the given object and append the result to the url', function(done) {
      var match = {asset_type: 'test', key: 'value'};

      var _encodeCHQL = sinon.stub(a, '_encodeCHQL', function(obj) {
        expect(obj).to.eql(match);
        return 'thisisatest';
      });

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(_encodeCHQL.calledOnce).to.be.true;
        expect(options.path).to.match(/thisisatest/);
        done();
      });

      a.query(match, function(err, json) {});

      _encodeCHQL.restore();
      request.restore();
    });
  });
});
