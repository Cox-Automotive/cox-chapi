var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var utils = require('../../../utils/chapi');
var Report = proxyquire('../../../components/report', {
  'utils': utils,
});

describe('Report', function() {
  var r, api_key;

  beforeEach(function() {
    api_key = 'test1234';
    r = new Report(api_key);
  });

  describe('constructor', function() {
    it('should call set_api_key if called with api_key', function() {
      var spy = sinon.spy(Report.prototype, 'set_api_key');

      var r = new Report('my-test-key');

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0]).to.equal('my-test-key');

      spy.restore();
    });
  });

  describe('#set_api_key', function() {
    it('should set the api key', function() {
      var str = 'my-new-api-key';
      r.set_api_key(str);
      expect(r._api_key).to.equal(str);
    });
  });

  describe('#_options', function() {
    var _options;

    beforeEach(function() {
      _options = sinon.stub(utils, '_options');
    });

    it('should call utils._options with the api_key', function() {
      var method = 'GET';
      var path = '/test';
      var params = ['test=true'];

      r._options(method, path, params);

      expect(_options.called).to.be.true;
      expect(_options.args[0][1]).to.equal(method);
      expect(_options.args[0][2]).to.equal(path);
      expect(_options.args[0][3]).to.equal(params);
      expect(_options.args[0][4]).to.equal(api_key);
    });

    it('should return the value of utils._options', function() {
      var method = 'GET';
      var path = '/test';
      var options = {test: 'test'};
      _options.returns(options);

      var result = r._options(method, path);

      expect(result).to.equal(options);
    });

    afterEach(function() {
      _options.restore();
    })
  });

  describe('#list', function() {
    var _list;

    beforeEach(function() {
      _list = sinon.stub(r, '_list');
    });

    it('should accept a single argument', function() {
      var cb = function(err, result) {};
      r.list(cb);

      expect(_list.called).to.be.true;
      expect(_list.args[0][2]).to.equal(cb);
    });

    it('should accept two arguments when first is a string', function() {
      var cb = function(err, result) {};
      var topic = 'test';
      r.list(topic, cb);

      expect(_list.called).to.be.true;
      expect(_list.args[0][1]).to.equal('/' + topic);
      expect(_list.args[0][2]).to.equal(cb);
    });

    it('should accept two arguments when first is an object', function() {
      var cb = function(err, result) {};
      var flags = {test: 'test'};
      r.list(flags, cb);

      expect(_list.called).to.be.true;
      expect(_list.args[0][0]).to.equal(flags);
      expect(_list.args[0][2]).to.equal(cb);
    });

    it('should accept three arguments', function() {
      var cb = function(err, result) {};
      var flags = {test: 'test'};
      var topic = 'test';
      r.list(flags, topic, cb);

      expect(_list.called).to.be.true;
      expect(_list.args[0][0]).to.equal(flags);
      expect(_list.args[0][1]).to.equal('/' + topic);
      expect(_list.args[0][2]).to.equal(cb);
    });

    afterEach(function() {
      _list.restore();
    });
  });

  describe('#_list', function() {
    var _nest, _send_request;

    beforeEach(function() {
      _nest = sinon.stub(r, '_nest');
      send_request = sinon.stub(utils, 'send_request');
    });

    it('should call #_nest if the all flag is set', function() {
      var flags = {all: true};
      var cb = function(err, result) {};

      r._list(flags, '', cb);

      expect(_nest.calledWith(cb)).to.be.true;
      expect(send_request.called).to.be.false;
    });

    it('should call #_nest if the nest flag is set', function() {
      var flags = {nest: true};
      var cb = function(err, result) {};

      r._list(flags, '', cb);

      expect(_nest.calledWith(cb)).to.be.true;
      expect(send_request.called).to.be.false;
    });

    it('should call send_request with a bound #_list_cb as callback and using the GET method', function() {
      var flags = {};
      var cb = function(err, result) {};

      r._list(flags, '', cb);

      expect(send_request.called).to.be.true;
      expect(send_request.args[0][0].method).to.equal('GET');
      expect(send_request.args[0][2].name).to.equal('bound _list_cb');
    });

    afterEach(function() {
      _nest.restore();
      send_request.restore();
    });
  });

  describe('#_list_cb', function() {
    var _format_list;

    beforeEach(function() {
      _format_list = sinon.stub(r, '_format_list');
    });

    it('should yield any errors given', function(done) {
      var error = new Error('test');
      var cb = (err, result) => {
        expect(err).to.equal(error);
        done();
      };

      r._list_cb(null, null, cb, error);
    });

    it('should call #_format_list on the result', function(done) {
      var obj = {test: 'test'};
      var cb = (err, result) => {
        expect(_format_list.called).to.be.true;
        expect(_format_list.args[0][0]).to.equal(obj);
        done();
      };

      r._list_cb(null, null, cb, null, obj);
    });

    it('should yield a formatted array', function(done) {
      var obj = {test: 'test'};
      var array = [{name: 'test', id: 'test'}];
      _format_list.returns(array)
      var cb = (err, result) => {
        expect(result).to.equal(array);
        done();
      };

      r._list_cb(null, null, cb, null, obj);
    });

    afterEach(function() {
      _format_list.restore();
    })
  });

  describe('#_nest', function() {
    var list;

    beforeEach(function() {
      list = sinon.stub(r, 'list');
    });

    it('should call #list once to get topics and once for each topic', function(done) {
      var topics = [{id: 'test', name: 'test'}];
      list.yields(null, topics);

      r._nest((err, result) => {
        expect(list.callCount).to.equal(2);
        done();
      });
    });

    it('should yield any errors thrown by #list when called without a topic', function(done) {
      var error = new Error('test');
      list.yields(error);

      r._nest((err, result) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should yield any errors thrown by #list when called with a topic', function(done) {
      var error = new Error('test');
      var topics = [{id: 'test', name: 'test'}];
      list.onCall(0).yields(null, topics);
      list.yields(error);

      r._nest((err, result) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should yield an object containing topics and subtopics on success', function(done) {
      var topics = [{id: 'test1', name: 'test1'}];
      var subtopics = [{id: 'test2', name: 'test2'}];
      list.onCall(0).yields(null, topics);
      list.yields(null, subtopics);

      r._nest((err, result) => {
        expect(err).to.not.be.ok;
        expect(result).to.eql([{id: 'test1', name: 'test1', reports: subtopics}]);
        done();
      });
    });

    afterEach(function() {
      list.restore();
    });
  });

  describe('#_format_list', function() {
    it('should return an array containing objects representing topics/results', function() {
      var id = 'test';
      var name = 'Test';
      var href = 'https://test.com/olap_reports/' + id;
      var input = {
        links: {
          [name]: {
            href: href,
          },
        }
      };

      var result = r._format_list(input);

      expect(Array.isArray(result)).to.be.true;
      expect(result).to.eql([{name: name, id: id}]);
    });

    it('should return an empty array when no topics are given', function() {
      var id = 'test';
      var name = 'Test';
      var href = 'https://test.com/olap_reports/' + id;
      var input = {
        links: {}
      };

      var result = r._format_list(input);

      expect(Array.isArray(result)).to.be.true;
      expect(result).to.eql([]);
    });

    it('should set the id for custom reports to the url parameter value of report_id', function() {
      var id = '1234';
      var name = 'Test';
      var href = 'https://test.com/olap_reports/custom?report_id=' + id;
      var input = {
        links: {
          [name]: {
            href: href,
          },
        }
      };

      var result = r._format_list(input);

      expect(result[0].id).to.equal(id);
    });

    it('should set the id for standard reports to url path following "olap_reports/"', function() {
      var id = 'cost/history';
      var name = 'Cost History';
      var href = 'https://test.com/olap_reports/' + id;
      var input = {
        links: {
          [name]: {
            href: href,
          },
        }
      };

      var result = r._format_list(input);

      expect(result[0].id).to.equal(id);
    });
  });

  describe('#get', function() {
    var send_request;

    beforeEach(function() {
      send_request = sinon.stub(utils, 'send_request');
    });

    it('should prepend "custom/" to any numerical id', function(done) {
      var id = '1234';
      send_request.yields(null, {});

      r.get(id, (err, result) => {
        expect(send_request.called).to.be.true;
        expect(send_request.args[0][0].path).to.match(new RegExp('olap_reports/custom/' + id + '[?]?.+$'));
        done();
      });
    });

    it('should use the GET method', function(done) {
      var id = 'custom/1234';
      send_request.yields(null, {});

      r.get(id, (err, result) => {
        expect(send_request.called).to.be.true;
        expect(send_request.args[0][0].method).to.equal('GET');
        done();
      });
    });

   afterEach(function() {
     send_request.restore();
   });
  });

  describe('#dimensions', function() {
    var _dimensions;

    beforeEach(function() {
      _dimensions = sinon.stub(r, '_dimensions');
    });

    it('it should call #_dimensions with a flags object if the first argument is a flags object', function() {
      var flags = {test: 'test'};
      var base = 'test';
      var cb = (err, result) => {};

      r.dimensions(flags, base, cb);

      expect(_dimensions.called).to.be.true;
      expect(_dimensions.args[0][0]).to.equal(flags);
      expect(_dimensions.args[0][1]).to.equal(base);
      expect(_dimensions.args[0][2]).to.equal(cb);
    });

    it('it should call #_dimensions without flags if the first argument is not a flags object', function() {
      var flags = {test: 'test'};
      var base = 'test';
      var cb = (err, result) => {};

      r.dimensions(base, cb);

      expect(_dimensions.called).to.be.true;
      expect(_dimensions.args[0][0]).to.not.be.ok;
      expect(_dimensions.args[0][1]).to.equal(base);
      expect(_dimensions.args[0][2]).to.equal(cb);
    });

    afterEach(function() {
      _dimensions.restore();
    });
  });

  describe('#_dimensions', function() {
    var send_request;

    beforeEach(function() {
      send_request = sinon.stub(utils, 'send_request');
    });

    it('it should use the GET method', function() {
      r._dimensions('test', (err, result) => {});

      expect(send_request.called).to.be.true;
      expect(send_request.args[0][0].method).to.equal('GET');
    });

    it('should call send_request with an options object and #_dimensions_cb as a callback', function() {
      r._dimensions('test', (err, result) => {});

      expect(send_request.args[0][2].name).to.equal('bound _dimensions_cb');
    });

    afterEach(function() {
      send_request.restore();
    });
  });

  describe('#_dimensions_cb', function() {
    it('should yield any given errors', function() {
      var flags = {};
      var base = 'test';
      var cb = sinon.spy();
      var err = new Error('test');
      var result = undefined;

      r._dimensions_cb(flags, base, cb, err, result);

      expect(cb.called).to.be.true;
      expect(cb.args[0][0]).to.equal(err);
    });

    it('should yield an object on success', function() {
      var flags = {};
      var base = 'test';
      var cb = sinon.spy();
      var err = null;
      var result = {
        dimensions: [{name: 'Testd', label: 'testd'}],
        measures: [{name: 'Testm', label: 'testm'}],
      };

      r._dimensions_cb(flags, base, cb, err, result);

      expect(cb.calledWith(err, result)).to.be.true;
    });

    it('should yield an object whose dimensions/measures contain only name and id when --short is used', function() {
      var flags = {short: true};
      var base = 'test';
      var cb = sinon.spy();
      var err = null;
      var result = {
        dimensions: [{name: 'Testd', label: 'testd', members: [], extended_range: true}],
        measures: [{name: 'Testm', label: 'testm', members: [], extended_range: true}],
      };

      r._dimensions_cb(flags, base, cb, err, result);

      expect(cb.called).to.be.true;
      expect(cb.args[0][0]).to.not.be.ok;

      expect(cb.args[0][1].dimensions[0].members).to.not.be.ok;
      expect(cb.args[0][1].dimensions[0].extended_range).to.not.be.ok;
      expect(cb.args[0][1].dimensions[0].name).to.be.ok;
      expect(cb.args[0][1].dimensions[0].label).to.be.ok;

      expect(cb.args[0][1].measures[0].members).to.not.be.ok;
      expect(cb.args[0][1].measures[0].extended_range).to.not.be.ok;
      expect(cb.args[0][1].measures[0].name).to.be.ok;
      expect(cb.args[0][1].measures[0].label).to.be.ok;
    });
  });

  describe('#generate', function() {
    var _generate;

    beforeEach(function() {
      _generate = sinon.stub(r, '_generate');
    });

    it('should call #_generate with an undefined interval if no interval is given', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var cb = (err, result) => {};

      r.generate(base, x, y, category, cb);

      expect(_generate.called).to.be.true;
      expect(_generate.args[0][0]).to.equal(base);
      expect(_generate.args[0][1]).to.equal(x);
      expect(_generate.args[0][2]).to.equal(y);
      expect(_generate.args[0][3]).to.equal(category);
      expect(_generate.args[0][4]).to.not.be.ok;
      expect(_generate.args[0][5]).to.equal(cb);
    });

    it('should call #_generate with the interval if it is given', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var interval = 'monthly';
      var cb = (err, result) => {};

      r.generate(base, x, y, category, interval, cb);

      expect(_generate.called).to.be.true;
      expect(_generate.args[0][0]).to.equal(base);
      expect(_generate.args[0][1]).to.equal(x);
      expect(_generate.args[0][2]).to.equal(y);
      expect(_generate.args[0][3]).to.equal(category);
      expect(_generate.args[0][4]).to.equal(interval);
      expect(_generate.args[0][5]).to.equal(cb);
    });

    afterEach(function() {
      _generate.restore();
    });
  });

  describe('#_generate', function() {
    var send_request;

    beforeEach(function() {
      send_request = sinon.stub(utils, 'send_request');
    });

    it('should include interval in url params if interval is given', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var interval = 'monthly';
      var cb = (err, result) => {};

      r._generate(base, x, y, category, interval, cb);

      expect(send_request.called).to.be.true;
      expect(send_request.args[0][0].path).to.match(new RegExp('interval=' + interval));
    });

    it('should include all params in url except interval when not given', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var interval = undefined;
      var cb = (err, result) => {};

      r._generate(base, x, y, category, interval, cb);

      expect(send_request.called).to.be.true;
      expect(send_request.args[0][0].path).to.not.match(/interval=/);
    });

    it('should use the GET method', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var interval = undefined;
      var cb = (err, result) => {};

      r._generate(base, x, y, category, interval, cb);

      expect(send_request.called).to.be.true;
      expect(send_request.args[0][0].method).to.equal('GET');
    });

    it('should call send_request with an options object and a callback', function() {
      var base = 'cost/history';
      var x = 'time';
      var y = 'cost';
      var category = 'service items';
      var interval = undefined;
      var cb = (err, result) => {};

      r._generate(base, x, y, category, interval, cb);

      expect(send_request.called).to.be.true;
      expect(typeof send_request.args[0][0]).to.equal('object');
      expect(send_request.args[0][2]).to.equal(cb);
    });

    afterEach(function() {
      send_request.restore();
    })
  });
});
