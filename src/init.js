/**
 * @description This module contains the functions that are used to initialize
 *              the application.
 *             - registerHealthCheckModules: load all health check modules from the HealthChecks/ folder
 *             - loadConfig: load App configurations from .github/config.yml  
 * 
 */

const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')


// /**
//  * @description Use the 
//  * @param {*} app
//  * @returns json array of health check modules
//  * 
//  */
// exports.readHealthCheckFiles = (app, modulesPath) => {
//   app.log.info('readHealthCheckFiles')
//   const healthCheckModules = readHealthCheckModules(app, modulesPath)
//   app.log.info('readHealthCheckFiles: '+ healthCheckModules)
//   app.log.info('readHealthCheckFiles(json): ' + JSON.stringify(healthCheckModules))

//   return healthCheckModules;
// }

/**
 * @description read the health check modules from the HealthChecks/ folder
 * @param {*} app 
 * @param {*} modulesPath 
 * @returns 
 */
function readHealthCheckModules(app, modulesPath) {
  app.log.info('readHealthCheckModules: read the health check modules from the HealthChecks/ folder')

  // An array to store the names of the health check files
  let healthCheckFiles = ['test']

  try {
    // initial read of the 'HealthChecks/' folder
    healthCheckFiles = fs.readdirSync(modulesPath).filter(file => {
      return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
    })

    app.log.debug("healthCheckModules: " + util.inspect(healthCheckFiles))

  } catch (err) {
    app.log.error(err)
  }

  app.log.info('readHealthCheckModules: complete')
  app.log.info("readHealthCheckModules (files): " + util.inspect(healthCheckFiles))
 
  return healthCheckFiles
}

/**
 * @description register the health check modules
 * @param {*} app
 * @returns
 * 
 */
exports.registerHealthCheckModules = async (app, modulesPath) => {
  app.log.info('registerHealthCheckModules: register the health check modules')
  app.log.info("modulesPath: " + modulesPath)
  
  const healthCheckFiles = readHealthCheckModules(app, modulesPath)
  let healthCheckModules = new Map()

  try {
    healthCheckModules = await mapModuleNamesToObjects(app, healthCheckFiles)
  } catch (err) {
    app.log.error(err)
  }

  app.log.info("healthCheckModules: " + util.inspect(healthCheckModules))
  app.log.info('registerHealthCheckModules - complete')

  return healthCheckModules
}

/**
 * @description Map the module name to the actual object
 * @param {*} healthCheckFiles 
 * @returns 
 */
async function mapModuleNamesToObjects(app, healthCheckFiles) {
  // A Map to store associated HealthCheck module-names and objects
  app.log.info('mapModuleNamesToObjects: Map the module name to the actual object')
  let healthCheckModules = new Map()

  // Create a `healthChecks` map that associates module names to command objects.
  for (const check of healthCheckFiles) {
  // healthCheckFiles.forEach(check => {
    // open the file in 'check' and get the module
    const filePath = './src/HealthChecks/' + check
    app.log.debug("filePath: " + filePath)
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Search for the module name using a regular expression
    const moduleNameRegex = /(?<=\bmodule\.exports\s*=\s*)\w+/;
    const moduleName = fileContents.match(moduleNameRegex);

    try {
      // get an instance of the module
      const cmd = require(process.cwd() + '/src/healthChecks/' + check)
      const command = cmd.getInstance()

      // validate the module
      const result = await command.execute(app, 'test')
      app.log.info("initial registration exec: " + JSON.stringify(result))

      // check if the returned result is a JSON object with the correct keys
      // if not, log the event and skip the module
      const requiredKeys = ['name', 'description', 'result', 'status'];
      const hasValidKeys = requiredKeys.every(key => key in result);
      
      if (!hasValidKeys) {
        throw new Error('Invalid result object. Missing one or more required keys. \nRequired Keys: '+ requiredKeys);
      }
      else {
        app.log.info('Module is valid: healthCheckModules['+moduleName+'] : '+ util.inspect(command))
        // add the module to the healthChecks map
        healthCheckModules[moduleName] = command
      }
    } catch (err) {
      app.log.error('Error loading health check module: ' + check +'\n'+ err +'\nSkipping this module')
    }
  }

  app.log.info('mapModuleNamesToObjects: healthCheckModules '+ util.inspect(healthCheckModules))
  // write the item registry to the log
  if (healthCheckModules) {
    Object.keys(healthCheckModules).forEach(item => {
      app.log.info("healthCheckModules: " + item + ', ' + util.inspect(healthCheckModules[item]))
    })

    app.log.info('healthCheckModules: '+ JSON.stringify(healthCheckModules))
    app.log.info('mapModuleNamesToObjects: complete')  
    return healthCheckModules
  }
  else {
    app.log.error('No health check modules found')
    return null
  }
}

/**
 * @description
 * @param {*} app
 * @returns
 * 
 */
exports.loadConfig = (app, configPath) => {
  app.log.info('Loading Health Check Configuration')
  // load App configurations from .github/config.yml
  try {
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'))
    app.log.debug('config: ' + util.inspect(config))
    return config
  } catch (err) {
    app.log.error(err)
  }
}