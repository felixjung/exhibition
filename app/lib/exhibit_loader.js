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
  const exhibitModule = require(exhibitName)(exhibitConfig);

  const exhibitMiddlewares = _.map(exhibitModule.routers, router => {
    const configuredRouter = addExhibitPrefix(exhibitConfig.prefix, router);

    return configuredRouter.routes();
  });
  const contextKey = exhibitName.split('-')[0];

  return {
    contextKey,
    middlewares: exhibitMiddlewares,
    context: exhibitModule.context
  };
}

function registerExhibit(exhibit, app) {
  logger.debug(`Registering exhibit ${exhibit.contextKey}`, exhibit);

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
