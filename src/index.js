/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const init = require('./init.js')
const util = require('util')
const fs = require('fs');
// const ui = require('./ui/appUI.js')

let healthChecksModules = new Map()
let config = null

/**
 * This is the main entrypoint to your Probot app 
 * @param {import('probot').Application} app
 */
module.exports = (app, { getRouter }) => {

  app.log('Starting the Health Check - App!')

  // ---------------------------------------------------------------------------
  // Initialize the Health Check App
  // ---------------------------------------------------------------------------

  // webUI = new ui(getRouter('/healthCheck'))
  // webUI.start()

  // ---------------------------------------------------------------------------
  //read the environment variable for the config file path
  const configPath = process.cwd() + process.env.HEALTHCHECK_CONFIG_PATH

  // load App configurations from .github/config.yml
  config = init.loadConfig(app, configPath)

  // Watch for file changes to 'configPath' (yaml)
  fs.watch(configPath, (eventType, filename) => {
    app.log.debug(`Event type: ${eventType}`);

    if (filename) {
      app.log.info(`Filename: ${filename}`);
      // reload App configurations from .github/config.yml
      config = init.loadConfig(app, configPath)
      app.log.info("config: " + util.inspect(config))
    } else {
      app.log.error('Filename not provided');
    }
  });

  // ---------------------------------------------------------------------------
  // read the environment variable for the folder path
  const modulesPath = process.cwd() + process.env.HEALTHCHECK_MODULE_PATH

  // load all health check modules from the HealthChecks/ folder
  healthChecksModules = init.registerHealthCheckModules(app, modulesPath)

  // Watch for file changes (add, delete) to 'modulesPath'
  fs.watch(modulesPath, (eventType, filename) => {
    app.log.debug(`Event type: ${eventType}`);

    if (filename) {
      app.log.info(`Filename: ${filename}`);
      // read the contents of the HealthChecks/ folder
      // ignoring the files that start with a dot and folders/
      healthCheckFiles = fs.readdirSync(modulesPath).filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
      })
      // map the module names to objects
      healthChecksModules = init.registerHealthCheckModules(app, modulesPath)
    } else {
      app.log.error('Filename not provided');
    }
  });

  // ---------------------------------------------------------------------------
  // Start executing the Health Checks based on the configuration (yaml)
  // ---------------------------------------------------------------------------

  // Trigger option for the Health checks
  app.on('issue.created', async context => {
    app.log.info('issue.created')
    const report = executeHealthChecks(app, context, config)

    const issue = context.issue(
      {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title: 'Health check report',
        body: '# Health Check Report:'+ report
      }
    )
    
    return context.github.issues.create(issue)
  })

  executeHealthChecks(app, app.context, config)

}

/**
 * @description Run all the health checks, listed in the config yaml file.
 *              Collect the results and create a report (JSON)
 * 
 * @param {*} app 
 * @param {*} context 
 * @param {*} config 
 */
function executeHealthChecks(app, context, config) {
  app.log.info('executeHealthChecks')
  // Loop through each health check in the config object
  config.health_checks.forEach(check => {

    // look up the health check module in the healthChecks map
    const healthCheckModule = healthChecksModules[check.name]

    // collect the health check results
    let report = null

    // if the health check module is found
    if (healthCheckModule) {
      app.log.info("...healthCheckModule: " + util.inspect(healthCheckModule))
      // run the health check and measure the execution time
      console.time(healthCheckModule)
      const result = healthCheckModule.execute(context, check.params)
      console.timeEnd(healthCheckModule)
      // add the result to the report
      report += { "name": check.name, "result": result }

    }
    else { // if the health check module is not found
      app.log.error("healthCheck not found: " + check.name)
    }

    app.log.info("...report: " + util.inspect(report))
  });
}
