/**
 * @description This module contains the API functions implementation for the 
 *              application.
 * 
 */

const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')
require('dotenv').config(); // This line loads the .env file
const configPath = __dirname +'/..'+ process.env.HEALTHCHECK_CONFIG_PATH;
const { logger } = require('./logger');

/**
 * @description 
 * @returns json array of health check modules
 * Example: [ {"name":"check_repo_clone","description":"test"},
 *            {"name":"check_repo_commit","description":"test"}]
 * 
 */
exports.apiHealthChecks = () => {
  logger.info('HEALTHCHECK_CONFIG_PATH: ' + configPath)
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(configFile);
  const configuredChecks = config.health_checks; 

  const modulesPath = 'src/healthChecks/'
  // An array to store the names of the health check files
  let healthCheckFiles = []
  // An array to store the names of the health check files + description
  let healthCheckInventory = []

  // get a list of all the health check modules
  try {
    // initial read of the 'HealthChecks/' folder
    healthCheckFiles = fs.readdirSync(modulesPath).filter(file => {
      return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
    })

    // logger.info("healthCheckModules: " + util.inspect(healthCheckFiles))
    // logger.info("configuredChecks: " + util.inspect(configuredChecks))

    healthCheckFiles.forEach(file => {
      const code = fs.readFileSync(modulesPath + '/' + file, 'utf8')

      // Regex to extract the description from the code 
      const regex = /^[\s\S]*?\* @description\s+(.*)$/m
      const match = regex.exec(code)
      // string '_' and '.js' from the file name and make it uppercase
      file = file.replace('.js', '')
      // logger.info('configuredChecks: '+ util.inspect(configuredChecks) +" file: "+ file )
      const isFilenameInConfiguredChecks = configuredChecks.some(check => check.name === file);

      if (match) {
        const description = match[1];
        logger.info(description);
        healthCheckInventory.push({
          name: file.replaceAll('_', ' ').toUpperCase(),
          state: isFilenameInConfiguredChecks ? 'active' : 'inactive', // Verify if the check exists in the config.yml
          description: description
        });
      } else {
        healthCheckInventory.push({
          name: file.replaceAll('_', ' ').toUpperCase(),
          state: isFilenameInConfiguredChecks ? 'active' : 'inactive', // Verify if the check exists in the config.yml
          description: 'No @description found'
        });
        logger.info('No @description found');
      }

    })

  } catch (err) {
    logger.info('healthCheckInventory: '+ util.inspect(healthCheckInventory))
    logger.error(err)
  }

  logger.info('readHealthCheckModules - complete')

  return healthCheckInventory
}

/**
 * @description
 * @returns Yaml object of the configuration file
 * 
 */
exports.apiGetConfig = () => {
  logger.info('Loading Health Check Configuration')
  // load App configurations from .github/config.yml
  const configPath = '.github/config.yml'
  try {
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'))
    // display the configuration file yaml as a string
    const configString = yaml.dump(config)

    // logger.info('configYaml: ' + configString)
    return configString
  } catch (err) {
    logger.error(err)
  }
}

/**
 * @description Safe the configuration file
 * 
 * 
 */
exports.apiSaveConfig = (config) => {
  logger.info('Saving Health Check Configuration')
  // validate if the config data is correct JSON
  if (config === undefined) {
    logger.error('Trying to save invalid configuration data: ' + config)
    return
  }

  // validate if the config data is correct JSON
  if (typeof config !== 'object') {
    logger.error('Trying to save invalid configuration data: ' + config)
    return
  }

  logger.info('config: ' + util.inspect(config))

  // save App configurations to .github/config.yml
  try {
    fs.writeFileSync(configPath, yaml.dump(config))
  } catch (err) {
    logger.error(err)
  } 
}

/**
 * @description Markdown object of the documentation file (docs/README.md)
 * @returns Markdown
 * 
 */
exports.apiGetDocumentation = () => {
  logger.info('Loading Documentation')
  // load App documentation from docs/README.md
  try {
    const documentation = fs.readFileSync('docs/README.md', 'utf8')
    // logger.info('documentation: ' + util.inspect(documentation))
    return documentation
  } catch (err) {
    logger.error(err)
  }
}

/**
 * @description
 * @returns 
 * 
 */
exports.apiGetReports = () => {
  logger.info('Loading Reports')
 
  try {
    const reports = fs.readFileSync('reports/report.json', 'utf8')
    logger.debug('apiGetReports() - reports: ' + util.inspect(reports))
    return JSON.parse(reports)
  } catch (err) {
    logger.error(err)
  }
}