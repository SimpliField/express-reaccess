function reaccess(options) {

  options = options || {};

  options.rightsProp = options.rightsProp || 'users.rights';
  options.errorConstructor = options.errorConstructor || Error;

  return function reaccessMiddleware(req, res, next) {
    var rights = getProp(req, options.rightsProp);
    if(!(rights && rights instanceof Array)) {
      throw new Error('The rights property must be an array.');
    }
    if(rights.some(function(right) {
      return right.methods && right.path &&
        right.methods&reaccess[req.method.toUpperCase()] &&
        new RegExp('^'+right.path+'$').test(req.path);
    })) {
      next();
    } else {
      return next(new options.errorConstructor('Unauthorized access!'));
    }
  };
}

// Static properties
reaccess.OPTIONS = 1;
reaccess.GET = 2;
reaccess.POST = 4;
reaccess.PUT = 8;
reaccess.PATCH = 16;
reaccess.DELETE = 32;
reaccess.METHODS = reaccess.OPTIONS | reaccess.GET |
  reaccess.POST | reaccess.PUT | reaccess.PATCH |
  reaccess.DELETE;

// Helpers
function getProp(obj, prop) {
  var nodes = prop.split('.');
  var node;
  do {
    node = nodes.shift();
    obj = obj[node] || (obj[node] = {});
  } while(nodes.length);
  return obj;
}

module.exports = reaccess;

