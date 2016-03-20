'use strict';

// NPM MODULES
const NodeCache = require('node-cache');
const _ = require('lodash');

// LIBRARY MODULES
const config = require('./config');
const logger = require('./logger');

const nodeCacheDefaults = {
  errorOnMissing: true,
  stdTTL: config.cache.timeToLive || 0,
  checkperiod: config.cache.checkPeriod || 600
};

const cacheDefaults = {
  name: 'Cash',
  debugLogging: false
};

class Cache {
  constructor(options) {
    const _this = this;

    // Get node-cache options from options.
    const nodeCacheOptions = _.defaults(
      _.pick(
        options,
        ['stdTTL', 'checkperiod', 'errorOnMissing', 'useClones']
      ),
      nodeCacheDefaults
    );

    // The node-cache instance for low level access.
    this.cache = new NodeCache(nodeCacheOptions);

    // Register event listeners.
    _.forEach(options.listeners, (listenerFn, name) => {
      _this.cache.on(name, listenerFn);
    });

    // Get cache options from cacheDefaults and options.
    const cacheOptions = _.defaults(
      _.pick(options, ['name', 'debugLogging']),
      cacheDefaults
    );

    // Set properties on Cache intance.
    this.timeToLive = nodeCacheOptions.stdTTL;
    _.defaults(this, cacheOptions);
  }

  get (key, timeToLive) {
    const _this = this;

    if (_this.debugLogging) {
      logger.debug(`Trying to get key ${key} from cache ${_this.name}.`);
    }

    return new Promise((resolve, reject) => {
      _this.cache.get(key, (err, value) => {
        if (err || _.isEmpty(value)) {
          if (_this.debugLogging) {
            logger.debug(`Could not get key ${key} from cache ${_this.name}.`);
          }

          reject(err);
        } else {
          if (_this.debugLogging) {
            logger.debug(`Returning value for key ${key} from cache ` +
              `${_this.name}.`
            );
          }

          resolve(value);
        }
      });
    });
  }

  set (key, value, timeToLive) {
    const _this = this;

    timeToLive = timeToLive || _this.timeToLive;

    if (_this.debugLogging) {
      logger.debug(`Trying to set key ${key} in cache ${_this.name}.`);
    }

    return new Promise((resolve, reject) => {
      _this.cache.set(key, value, timeToLive, (err, success) => {
        if (err) {
          if (_this.debugLogging) {
            logger.debug(`Could not set key ${key} in cache ${_this.name}.`);
          }

          reject(err);
        }

        if (_this.debugLogging) {
          logger.debug(`Succesfully set key ${key} in cache ${_this.name}.`);
        }

        resolve({ key, value });
      });
    });
  }

  flush () {
    // FIXME: the this binding in this function is messed up. That's why
    //        `this.cache` is undefined.
    this.cache.flushAll();
  }
}

module.exports = Cache;
