// NPM MODULES
const cash = require('koa-cash');

// LIBRARY MODULES
const config = require('../lib/config');
const Cache = require('../lib/cache');
const logger = require('../lib/logger');

const httpCacheOptions = {
  name: 'HTTP',
  debugLogging: config.onDevelop
};

// Instantiate cache whose methods to pass on to koa-cash.
const httpCache = new Cache(httpCacheOptions);

// Set koa-cash options.
// TODO: figure out why we can't return a rejected promise as a 'yieldable'.
const cashOptions = {
  maxAge: httpCache.timeToLive,
  set (key, value, timeToLive) {
    return httpCache.set(key, value).catch(reason => { return undefined; });
  },
  get (key, timeToLive) {
    return httpCache.get(key).catch(reason => { return undefined; });
  }
};

module.exports.middleware = cash(cashOptions);
module.exports.flushCache = httpCache.flush;

