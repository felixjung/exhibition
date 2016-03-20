// NODE MODULES
const fs = require('fs');
const path = require('path');

// NPM MODULES
const _ = require('lodash');

/**
 * @description Reads the json config file and  adds various dynamic properties
 *              to the config object before returning.
 *
 * @return {object} The application's configuration object.
 *
 * TODO: Check if config file exists and give warning, if not.
 *
 */
function createConfig() {
  const applicationPath = path.resolve(__dirname, './../..');
  const packageJsonPath = `${applicationPath}/package.json`;
  const configPath = `${applicationPath}/config.json`;

  const env = process.env.NODE_ENV;
  const development = env === 'development';
  const npm = JSON.parse(fs.readFileSync(packageJsonPath));
  const config = JSON.parse(fs.readFileSync(configPath));

  return _.merge(
    config,
    { appRoot: applicationPath, env, development, appName: npm.name }
  );
}

module.exports = createConfig();
