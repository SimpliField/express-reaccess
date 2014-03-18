# express-reacces
> Express middleware to check user access based on the ressources URIs and
 HTTP methods.

# Usage
```js
var reaccess = require('express-reaccess');

app.use(reaccess({
  rightsProp: 'user.rights',
  tplValueProp: 'user'
}));

```

# API

## reaccess(options)

## options
Type: `Object`

The options of the reaccess middleware.


## options.rightsProp
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

## options.userProp
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


## options.errorConstructor
Type: `Error` constructor
Default: `Error`

Allows to use your own Error contructor for reaccess access errors.

# Static properties
Reaccess use bitwise operators to match methods. The reaccess function provides
 static constants to help you make cleaner code.

## reaccess.OPTIONS
Type: `Number`
Value: `1`

## reaccess.GET
Type: `Number`
Value: `2`

## reaccess.POST
Type: `Number`
Value: `4`

## reaccess.PUT
Type: `Number`
Value: `8`

## reaccess.PATCH
Type: `Number`
Value: `16`

## reaccess.DELETE
Type: `Number`
Value: `32`

## reaccess.METHODS
Type: `Number`
Value: `63`

