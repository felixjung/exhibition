// LIBRARY MODULES
const config = require('../lib/config');
const errors = require('../lib/errors');

module.exports = function* (next) {
  const _this = this;

  try {
    yield next;
  } catch (err) {
    // Update error object
    err.status = err.status || errors.default.status;
    err.message = err.message || errors.default.message;
    err.location = this.url;

    this.type = 'text/json';
    this.body = err;

    // Delegate to centralized app error handling.
    _this.app.emit('error', err, this);
  }
};
