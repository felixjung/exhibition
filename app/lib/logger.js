// NPM MODULES
const winston = require('winston');
const posixSyslog = require('winston-syslog-posix');
const moment = require('moment');
const chalk = require('chalk');

// CMS MODULES
const config = require('./config');

// MODULE IMPLEMENTATION

const Logger = winston.Logger;
const Console = winston.transports.Console;
const Syslog = posixSyslog;

// Set default transports for the logger.
const defaultOptions = {
  level: config.env === 'development' ? 'debug' : 'info',
  prettyPrint: true,
  timestamp: createTimestamp,
  formatter: formatLogEntry
};

const transports = [
  new Console(defaultOptions)
];

// Add syslog transport to winston on non-development environments.
if (config.env !== 'development') {
  // Set syslog options.
  const syslogOptions = {
    level: 'info',
    identity: config.appName,
    facility: 'local0',
    unmapped: 'info',
    showPid: true
  };

  transports.push(new Syslog(syslogOptions));
}

/**
 * @description Parses a meta object into a formatted json string.
 */
function parseMeta(meta) {
  const metaString = `\n${ JSON.stringify(meta, null, 2) }`;

  return metaString;
}

/**
 * @description Takes a winston log object (entry) and returns a nicely
 *              formatted string.
 */
function formatLogEntry(entry) {
  'use strict';

  const timeStamp = `[${ chalk.gray(entry.timestamp()) }]`;
  const meta = entry.meta && Object.keys(entry.meta).length ?
    parseMeta(entry.meta) : '';
  const colorizeFn = getLevelColorFunction(entry.level);
  const coloredLevel = colorizeFn(entry.level.toUpperCase());

  let message =  timeStamp + ` - ${ coloredLevel } - ` +
    `${ entry.message || '' } ${ meta }`;

  message = chalk.supportsColor ? message : chalk.stripColor(message);

  return message;
}

/**
 * @description Returns a formatted timestamp string created using moment.js.
 *
 * TODO: Use ES2015 default parameter values once Node catches up.
 */
function createTimestamp(format) {
  format = format || 'HH:mm:ss';

  return moment().format(format);
}

/**
 * @description Returns a chalk color function based on the specified log level
 *              and the colorMap.
 *
 * @param {string} level - The logging level for which to obtain a color
 *        function.
 * @param {object} colorMap - The map used to determine the color for a
 *        level.
 *
 * @return {function} The chalk coloring function for the level.
 *
 * TODO: Use ES2015 default parameter value notation once node catches up.
 */
function getLevelColorFunction(level, colorMap) {
  // Set console logging colors for levels.
  const defaultColorMap = {
    debug: 'gray',
    info: 'blue',
    notice: 'cyan',
    warn: 'yellow',
    error: 'red',
    crit: 'red',
    alert: 'red',
    emerg: 'bgRed',
    default: 'white'
  };

  colorMap = colorMap || defaultColorMap;

  const color = colorMap[level] || colorMap.default;

  return chalk[color];
}

module.exports = new Logger({ transports });
