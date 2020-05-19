var expect = require('chai').expect;
var sinon = require('sinon');
var utils = require('../../../utils/chapi');
var Perspective = require('../../../components/perspective');
var EventEmitter = require('events');

describe('Perspective', function() {
  var p;

  describe('constructor', function() {
    it('should call set_api_key if called with api_key', function() {
      var spy = sinon.spy(Perspective.prototype, 'set_api_key');

      var p = new Perspective('my-test-key');

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0]).to.equal('my-test-key');

      spy.restore();
    });
  });

  describe('#_lookup_id', function() {
    var list;

    before(function() {
      p = new Perspective();
      list = sinon.stub(p, 'list');
    });

    beforeEach(function() {
      list.reset();
    });

    it('should call #list with any given flags', function(done) {
      var test_flags = {cache: true};
      var test_name = 'test_name';

      list.yields(null, {});

      p._lookup_id(test_flags, test_name, (err, id) => {
        expect(list.called).to.be.true;
        expect(list.calledWith(test_flags)).to.be.true;
        done();
      });
    });

    it('should call the callback with an id on success', function(done) {
      var test_flags = {cache: true};
      var test_name = 'test_name';

      list.yields(null, {
        '1': {
          name: 'one',
        },
        '2': {
          name: 'two',
        },
        '3': {
          name: test_name,
        }
      });

      p._lookup_id(test_flags, test_name, (err, id) => {
        expect(list.called).to.be.true;
        expect(err).to.not.be.ok;
        expect(id).to.equal('3');
        done();
      });
    });

    it('should call the callback with an error on failure', function(done) {
      var test_flags = {cache: true};
      var test_name = 'test_name';

      var error = new Error();
      list.yields(error);

      p._lookup_id(test_flags, test_name, (err, id) => {
        expect(list.called).to.be.true;
        expect(err).to.equal(error);
        done();
      });
    });

    after(function() {
      list.restore();
    });
  });

  describe('#_lookup_group_id', function() {
    var list_groups;

    before(function() {
      p = new Perspective();
      list_groups = sinon.stub(p, 'list_groups');
    });

    beforeEach(function() {
      list_groups.reset();
    });

    it('should call the callback with an id when a matching group is found', function(done) {
      var pers = {};
      var group_name = 'test';

      list_groups.yields(null, [
        {
          name: 'test',
          ref_id: '1234',
        },
      ]);

      p._lookup_group_id(pers, group_name, (err, id) => {
        expect(err).to.not.be.ok;
        expect(id).to.equal('1234');
        done();
      });
    });

    it('matching should be case insensitive', function(done) {
      var pers = {};
      var group_name = 'TEST';

      list_groups.yields(null, [
        {
          name: 'test',
          ref_id: '1234',
        },
      ]);

      p._lookup_group_id(pers, group_name, (err, id) => {
        expect(err).to.not.be.ok;
        expect(id).to.equal('1234');
        done();
      });
    });

    it('should call the callback with the group_name if no matching group was found', function(done) {
      var pers = {};
      var group_name = 'test';

      list_groups.yields(null, []);

      p._lookup_group_id(pers, group_name, (err, id) => {
        expect(err).to.not.be.ok;
        expect(id).to.equal(group_name);
        done();
      });
    });

    it('should call the callback with an error on failure', function(done) {
      var pers = {};
      var group_name = 'test';
      var error = new Error();

      list_groups.yields(error);

      p._lookup_group_id(pers, group_name, (err, id) => {
        expect(err).to.equal(error);
        done();
      });
    });

    after(function() {
      list_groups.restore();
    });
  });

  describe('#list_groups', function() {
    var get;

    before(function() {
      p = new Perspective();
      get = sinon.stub(p, 'get');
    });

    beforeEach(function() {
      get.reset();
    });

    it('should call the callback with an array on success', function(done) {
      var test_groups = [];
      var pers = {
        constants: [
          {
            type: 'Static Group',
            list: test_groups,
          },
        ],
      };

      p.list_groups(pers, (err, groups) => {
        expect(err).to.not.be.ok;
        expect(groups).to.equal(test_groups);
        done();
      });
    });

    it('matching of "type: group" should be case insensitive', function(done) {
      var test_groups = [];
      var pers = {
        constants: [
          {
            type: 'STATIC GROUP',
            list: test_groups,
          },
        ],
      };

      p.list_groups(pers, (err, groups) => {
        expect(err).to.not.be.ok;
        expect(groups).to.equal(test_groups);
        done();
      });
    });

    it('should get the perspective if an id is given in place of the perspective', function(done) {
      var test_groups = [];
      var pers = {
        constants: [
          {
            type: 'Static Group',
            list: test_groups,
          },
        ],
      };

      get.yields(null, pers);

      p.list_groups('1234', (err, groups) => {
        expect(err).to.not.be.ok;
        expect(groups).to.equal(test_groups);
        done();
      });
    });

    it('should call the callback with any errors on failure', function(done) {
      var test_groups = [];
      var error = new Error();

      get.yields(error);

      p.list_groups('1234', (err, groups) => {
        expect(err).to.equal(error);
        done();
      });
    });

    after(function() {
      get.restore();
    });
  });

  describe('#add_to_group', function() {
    var get, _lookup_group_id, _get_rule, update;

    before(function() {
      p = new Perspective();
      get = sinon.stub(p, 'get');
      _lookup_group_id = sinon.stub(p, '_lookup_group_id');
      _get_rule = sinon.stub(p, '_get_rule');
      update = sinon.stub(p, 'update');
    });

    beforeEach(function() {
      get.reset();
      _lookup_group_id.reset();
      _get_rule.reset();
      update.reset();
    });

    it('should call the callback with an updated perspective object', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = ['1234'];
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        expect(perspective).to.eql({
          constants: [
            {
              type: 'group',
              list: [
                {
                  name: group_name,
                  ref_id: group_id,
                }
              ],
            },
          ],
          rules: [
            {
              asset: 'AwsAccount',
              to: group_id,
              type: 'filter',
              condition: {
                clauses: [
                  {
                    asset_ref: accts[0],
                    op: '=',
                    val: accts[0],
                  },
                ],
              },
            },
          ],
        });
        done();
      });
    });

    it('should call the callback with an error if #get fails', function(done) {
      var group_name = 'test';
      var accts = ['1234'];
      var error = new Error();
      var pers = '2345';

      get.yields(error);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should call the callback with an error if #_lookup_group_id fails', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = ['1234'];
      var error = new Error();
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(error);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should call the callback with an error if #update fails', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = ['1234'];
      var error = new Error();
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(error);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it('should accept an id instead of a perspective object', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = ['1234'];
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      get.yields(null, pers);
      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group('2345', accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        done();
      });
    });

    it('should accept an account id instead of an array of account ids', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = '1234';
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        expect(perspective).to.eql({
          constants: [
            {
              type: 'group',
              list: [
                {
                  name: group_name,
                  ref_id: group_id,
                }
              ],
            },
          ],
          rules: [
            {
              asset: 'AwsAccount',
              to: group_id,
              type: 'filter',
              condition: {
                clauses: [
                  {
                    asset_ref: accts,
                    op: '=',
                    val: accts,
                  },
                ],
              },
            },
          ],
        });
        done();
      });
    });

    it('should accept an account instead of an array of account ids', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = {
        id: '1234',
      };
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        expect(perspective).to.eql({
          constants: [
            {
              type: 'group',
              list: [
                {
                  name: group_name,
                  ref_id: group_id,
                }
              ],
            },
          ],
          rules: [
            {
              asset: 'AwsAccount',
              to: group_id,
              type: 'filter',
              condition: {
                clauses: [
                  {
                    asset_ref: accts.id,
                    op: '=',
                    val: accts.id,
                  },
                ],
              },
            },
          ],
        });
        done();
      });

    });

    it('should accept an array of accounts instead of an array of account ids', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = [
        {
          id: '1234',
        },
      ];
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        expect(perspective).to.eql({
          constants: [
            {
              type: 'group',
              list: [
                {
                  name: group_name,
                  ref_id: group_id,
                }
              ],
            },
          ],
          rules: [
            {
              asset: 'AwsAccount',
              to: group_id,
              type: 'filter',
              condition: {
                clauses: [
                  {
                    asset_ref: accts[0].id,
                    op: '=',
                    val: accts[0].id,
                  },
                ],
              },
            },
          ],
        });
        done();
      });
    });

    it('should accept an array containing multiple accounts/ids', function(done) {
      var group_name = 'test';
      var group_id = '5678';
      var accts = ['1234', '7890'];
      var test_groups = [
        {
          name: group_name,
          ref_id: group_id,
        }
      ];
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        constants: [
          {
            type: 'group',
            list: test_groups,
          },
        ],
        rules: [
          rule,
        ],
      };

      _lookup_group_id.yields(null, group_id);
      _get_rule.returns(rule);
      update.yields(null, pers);

      p.add_to_group(pers, accts, group_name, (err, perspective) => {
        expect(err).to.not.be.ok;
        expect(perspective).to.eql({
          constants: [
            {
              type: 'group',
              list: [
                {
                  name: group_name,
                  ref_id: group_id,
                }
              ],
            },
          ],
          rules: [
            {
              asset: 'AwsAccount',
              to: group_id,
              type: 'filter',
              condition: {
                clauses: [
                  {
                    asset_ref: accts[0],
                    op: '=',
                    val: accts[0],
                  },
                  {
                    asset_ref: accts[1],
                    op: '=',
                    val: accts[1],
                  },
                ],
                combine_with: 'OR',
              },
            },
          ],
        });
        done();
      });

    });

    after(function() {
      get.restore();
      _lookup_group_id.restore();
      _get_rule.restore();
      update.restore();
    });
  });

  describe('#_get_rule', function() {

    before(function() {
      p = new Perspective();
    });

    it('should return the appropriate rule when it exists', function() {
      var group_id = '1234';
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        rules: [
          rule,
          {
            asset: 'AwsAccount',
            to: '5678',
            type: 'filter',
            condition: {
              clauses: [],
            },
          },
        ],
      };

      var test_rule = p._get_rule(pers, group_id);

      expect(test_rule).to.equal(rule);
    });

    it('should NOT return a rule if the rule has a defined from field', function() {
      var group_id = '1234';
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        from: '4567',
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        rules: [
          rule,
          {
            asset: 'AwsAccount',
            to: '5678',
            type: 'filter',
            condition: {
              clauses: [],
            },
          },
        ],
      };

      var test_rule = p._get_rule(pers, group_id);

      expect(test_rule).to.not.equal(rule);
    });

    it('should return a new rule if the perspective has no rules', function() {
      var group_id = '1234';
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        rules: [],
      };

      var test_rule = p._get_rule(pers, group_id);

      expect(test_rule).to.eql(rule);
      expect(pers.rules).to.contain(rule);
    });

    it('should return a new rule if no matching rule is found', function() {
      var group_id = '1234';
      var rule = {
        asset: 'AwsAccount',
        to: group_id,
        type: 'filter',
        condition: {
          clauses: [],
        },
      };
      var pers = {
        rules: [
          {
            asset: 'AwsAccount',
            to: '5678',
            type: 'filter',
            condition: {
              clauses: [],
            },
          },
        ],
      };

      var test_rule = p._get_rule(pers, group_id);

      expect(test_rule).to.eql(rule);
      expect(pers.rules).to.contain(rule);
    });
  });

  describe('#set_api_key', function() {
    it('should set the api key', function() {
      var p = new Perspective();
      var str = 'my-new-api-key';
      p.set_api_key(str);
      expect(p._api_key).to.equal(str);
    });
  });

  describe('#remove_prev_refs', () => {
    const account_ref_id = '1234';
    const pers = {
      rules: [
        {
          asset: 'AwsAccount',
          to: '5678',
          type: 'filter',
          condition: {
            clauses: [
              {
                asset_ref: '1234',
              },
              {
                asset_ref: '2345',
              }
            ],
          },
        },
        {
          asset: 'AwsAccount',
          to: '5678',
          type: 'filter',
          condition: {
            clauses: [
              {
                asset_ref: '1234',
              }
            ],
          },
        },
      ]
    };
    const persOutput = {
      rules: [
        {
          asset: 'AwsAccount',
          to: '5678',
          type: 'filter',
          condition: {
            clauses: [
              {
                asset_ref: '2345',
              }
            ],
          },
        },
      ]
    };
    before(function() {
      p = new Perspective();
    });

    it('should remove any clauses that contain refs to the account and then remove empty rules', (done) => {
      p.remove_prev_refs({ pers, account_ref_id }, (err, data) => {
        expect(data).to.be.eql(persOutput);
        done();
      });
    });
  })

  describe('#list', function() {
    before(function() {
      p = new Perspective();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      p.list(function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      p.list(function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      p.list(function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should call the callback with an error if utils.set_cache fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {});
      });

      var set_cache = sinon.stub(utils, 'set_cache', function(cache_name, cache, cb) {
        cb(error);
      });

      p.list(function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      set_cache.restore();
      request.restore();
    });

    it('should call utils.find_cache if cache flag is true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb();
      });

      var find_cache = sinon.stub(utils, 'find_cache', function(cache_name, cb) {
        cb(null, 'test');
      });

      p.list({cache: true}, function(err, json) {
        expect(find_cache.called).to.be.true;
        find_cache.restore();
        request.restore();
        done();
      });
    });

    it('should return any errors given by utils.find_cache', function(done) {
      var error = new Error('err');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb();
      });

      var find_cache = sinon.stub(utils, 'find_cache', function(cache_name, cb) {
        cb(error);
      });

      p.list({cache: true}, function(err, json) {
        expect(err).to.equal(error);
        find_cache.restore();
        request.restore();
        done();
      });
    });

    it('should call itself without flags if utils.find_cache finds nothing', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb();
      });

      var find_cache = sinon.stub(utils, 'find_cache', function(cache_name, cb) {
        cb(null, null);
      });

      var set_cache = sinon.stub(utils, 'set_cache', function(cache_name, cache, cb) {
        cb(null, cache);
      });

      var callback = function(err, json) {
        expect(spy.callCount).to.equal(2);
        expect(spy.calledWithExactly(callback)).to.be.true;
        find_cache.restore();
        set_cache.restore();
        request.restore();
        spy.restore();
        done();
      };

      var spy = sinon.spy(p, 'list');

      p.list({cache: true}, callback);
    });

    it('should call utils.set_cache if cache flag is not true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb();
      });

      var set_cache = sinon.stub(utils, 'set_cache', function(cache_name, cache, cb) {
        cb(null, cache);
      });

      p.list(function(err, json) {
        expect(set_cache.called).to.be.true;
        set_cache.restore();
        request.restore();
        done();
      });
    });
  });

  describe('#get', function() {
    before(function() {
      p = new Perspective();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      p.get(1, function(err, json) {});

      request.restore();
    });

    it('should call the callback with the schema object from the https request', function(done) {
      var test_obj = {
        schema: {
          test: 'test',
        },
      };

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, test_obj);
      });

      p.get(1, function(err, json) {
        expect(json).to.equal(test_obj.schema);
        done();
      });

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      p.get(id, function(err, json) {});

      request.restore();
    });

    it('should use the GET http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('GET');
        done();
      });

      p.get(1, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      p.get(1, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should call #_lookup_id if the id given is an account name', function(done) {
      var _lookup_id = sinon.stub(p, '_lookup_id', function(flags, id, cb) {
        cb(null, '1234');
      });

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {schema: {}});
      });

      p.get('test', function(err, json) {
        expect(_lookup_id.called).to.be.true;
        request.restore();
        _lookup_id.restore();
        done();
      });

    });

    it('should return any errors from #_lookup_id', function(done) {
      var error = new Error('err');
      var _lookup_id = sinon.stub(p, '_lookup_id', function(flags, id, cb) {
        cb(error);
      });

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {schema: {}});
      });

      p.get('test', function(err, json) {
        expect(_lookup_id.called).to.be.true;
        expect(err).to.equal(error);
        request.restore();
        _lookup_id.restore();
        done();
      });
    });

    it('should pass any flags to #_lookup_id when #_lookup_id gets called', function(done) {
      var test_flags = {cache: true};
      var _lookup_id = sinon.stub(p, '_lookup_id', function(flags, id, cb) {
        expect(test_flags).to.eql(flags);
        cb(null, '1234');
      });

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {schema: {}});
      });

      p.get(test_flags, 'test', function(err, json) {
        expect(_lookup_id.called).to.be.true;
        request.restore();
        _lookup_id.restore();
        done();
      });
    });
  });

  describe('#create', function() {
    before(function() {
      p = new Perspective();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      p.create({}, function(err, json) {});

      request.restore();
    });

    it('should use the POST http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('POST');
        done();
      });

      p.create({}, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      p.create({}, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should wrap the new perspective in a object under the "schema" field', function(done) {
      var obj = {test: 'test'};

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(JSON.parse(send_data).schema).to.eql(obj);
        done();
      });

      p.create(obj, function(err, json) {});

      request.restore();
    });

    it('should not wrap the new perspective in "schema" again if it contains the schema field already', function(done) {
      var obj = {schema: {test: 'test'}};

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(JSON.parse(send_data)).to.eql(obj);
        done();
      });

      p.create(obj, function(err, json) {});

      request.restore();
    });

    it('should return any object returned by #_send_request', function(done) {
      var test_json = {
        test: 'test',
      };

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, test_json);
      });

      p.create({}, function(err, json) {
        expect(json).to.equal(test_json);
        done();
      });

      request.restore();
    });
  });

  describe('#update', function() {
    var obj = {schema: {
        id: 14562347657632460435,
        constants: [
            { type: 'Static Group',
              list: [
                {
                  name: "expired",
                  "ref_id": "testRef0"
                },
                {
                  name: "testAccount",
                  "ref_id": "testRef1"
                }
              ]

            },
            {type: 'Version'}
        ],
        rules: [
          {
            condition: {
              clauses: [
                {
                  asset_ref: 'testRef1'
                },
                {
                  asset_ref: 'testRef3'
                }
              ]
            }
          },
          {
            condition: {
              clauses: [
                {
                  asset_ref: 'testRef0'
                }
              ]
            }
          }
        ]
      }
    };
    var parsedObj = {schema: {
        id: 14562347657632460435,
        constants: [
            { type: 'Static Group',
              list: [
                {
                  name: "testAccount",
                  "ref_id": "testRef1"
                }
              ]
            }
        ],
        rules: [
          {
            condition: {
              clauses: [
                {
                  asset_ref: 'testRef1'
                },
                {
                  asset_ref: 'testRef3'
                }
              ]
            }
          }
        ]
      }
    };
    before(function() {
      p = new Perspective();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      p.update(obj, function(err, json) {});

      request.restore();
    });

    it('should use the PUT http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('PUT');
        done();
      });

      p.update(obj, function(err, json) {});

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      p.update(obj, function(err, json) {});

      request.restore();
    });

    it('should parse out the constant type "Version" from all schemas', function() {
      var request = sinon.stub(utils, 'send_request')

      p.update(obj, function(err, json) {});
      expect(request.args[0][1]).to.equal(JSON.stringify(parsedObj));

      request.restore();

    });

    it('should remove any expired blocks from all schemas', function() {
      var request = sinon.stub(utils, 'send_request')

      p.update(obj, function(err, json) {});
      expect(request.args[0][1]).to.equal(JSON.stringify(parsedObj));

      request.restore();

    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      p.update(obj, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should wrap the new perspective in a object under the "schema" field', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(JSON.parse(send_data).schema).to.eql(obj.schema);
        done();
      });

      p.update(obj.schema, function(err, json) {});

      request.restore();
    });

    it('should not wrap the new perspective in "schema" again if it contains the schema field already', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(JSON.parse(send_data)).to.eql(obj);
        done();
      });

      p.update(obj, function(err, json) {});

      request.restore();
    });

    it('should return any object returned by #_send_request', function(done) {
      var test_json = {
        test: 'test',
      };

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, test_json);
      });

      p.update(obj, function(err, json) {
        expect(json).to.equal(test_json);
        done();
      });

      request.restore();
    });
  });

  describe('#destroy', function() {
    before(function() {
      p = new Perspective();
    });

    it('should call #_send_request with an options object at least once', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(typeof options).to.equal('object');
        done();
      });

      p.destroy(1, function(err, json) {});

      request.restore();
    });

    it('should use the DELETE http method', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.method).to.equal('DELETE');
        done();
      });

      p.destroy(1, function(err, json) {});

      request.restore();
    });

    it('should include the id in the URL', function(done) {
      var id = 14562347657632460435;

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(new RegExp('/' + id));
        done();
      });

      p.destroy(id, function(err, json) {});

      request.restore();
    });

    it('should call the callback with an error if #_send_request fails', function(done) {
      var error = new Error('test');

      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(error);
      });

      p.destroy(1, function(err, json) {
        expect(err).to.equal(error);
        done();
      });

      request.restore();
    });

    it('should return "perspective destroyed" on success', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null);
      });

      p.destroy(1, function(err, str) {
        expect(str).to.equal('perspective destroyed');
        done();
      });

      request.restore();
    });

    it('should force delete if the force flag is set true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+force=true/);
        done();
      });

      p.destroy({force: true}, 1, function(err, json) {});

      request.restore();
    });

    it('should hard delete if the hard_delete flag is set true', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        expect(options.path).to.match(/.+force=true/);
        expect(options.path).to.match(/.+hard_delete=true/);
        done();
      });

      p.destroy({hard_delete: true}, 1, function(err, json) {});

      request.restore();
    });

    it('should treat the second arg as callback if it\'s a function', function(done) {
      var request = sinon.stub(utils, 'send_request', function(options, send_data, cb) {
        cb(null, {});
      });

      p.destroy(1, function(err, json) {
        done();
      });

      request.restore();
    });
  });
});
