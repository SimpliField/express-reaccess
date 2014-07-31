# express-reaccess
> Express middleware to check user access based on the ressources URIs and
 HTTP methods.


[![NPM version](https://badge.fury.io/js/express-reaccess.png)](https://npmjs.org/package/express-reaccess) [![Build status](https://secure.travis-ci.org/SimpliField/express-reaccess.png)](https://travis-ci.org/SimpliField/express-reaccess) [![Dependency Status](https://david-dm.org/SimpliField/express-reaccess.png)](https://david-dm.org/SimpliField/express-reaccess) [![devDependency Status](https://david-dm.org/SimpliField/express-reaccess/dev-status.png)](https://david-dm.org/SimpliField/express-reaccess#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/SimpliField/express-reaccess/badge.png?branch=master)](https://coveralls.io/r/SimpliField/express-reaccess?branch=master) [![Code Climate](https://codeclimate.com/github/SimpliField/express-reaccess.png)](https://codeclimate.com/github/SimpliField/express-reaccess)

## Usage
```js
var reaccess = require('express-reaccess');

app.use(reaccess({
  rightsProp: 'user.rights',
  tplValueProp: 'user'
}));

```

Assumming a middleware placed before the above example and adding a property
 like this on the request object for a given authenticated user:
```js
req.user = {
  id: 1,
  login: 'nfroidure',
  organization: {
    id: 1,
    name: 'simplifield'
  },
  rights: [{
    path: '/users/:login',
    methods: reaccess.METHODS ^ reaccess.DELETE
  },{
    path: '/organisations/:organization.name',
    methods: reaccess.OPTIONS | reaccess.HEAD | reaccess.GET
  },{
    path: 'public/(.*)',
    methods: reaccess.OPTIONS | reaccess.HEAD | reaccess.GET
  }]
};
```

Then, the user will be able to access the following URI/method couples:
- OPTIONS/HEAD/GET/PUT/POST - /users/nfroidure
- OPTIONS/HEAD/GET - /organizations/simplifield
- OPTIONS/GET/HEAD - /public/*

**Warning:** Since this middleware is based on RegExp, you have to be aware of
 RegExp special chars. By example, the following rules:
```
req.user.rights = [{
  path: '/blog/posts/([0-9]+)/?page=([0-9]+)',
  methods: reaccess.OPTIONS | reaccess.HEAD | reaccess.GET
}]
```
Will allow access to 'blog/posts/1page=1' wich is probably not what you want.
 So, do not forget to escape special chars:
```
req.user.rights = [{
  path: '/blog/posts/([0-9]+)/\\?page=([0-9]+)',
  methods: reaccess.OPTIONS | reaccess.HEAD | reaccess.GET
}]
```
The best is to unit test your access rules.

## API

### reaccess(options)

### options
Type: `Object`

The options of the reaccess middleware.


### options.rightsProp
Type: `String`
Default: `'user.rights'`

The property in wich the user rights will be read. This property must be filled
on the request object by any other middleware.

This property must contain an `Array` of object of this kind :
```js
req.user.rights = [{
 path: '/organizations/:orgId/users.json'
 methods: reaccess.GET | reaccess.POST
}];
```

### options.userProp
Type: `String`

The property in wich any templated value found in the path must be searched
for.

By example, if the user rights are the following :
```js
req.user.rights = [{
 path: '/organizations/:org.id/users.json'
 methods: reaccess.GET | reaccess.POST
}];
```
He will be able to access this URI /organizations/1/users.json if a previously
set middleware have set the `req.user.org.id` to `1` and `options.userProp` to
`'user'`.

### options.errorConstructor
Type: `Error` constructor
Default: `Error`

Allows to use your own Error contructor for reaccess access errors.

### options.accessErrorMessage
Type: `String`
Default: `Unauthorized access!`

Allows to define your own error message. Note this middleware will not throw
 401 responses for you. This is your responsibility to do so in your own error
 handler middleware. Defining a custom access error message could help detect
 when to answer with a 401 status code.

## Static properties
Reaccess use bitwise operators to match methods. The reaccess function provides
 static constants to help you make cleaner code.

### reaccess.OPTIONS
Type: `Number`
Value: `1`

### reaccess.GET
Type: `Number`
Value: `2`

### reaccess.POST
Type: `Number`
Value: `4`

### reaccess.PUT
Type: `Number`
Value: `8`

### reaccess.PATCH
Type: `Number`
Value: `16`

### reaccess.DELETE
Type: `Number`
Value: `32`

### reaccess.METHODS
Type: `Number`
Value: `63`


## Stats

[![NPM](https://nodei.co/npm/express-reaccess.png?downloads=true&stars=true)](https://nodei.co/npm/express-reaccess/)
[![NPM](https://nodei.co/npm-dl/express-reaccess.png)](https://nodei.co/npm/express-reaccess/)


