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
      var path = user ?
        right.path.replace(/(.*\/|^):([a-z0-9_\-\.]+)(\/.*|$)/,
          function($, $1, $2, $3) {
            var value = getProp(user, $2);
            if(value) {
              return $1 + value + $3;
            }
            return '';
          }) :
        right.path;
      return right.methods && path &&
        right.methods&reaccess[req.method.toUpperCase()] &&
        new RegExp('^'+path+'$').test(req.path);
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
  var nodes = prop.split('.');
  var node;
  do {
    node = nodes.shift();
    if(!obj[node]) {
      return '';
    }
    obj = obj[node];
  } while(nodes.length);
  return obj;
}

module.exports = reaccess;

