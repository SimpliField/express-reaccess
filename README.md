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

## options.rightsProp
Type: `String`
Default: `'user.rights'`

The property in wich the user rights will be read. This property must be filled
on the request object by any other middleware.

This property must contain an `Array` of object of this kind :
```js
req.user.rights = [{
 path: '/organizations/:orgID/usrrs.json'
 methods: reaccess.GET | reaccess.POST
}];
```

## options.userProp
Type: `String`

This property in wich any templated value found in the path must be searched
for.

## options.errorConstructor
Type: `Error` "subclass"
Default: `reaccess.AccessError`

Allows to use your own Error contructor for reaccess access errors.

## reaccess.OPTIONS
Type: `Number`
Value: 1

## reaccess.GET
Type: `Number`
Value: 2

## reaccess.POST
Type: `Number`
Value: 4

## reaccess.PUT
Type: `Number`
Value: 8

## reaccess.PATCH
Type: `Number`
Value: 16

## reaccess.DELETE
Type: `Number`
Value: 32

## reaccess.METHODS
Type: `Number`
Value: 63

