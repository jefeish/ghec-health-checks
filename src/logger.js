// src/logger.js
const pino = require('pino');
const pretty = require('pino-pretty');
var logLevel = 'info';

function setLogLevel(newLogLevel) {
  try {
    logLevel = newLogLevel ? newLogLevel : 'info';
    // Reconfigure the logger with the new log level
    logger.level = logLevel;
  } catch (e) {
    console.error('Error setting Log-Level, defaulting to "info":', e);
    logLevel = 'info';
    logger.level = logLevel;
  }
}

const logger = pino({
  level: logLevel,
}, pretty({
  colorize: true
}));

module.exports = { logger, setLogLevel };