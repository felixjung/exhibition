// NPM MODULES
const _ = require('lodash');

// APPLICATION MODULES
const config = require('./config');
const logger = require('./logger');

// MODULE IMPLEMENTATION

function addExhibitPrefix(exhibitPrefix, router) {

  router.prefix(exhibitPrefix);

  return router;
}

function getExhibit(exhibitConfig) {
  const exhibitName = exhibitConfig.name;

  try {
    const exhibitModule = require(exhibitName)(exhibitConfig);
  } catch (err) {
    const defaultMessage = `Unable to require exhibit ${ exhibitName }.`;
    const errorMsg = err.message || defaultMessage;

    logger.error(errorMsg);
    process.exit(1);
  }

  const exhibitMiddlewares = _.map(exhibitModule.routers, router => {
    const configuredRouter = addExhibitPrefix(exhibitConfig.prefix, router);

    return configuredRouter.routes();
  });
  const contextKey = exhibitName.split('-')[1];

  return {
    contextKey,
    context: exhibitModule.context,
    middlewares: exhibitMiddlewares
  };
}

function registerExhibit(exhibit, app) {
  logger.debug(`Registering exhibit ${ exhibit.contextKey }.`);

  _.set(app, `context.${ exhibit.contextKey }`, exhibit.context);
  _.forEach(exhibit.middlewares, middleware => app.use(middleware));
}

function registerExhibits(app) {
  const exhibitConfigs = config.exhibits;
  const exhibits = _.map(exhibitConfigs, getExhibit);


  _.forEach(exhibits, exhibit => {
    registerExhibit(exhibit, app);
  });
}

module.exports = registerExhibits;
