var assert = require('assert');
var reaccess = require('../src');
var request = require('supertest');
var express = require('express');

describe('reacesss should throw err', function() {

    it('when there is no rights', function(done) {
      testReq()
        .expect(500, 'Unauthorized access!')
        .end(function(err, res){
          if(err) throw err;
          done();
        });
    });
    it('when there is no rights matching the path', function(done) {
      testReq({
        rightsObj: {
          path: '/bar',
          methods: reaccess.ALL_MASK
        }
      })
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is no rights matching the path', function(done) {
      testReq({
        rightsObj: [{
          path: '/bar',
          methods: reaccess.ALL_MASK
        },{
          path: '/plop',
          methods: reaccess.ALL_MASK
        }]
      })
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is no rights matching the templated path', function(done) {
      testReq({
        rightsObj: [{
          path: '/bar',
          methods: reaccess.ALL_MASK
        },{
          path: '/plop',
          methods: reaccess.ALL_MASK
        }]
      })
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is no rights matching the method', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.pa.pa/plop',
          methods: reaccess.ALL_MASK ^ reaccess.GET
        },{
          path: '/plop',
          methods: reaccess.ALL_MASK
        }]
      })
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is a templated value with no value', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.foo',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {}
      }, {
        valuesProps: ['user.content'],
      }, '/foo/')
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is a templated value with no value and several templates', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.foo/:bar.foo',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {}
      }, {
        valuesProps: ['user.content'],
      }, '/foo//')
      .expect(500, 'Unauthorized access!')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

});

describe('reacesss should work', function() {

    it('when there is one right that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop',
          methods: reaccess.ALL_MASK
        }]
      })
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is one right that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop',
          methods: reaccess.ALL_MASK
        }]
      })
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is one templated right that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.pa.pa/plop',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: {
            ba: {
              pa: {
                pa: 1
              }
            }
          },
          lol: 2
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/1/plop')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when a templated right contains special regexp chars', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar/plop',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: 'a',
          plop: '|)}'
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/a/plop')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is one templated right with a wildcard that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.*.pa.*.pa/plop',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: {
            ba: [{
              pa: {
                pip: {
                  pa: 1
                }
              }
            }]
          },
          lol: 2
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/1/plop')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is one templated right with a #/@ special cards that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.#.pa.@.pa/plop',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: {
            ba: [{
              pa: {
                plop: {
                  pa: 1
                }
              }
            }]
          },
          lol: 2
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/1/plop')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('when there is one templated right with a wildcard that match but is not the first', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.*.pa.*.pa/plop',
          methods: reaccess.ALL_MASK
        }, {
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: {
            ba: [{
              pa: {
                pa: {
                  pa: 2
                }
              }
            }, {
              pa: {
                pip: {
                  pa: 1
                }
              }
            }]
          }
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/1/plop')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

    it('whith several templates for a single path', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar/:foo',
          methods: reaccess.ALL_MASK
        }],
        valuesProps: ['user.content'],
        userObj: {
          bar: 'bapapa',
          foo: 'lcontact'
        }
      }, {
        valuesProps: ['user.content'],
      }, '/foo/bapapa/lcontact')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });
});

describe('reacesss.stringsToMethods', function() {

    it('should work with no strings', function() {
      assert.deepEqual(
        reaccess.stringsToMethods([]),
        0
      );
    });

    it('should work with one strings', function() {
      assert.deepEqual(
        reaccess.stringsToMethods(['PUT']),
        16
      );
    });

    it('should work with some strings', function() {
      assert.deepEqual(
        reaccess.stringsToMethods(['OPTIONS', 'PATCH']),
        33
      );
    });

    it('should work with every strings', function() {
      assert.deepEqual(
        reaccess.stringsToMethods(['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
        127
      );
    });

});

describe('reacesss.methodsAsStrings', function() {

    it('should work with no strings', function() {
      assert.deepEqual(
        reaccess.methodsAsStrings(0),
        []
      );
    });

    it('should work with one strings', function() {
      assert.deepEqual(
        reaccess.methodsAsStrings(16),
        ['PUT']
      );
    });

    it('should work with some strings', function() {
      assert.deepEqual(
        reaccess.methodsAsStrings(33),
        ['OPTIONS', 'PATCH']
      );
    });

    it('should work with every strings', function() {
      assert.deepEqual(
        reaccess.methodsAsStrings(127),
        ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      );
    });

});

describe('reacesss for SimpliField should work', function() {

    it('with organisations mocks ', function(done) {
      testReq({
        rightsProps: ['_rights'],
        rightsObj: [{
          methods: reaccess.READ_MASK,
          path: '/organisations/:organisations_ids.#/?.*'
        }],
        valuesProps: ['_properties'],
        userObj: {
          organisations_ids: [
            '54257a983d2297e607658796',
            '540441749e2d0f3b274467f1'
          ]
        }
      }, {
        valuesProps: ['_properties'],
        rightsProps: ['_rights']
      }, '/organisations/540441749e2d0f3b274467f1')
      .expect(200, 'plop')
      .end(function(err, res){
        if(err) throw err;
        done();
      });
    });

});

// Helper middleware
function testReq(props, opts, path) {
  var app = express();
  app.use(setProps(props));
  app.use(reaccess(opts));
  app.use(path || '/foo', function(req, res, next) {
    res.send(200, 'plop');
  });
  app.use(function(err, req, res, next) {
    res.send(500, err.message);
  });

  return request(app).get(path || '/foo');
}


function setProps(options) {
  options = options || {};
  options.rightsProps = options.rightsProps || ['_rights'];
  options.rightsObj = options.rightsObj || [];
  options.valuesProps = options.valuesProps || [];
  options.userObj = options.userObj || {};
  return function (req, res, next) {
    setProp(req, options.rightsProps[0],  options.rightsObj);
    if(options.valuesProps.length) {
      setProp(req, options.valuesProps[0],  options.userObj);
    }
    next();
  };
}

function setProp(obj, prop, value) {
  var nodes = prop.split('.');
  var node;
  do {
    node = nodes.shift();
    if(nodes.length) {
      obj = obj[node] || (obj[node] = {});
    }
  } while(nodes.length);
  obj[node] = value;
}
