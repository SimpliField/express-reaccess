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
      .expect(500, /The rights property must be an array/)
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
      .expect(500, /Unauthorized access!/)
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
      .expect(500, /Unauthorized access!/)
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
      .expect(500, /Unauthorized access!/)
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
        userProp: 'user.content',
        userObj: {}
      }, {
        userProp: 'user.content'
      }, '/foo/')
      .expect(500, /Unauthorized access!/)
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
        },{
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
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        userProp: 'user.content',
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
        userProp: 'user.content'
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
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        userProp: 'user.content',
        userObj: {
          bar: 'a',
          plop: '|)}'
        }
      }, {
        userProp: 'user.content'
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
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        userProp: 'user.content',
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
        userProp: 'user.content'
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
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        userProp: 'user.content',
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
        userProp: 'user.content'
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
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.ALL_MASK
        }],
        userProp: 'user.content',
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
        userProp: 'user.content'
      }, '/foo/1/plop')
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
  options.rightsProp = options.rightsProp || 'user.rights';
  options.rightsObj = options.rightsObj || [];
  options.userProp = options.userProp || '';
  options.userObj = options.userObj || {};
  return function (req, res, next) {
    setProp(req, options.rightsProp,  options.rightsObj);
    if(options.userProp) {
      setProp(req, options.userProp,  options.userObj);
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

