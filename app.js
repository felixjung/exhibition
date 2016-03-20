// NODE MODULES
const fs = require('fs');
const path = require('path');

// NPM MODULES
const app = require('koa')();
const requestLogger = require('koa-logger');
const _ = require('lodash');

// LIBRARY MODULES
const config = require('./app/lib/config');
const logger = require('./app/lib/logger.js');
const errors = require('./app/lib/errors');
const registerExhibits = require('./app/lib/exhibit_loader');

// MIDDLEWARE MODULES
const errorMiddleware = require('./app/middleware/errors');
const httpCache = require('./app/middleware/http_cache');

// Register middleware.
if (config.development) {
  app.use(requestLogger()); // Fine-grained request logging.
}
app.use(errorMiddleware);
app.use(httpCache.middleware);

// Register all configured exhibits.
registerExhibits(app);

// Set up event handlers.
app.on('error', function (err) {
  // Log the error
  logger.error(`${ err.status }: ${ err.message } at '${ err.location }'.`);
  logger.debug(`Error object`, err);
});


// Launch application.
const host = config.host;
const port = config.port;

app.listen(port, host, () => {
  logger.info(`${config.appName} is listening at http://%s:%s`, host, port);
});
