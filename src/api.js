/**
 * @description This module contains the API functions for the application.
 * 
 */

const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')


/**
 * @description 
 * @returns json array of health check modules
 * Example: [ {"name":"check_repo_clone","description":"test"},
 *            {"name":"check_repo_commit","description":"test"}]
 * 
 */
exports.healthChecks = () => {
  console.log('api/HealthChecks')
  
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

    console.log("healthCheckModules: " + util.inspect(healthCheckFiles))

    healthCheckFiles.forEach(file => {
      const code = fs.readFileSync(modulesPath + '/' + file, 'utf8')

      // Regex to extract the description from the code 
      const regex = /^[\s\S]*?\* @description\s+(.*)$/m
      const match = regex.exec(code)

      if (match) {
        const description = match[1]
        console.log(description)
        healthCheckInventory.push({
          name: file,
          description: description
        })

      } else {
        healthCheckInventory.push({
          name: file,
          description: 'No @description found'
        })
        console.log('No @description found')
      }
    })

  } catch (err) {
    console.log.error(err)
  }

  console.log('readHealthCheckModules - complete')

  return healthCheckInventory
}

/**
 * @description
 * @returns Yaml object of the configuration file
 * 
 */
exports.apiGetConfig = () => {
  console.log('Loading Health Check Configuration')
  // load App configurations from .github/config.yml
  try {
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'))
    console.log('config: ' + util.inspect(config))
    return config
  } catch (err) {
    console.log(err)
  }
}