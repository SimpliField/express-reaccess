var miniquery = require('miniquery');
var regexpTpl = require('regexp-tpl');
var debug = require('debug')('reacess');

function reaccess(options) {

  options = options || {};
  options.rightsProps = options.rightsProps ? options.rightsProps :
    options.rightsProp ? [options.rightsProp] :
      ['_rights'];
  options.valuesProps = options.valuesProps ? options.valuesProps :
    options.valuesProp ? [options.valuesProp] : // Legacy
      options.userProp ? [options.userProp] :
        []; // Legacy
  options.errorConstructor = options.errorConstructor || Error;
  options.accessErrorMessage = options.accessErrorMessage || 'Unauthorized access!';

  return function reaccessMiddleware(req, res, next) {
    var rights, regExp;

    debug('Checking access for:"', req.path);
    rights = options.rightsProps.reduce(function(rights, prop) {
      return miniquery(prop, [req]).reduce(function(finalRights, currentRights) {
        return finalRights.concat(currentRights);
      }, []);
    }, []);
    debug(
      'Rights properties "' + options.rightsProps.join(',') + '"' +
      ' has been resolved to:', rights
    );
    var rootValues;
    if(!(rights && rights instanceof Array)) {
      throw new Error('The rights property must be an array.');
    }
    if(options.valuesProps) {
      rootValues = options.valuesProps.reduce(function(values, prop) {
        return values.concat(miniquery(prop, [req]));
      }, []);
      debug(
        'Values properties "' + options.valuesProps.join(',') +
        '" has been resolved to:', rootValues
      );
    }
    if(rights.some(function(right) {
      var path = '';
      var result = false;
      debug('Evaluating right:"', right);
      if(!('undefined' !== typeof right.methods &&
        'undefined' !== typeof right.path &&
        right.methods&reaccess[req.method.toUpperCase()])) {
        debug('Method "' + req.method + '" do not match methods:"', right.methods);
        return false;
      }
      path = right.path;
      regExp = regexpTpl(rootValues, path, '', /(.*\/|^):([a-z0-9_\-\.\*\@\#]+)(\/.*|$)/);
      result = regExp && regExp.test(req.path);
      debug(
        'Testing : /^' + path.replace('/', '\\/') + '$/"' +
        ' on "' + req.path + '" led to ' + (result ? 'SUCCESS' : 'FAILURE')
      );
      return result;
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

// Static methods
reaccess.methodsAsStrings = function reaccessMethodsAsStrings(methods) {
  var strings = [];
  if(methods&reaccess.OPTIONS) {
    strings.push('OPTIONS');
  }
  if(methods&reaccess.HEAD) {
    strings.push('HEAD');
  }
  if(methods&reaccess.GET) {
    strings.push('GET');
  }
  if(methods&reaccess.POST) {
    strings.push('POST');
  }
  if(methods&reaccess.PUT) {
    strings.push('PUT');
  }
  if(methods&reaccess.PATCH) {
    strings.push('PATCH');
  }
  if(methods&reaccess.DELETE) {
    strings.push('DELETE');
  }
  return strings;
};
reaccess.stringsToMethods = function reaccessStringsToMethods(strings) {
  return strings.reduce(function(methods, str) {
    return methods | ('number' === typeof reaccess[str.toUpperCase()] ?
      reaccess[str.toUpperCase()] : 0);
  }, 0);
};

module.exports = reaccess;
