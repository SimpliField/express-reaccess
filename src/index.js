var escRegExp = require('escape-regexp-component');

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
    var rights;
    if(options.debug) {
      options.debug('Checking access for:"', req.path);
    }
    rights = options.rightsProps.reduce(function(rights, prop) {
      return getValues([req], prop).reduce(function(finalRights, currentRights) {
        return finalRights.concat(currentRights);
      }, []);
    }, []);
    if(options.debug) {
      options.debug('Rights properties "' + options.rightsProps.join(',') + '"' +
        ' has been resolved to:', rights);
    }
    var rootValues;
    if(!(rights && rights instanceof Array)) {
      throw new Error('The rights property must be an array.');
    }
    if(options.valuesProps) {
      rootValues = options.valuesProps.reduce(function(values, prop) {
        return values.concat(getValues([req], prop));
      }, []);
      if(options.debug) {
        options.debug('Values properties "' + options.valuesProps.join(',') +
          '" has been resolved to:', rootValues);
      }
    }
    if(rights.some(function(right) {
      var path = '';
      var result = false;
      if(options.debug) {
        options.debug('Evaluating right:"', right);
      }
      if(!('undefined' !== typeof right.methods &&
        'undefined' !== typeof right.path &&
        right.methods&reaccess[req.method.toUpperCase()])) {
        if(options.debug) {
          options.debug('Method "' + req.method + '" do not match methods:"',
            right.methods);
        }
        return false;
      }
      path = right.path;
      if(options.valuesProps) {
        while(/(.*\/|^):([a-z0-9_\-\.\*\@\#]+)(\/.*|$)/.test(path)) {
          path = path.replace(/(.*\/|^):([a-z0-9_\-\.\*\@\#]+)(\/.*|$)/,
            function($, $1, $2, $3) {
              var values = getValues(rootValues, $2);
              if(values.length) {
                return $1 + (1 === values.length ?
                  escRegExp(values[0]) :
                  '(' + values.map(escRegExp).join('|') + ')') + $3;
              }
              return '';
            });
        }
      }
      result = path && new RegExp('^'+path+'$').test(req.path);
      if(options.debug) {
        options.debug('Testing : /^' + path.replace('/', '\\/') + '$/"' +
          ' on "' + req.path + '" led to ' + (result ? 'SUCCESS' : 'FAILURE'));
      }
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

// Helpers
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
