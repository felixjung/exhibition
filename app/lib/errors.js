// NPM MODULES
const _ = require('lodash');

// APP MODULES
const config = require('./config');

// MODULE IMPLEMENTATION
// TODO: add more HTTP statuses.

const defaultError = {
  status: 500,
  message: 'Internal server error'
};

const errorMap = {
  NOT_FOUND: {
    status: 404,
    message: 'Page not found'
  },
  INTERNAL: defaultError,
  default: defaultError
};

module.exports = errorMap;
