var assert = require('assert');
var reaccess = require('../src');
var request = require('supertest');
var express = require('express');

describe('reacesss should throw err', function() {

  it('when there is no rights', function(done) {
     testReq()
     //  .expect('Unauthorized access!')
       .expect(500, done);
  });

    it('when there is no rights matching the path', function(done) {
      testReq({
        rightsObj: [{
          path: '/bar',
          methods: reaccess.METHODS
        },{
          path: '/plop',
          methods: reaccess.METHODS
        }]
      })
     //  .expect('Unauthorized access!')
       .expect(500, done);
    });

    it('when there is no rights matching the method', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo',
          methods: reaccess.METHODS ^ reaccess.GET
        },{
          path: '/plop',
          methods: reaccess.METHODS
        }]
      })
     //  .expect('Unauthorized access!')
       .expect(500, done);
    });

});

describe('reacesss should work', function() {

    it('when there is one right that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo',
          methods: reaccess.METHODS
        },{
          path: '/plop',
          methods: reaccess.METHODS
        }]
      })
      .expect('plop')
      .expect(200, done);
    });

    it.only('when there is one templated right that match', function(done) {
      testReq({
        rightsObj: [{
          path: '/foo/:bar.ba.pa.pa/plop',
          methods: reaccess.METHODS
        },{
          path: '/plop/:foo/bar',
          methods: reaccess.METHODS
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
      .expect('plop')
      .expect(200, done);
    });

});

// Helper middleware
function testReq(props, opts, path) {
  var app = express();
  app.use(setProps(props));
  app.use(reaccess(opts));
  app.use(path || '/foo', function(req, res, next) {
    res.send(200, 'plop');
    next();
  });

  return request(app).get(path || '/foo');
}


function setProps(options) {
  options = options || {};
  options.rightsProp = options.rightsProp || 'users.rights';
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

