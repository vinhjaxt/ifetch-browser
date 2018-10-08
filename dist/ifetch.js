'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var qs = _interopDefault(require('query-string'));

/* eslint-env browser */
const toString = Object.prototype.toString;

/**
 * Test if x is plain object
 * @param {any} x variable to test
 * @return {Boolean}
 */
function isPlainObject (x) {
  let prototype;
  // eslint-disable-next-line no-return-assign
  return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}))
}

/**
 * Merge url instance
 * @param {String|URL} path path or url string
 * @param {URL} url base URL instance
 * @return {URL}
 */
function mergeURL (path, url) {
  return new URL(path, url)
}

/**
 * Merge objects
 * @param {Object} target object to store result
 * @param  {...Object} sources source object
 * @return target object
 */
function merge (target) {
  const sources = Array.prototype.slice.call(arguments, 1);
  for (const source of sources) {
    for (const [key, sourceValue] of Object.entries(source)) {
      if (undefined === sourceValue) {
        continue
      }

      const targetValue = target[key];
      if (targetValue instanceof URL) {
        target[key] = mergeURL(sourceValue, targetValue);
      } else if (isPlainObject(sourceValue)) {
        if (isPlainObject(targetValue)) {
          target[key] = merge({}, targetValue, sourceValue);
        } else {
          target[key] = merge({}, sourceValue);
        }
      } else if (sourceValue instanceof Array) {
        target[key] = merge([], sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return target
}

/**
 * Append params to url
 * @param {URL} url url to append to
 * @param {Object} o params object
 */
function appendSearchParams (url, o, prefix) {
  for (let p in o) {
    if (o.hasOwnProperty(p)) {
      const k = prefix ? prefix + '[' + p + ']' : p;
      const v = o[p];
      if (v !== null && typeof v === 'object') {
        appendSearchParams(url, v, k);
      } else {
        url.searchParams.append(k, v);
      }
    }
  }
  return url
}

function httpBuildQuery (o) {
  return qs.stringify(o, '&', '=', { encodeURIComponent })
}

function parseJSON (t) {
  if (t instanceof Response) {
    return t.text().then(parseJSON)
  }
  return JSON.parse(t.replace('for (;;);\r\n', ''))
}

var util = {
  merge,
  isPlainObject,
  toString,
  mergeURL,
  parseJSON,
  httpBuildQuery,
  appendSearchParams
};

/* eslint-env browser */

const DEFAULT_OPTIONS = {
  method: 'get',
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  },
  body: null,
  credentials: 'include',
  cache: 'no-cache',
  redirect: 'follow' // set to `manual` to extract redirect headers, `error` to reject redirect
};

/**
 * ifetch - fetch api for node
 * @param {String|URL} url URL
 * @param {Object} [options]
 * @return {Promise}
 */
function ifetch (url, options) {
  try {
    if (!(url instanceof URL)) {
      url = new URL(url, location.href);
    }

    let body;
    if (options) {
      body = options.body;
      options = util.merge({}, DEFAULT_OPTIONS, options);
    } else {
      options = util.merge({}, DEFAULT_OPTIONS);
    }

    if (options.qs) {
      util.appendSearchParams(url, options.qs);
      delete options['qs'];
    }

    let noParseJSON;
    if (options.hasOwnProperty('noParseJSON')) {
      noParseJSON = options.noParseJSON;
      delete options['noParseJSON'];
    }

    // json data
    let json = false;
    if (options.hasOwnProperty('json')) {
      options.headers['Accept'] = 'application/json';
      if (options.method.toLowerCase() !== 'get') {
        options.headers['Content-Type'] = 'application/json';
        if (!body) {
          options.body = JSON.stringify(options.json);
        }
      }
      delete options['json'];
      json = true;
    }

    // url encoded data
    if (options.data && util.isPlainObject(options.data)) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      if (!body) {
        options.body = util.httpBuildQuery(options.data);
      }
      delete options['data'];
    }

    options.referer = url.href;

    if (json && !noParseJSON) {
      return fetch(url, options).then(util.parseJSON)
    }
    return fetch(url, options)
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Set default ifetch options
 * @param {Object} baseOptions default options
 * @return {Function} fetch function
 */
ifetch.defaults = function (baseOptions) {
  let baseURL;
  if (baseOptions.url) {
    baseURL = baseOptions.url;
    delete baseOptions['url'];
    if (!(baseURL instanceof URL)) {
      baseURL = new URL(baseURL); // it'll throw error if url not valid
    }
  }

  let baseOptionsFunction;
  if (baseOptions.options) {
    baseOptionsFunction = baseOptions.options;
    delete baseOptions['options'];
  }

  /**
   * ifetch function
   * @param {String|URL} url
   * @param {Object} [options]
   */
  return function (url, options) {
    // ifetch function
    if (baseURL) {
      url = util.mergeURL(url, baseURL);
    }
    if (baseOptionsFunction && (typeof (baseOptionsFunction) === 'function')) {
      if (options) {
        options = util.merge({}, baseOptions, baseOptionsFunction(), options);
      } else {
        options = util.merge({}, baseOptions, baseOptionsFunction());
      }
    } else {
      if (options) {
        options = util.merge({}, baseOptions, options);
      } else {
        options = util.merge({}, baseOptions);
      }
    }
    return ifetch(url, options)
  }
};

module.exports = ifetch;
