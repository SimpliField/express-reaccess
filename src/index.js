function reaccess(options) {

  options = options || {};

  options.rightsProp = options.rightsProp || 'user.rights';
  options.errorConstructor = options.errorConstructor || Error;
  options.accessErrorMessage = options.accessErrorMessage || 'Unauthorized access!';

  return function reaccessMiddleware(req, res, next) {
    var rights = getProp(req, options.rightsProp);
    var user;
    if(!(rights && rights instanceof Array)) {
      throw new Error('The rights property must be an array.');
    }
    if(options.userProp) {
      user = getProp(req, options.userProp);
    }
    if(rights.some(function(right) {
      var path = '';
      if(!(right.methods && right.methods&reaccess[req.method.toUpperCase()])) {
        return false;
      }
      path = user ?
        right.path.replace(/(.*\/|^):([a-z0-9_\-\.\*\@\#]+)(\/.*|$)/,
          function($, $1, $2, $3) {
            var value = getProp(user, $2);
            if(value) {
              return $1 + value + $3;
            }
            return '';
          }) :
        right.path;
      return path && new RegExp('^'+path+'$').test(req.path);
    })) {
      next();
    } else {
      return next(new options.errorConstructor(options.accessErrorMessage));
    }
  };
}

// Static properties
reaccess.OPTIONS = 1;
reaccess.HEAD = 2;
reaccess.GET = 4;
reaccess.POST = 8;
reaccess.PUT = 16;
reaccess.PATCH = 32;
reaccess.DELETE = 64;
reaccess.READ_MASK = reaccess.OPTIONS | reaccess.HEAD | reaccess.GET;
reaccess.WRITE_MASK = reaccess.POST | reaccess.PUT | reaccess.PATCH |
  reaccess.DELETE;
reaccess.ALL_MASK = reaccess.READ_MASK | reaccess.WRITE_MASK;

// Helpers
function getProp(obj, prop) {
  return getValues([obj], prop)[0];
}

function getValues(values, path) {
  var index = path.indexOf('.');
  var part = -1 !== index ? path.substring(0, index) : path;
  path = -1 !== index ? path.substring(index + 1) : '';
  
  values = values.reduce(function(values, value) {
    if((value instanceof Object) && '*' === part) {
      values = values.concat(Object.keys(value).map(function(key) {
        return value[key];
      }));
    }
    if((value instanceof Object) && '@' === part) {
      values = values.concat(Object.keys(value).filter(function(key) {
        return /^[^0-9]+$/.test(key);
      }).map(function(key) {
        return value[key];
      }));
    }
    if((value instanceof Array) && '#' === part) {
      values = values.concat(value);
    }
    if(-1 === ['@', '#', '*'].indexOf(part) &&
      'undefined' !== typeof value[part]) {
      values.push(value[part]);
    }
    return values;
  }, []).filter(function(value) {
    return 'undefined' !== typeof value;
  });
  return '' === path ? values : getValues(values, path);
}

module.exports = reaccess;

