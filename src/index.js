var miniquery = require('miniquery');
var regexpTpl = require('regexp-tpl');
var debug = require('debug')('reacess');

function reaccess(options) {

  options = options || {};
  options.rightsProps = options.rightsProps || ['_rights'];
  options.valuesProps = options.valuesProps  || [];
  options.errorConstructor = options.errorConstructor || Error;
  options.accessErrorMessage = options.accessErrorMessage || 'Unauthorized access!';

  return function reaccessMiddleware(req, res, next) {
    var rights;
    var values;
    var regExp;

    debug('Checking access for:"', req.path);

    // Getting rights
    rights = reaccess.getRightsFromReq(options.rightsProps, req);

    // Getting values to fill rights path templates
    values = reaccess.getValuesFromReq(options.valuesProps, req);

    if(reaccess.test(rights, values, req.method, req.path)) {
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
reaccess.test = function reaccessTest(rights, values, method, path) {
  return rights.some(function(right) {
    var result = false;
    debug('Evaluating right:"', right);
    if(!('undefined' !== typeof right.methods &&
      'undefined' !== typeof right.path &&
      right.methods&reaccess[method.toUpperCase()])) {
      debug('Method "' + method + '" do not match methods:"', right.methods);
      return false;
    }
    regExp = regexpTpl(values, '^' + right.path + '$', '', /(.*\/|\^):([a-z0-9_\-\.\*\@\#]+)(\/.*|\$)/);
    result = regExp && regExp.test(path);
    debug(
      'Testing : /^' + right.path.replace('/', '\\/') + '$/"' +
      ' on "' + path + '" led to ' + (result ? 'SUCCESS' : 'FAILURE')
    );
    return result;
  });
};

reaccess.getRightsFromReq = function reaccessGetRightsFromReq(rightsProps, req) {
  var rights = rightsProps.reduce(function(rights, prop) {
    return miniquery(prop, [req]).reduce(function(finalRights, currentRights) {
      return finalRights.concat(currentRights);
    }, []);
  }, []);
  debug(
    'Rights properties "' + rightsProps.join(',') + '"' +
    ' has been resolved to:', rights
  );
  if(!(rights && rights instanceof Array)) {
    throw new Error('The rights property must be an array.');
  }
  return rights;
};

reaccess.getValuesFromReq = function reaccessGetValuesFromReq(valuesProps, req) {
  var values = (valuesProps || []).reduce(function(values, prop) {
    return values.concat(miniquery(prop, [req]));
  }, []);
  debug(
    'Values properties "' + valuesProps.join(',') +
    '" has been resolved to:', values
  );

  return values;
};

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
