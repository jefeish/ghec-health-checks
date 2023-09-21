/**
 * This code maps the 'HealthCeck' classes by name 
 * 
 * 
 */

const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')

/**
 * @description:
 * @param {*} app
 * @returns
 * 
 */
exports.registerHealthCheckModules = (app, modulesPath) => {
  app.log.info('registerHealthCheckModules')

  // An array to store the names of the health check files
  let healthCheckFiles = []
  // A Map to store associated HealthCheck module-names and objects
  let healthCheckModules = new Map()

  try {
    // initial read of the 'HealthChecks/' folder
    healthCheckFiles = fs.readdirSync(modulesPath).filter(file => {
      return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
    })

    app.log.debug("healthCheckFiles: " + util.inspect(healthCheckFiles))

    // map the module names to objects
    healthCheckModules = mapModuleNamesToObjects(app, healthCheckFiles)
   
  } catch (err) {
    app.log.error(err)
  }

  app.log.info('registerHealthCheckModules - complete')
  app.log.info("healthCheckModules: " + util.inspect(healthCheckModules))
  return healthCheckModules
}

/**
 * 
 * @param {*} healthCheckFiles 
 * @returns 
 */
function mapModuleNamesToObjects(app, healthCheckFiles) {
  // A Map to store associated HealthCheck module-names and objects
  let healthCheckModules = new Map()

  // Create a `healthChecks` map that associates module names to command objects.
  healthCheckFiles.forEach(check => {
    // open the file in 'check' and get the module
    const filePath = './src/HealthChecks/' + check
    app.log.debug("filePath: " + filePath)
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Search for the module name using a regular expression
    const moduleNameRegex = /(?<=\bmodule\.exports\s*=\s*)\w+/;
    const moduleName = fileContents.match(moduleNameRegex);

    // get an instance of the module
    const cmd = require(process.cwd() + '/src/HealthChecks/' + check)
    const command = cmd.getInstance()

    // add the module to the healthChecks map
    healthCheckModules[moduleName] = command
  })

  // write the item registry to the log
  if (healthCheckModules) {
    Object.keys(healthCheckModules).forEach(item => {
      app.log.debug("healthCheckModules: " + item + ', ' + healthCheckModules[item])
    })
  }
  return healthCheckModules
}

/**
 * @description:
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