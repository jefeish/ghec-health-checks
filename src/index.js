const cron = require('node-cron');
const { logger, setLogLevel } = require('./logger');

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const yaml = require('js-yaml')
const util = require('util')
const fs = require('fs');
const ui = require('./ui/appUI.js')

let config = null

/**
 * This is the main entrypoint to your Probot app 
 * @param {import('probot').Application} app
 */
module.exports = (app, { getRouter }) => {

  logger.info('Starting the Health Check - App!')

  // ---------------------------------------------------------------------------
  // Initialize the Health Check App
  // ---------------------------------------------------------------------------

  // initialize the web UI
  const webUI = new ui(app, getRouter('/healthCheck'), null)
  webUI.start()
  logger.info('Web UI started')
  // log the web UI access URL
  logger.info('Web UI access: https://<your-github-app-url>/healthCheck')

  // if the 'tmp' folder does not exist, create it
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
    logger.debug('tmp/ folder created')
  }

  // if the 'reports' folder does not exist, create it
  if (!fs.existsSync('./reports')) {
    fs.mkdirSync('./reports');
    logger.debug('reports/ folder created')
  }

  // ---------------------------------------------------------------------------
  // validate required .github/config.yml environment variables
  // ---------------------------------------------------------------------------
  let env_vars = ['HEALTHCHECK_CONFIG_PATH', 'HEALTHCHECK_REPORT_PATH', 'HEALTHCHECK_MODULE_PATH']

  // if the required environment variables are not defined, exit the App
  if (!env_vars.every(v => process.env[v] !== undefined)) {
    logger.error('Missing environment variables check for: ' + env_vars)
    process.exit(1)
  }

  // ---------------------------------------------------------------------------
  // load all health check reports from the 'HEALTHCHECK_REPORT_PATH' location 
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const reportPath = process.cwd() + process.env.HEALTHCHECK_REPORT_PATH

  // ---------------------------------------------------------------------------
  // load App configurations from .github/config.yml and watch for changes
  // ---------------------------------------------------------------------------

  //read the environment variable for the config file path
  const configPath = process.cwd() + process.env.HEALTHCHECK_CONFIG_PATH

  // initial read of the config file
  config = loadConfig(app, configPath)
 
  // Watch for file changes to 'configPath' (yaml)
  fs.watch(configPath, (eventType, filename) => {
    logger.info('Reloading Health Check App Configuration')
    logger.debug(`Event type: ${eventType}`);

    if (filename) {
      logger.debug(`Filename: ${filename}`);
      // reload App configurations from .github/config.yml
      config = loadConfig(app, configPath)

    } else {
      logger.error('Filename not provided');
    }
  });

  /**
   * @description Load the configuration file from the given path
   * @param {*} app 
   * @param {*} configPath 
   * @returns 
   */
  function loadConfig(app, configPath) {
    logger.info('Loading Health Check App Configuration');

    try {
        // Load App configurations from config YAML file
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
      logger.debug('config.logger.level: ' + config.logger.level)
        setLogLevel(config.logger.level)
        logger.debug('App config settings: ' + util.inspect(config));
        const globalParams = config.globals.params;
        const healthChecks = config.health_checks;

        // Check if 'globals.overwrite' is set to true
        if (config.globals.overwrite === true) {
            logger.info('Overwriting local variables with global variables');

            // Merge globals with params, overwriting existing values and adding missing ones
            healthChecks.forEach(check => {
              Object.keys(globalParams).forEach(key => {
                check.params[key] = globalParams[key];
              });
            });
            logger.debug('OVERWRITE resolved config settings: ' + util.inspect(config, { showHidden: false, depth: null }))

        } else {
            logger.info('Not overwriting local variables with global variables');

            // Merge globals with params, only if the local variable is empty
            healthChecks.forEach(check => {
                Object.keys(globalParams).forEach(key => {
                    if (!(key in check.params) || !check.params[key]) {
                        check.params[key] = globalParams[key];
                    }
                });
            });
        }

        // Loop over the health checks and log the parameters
        healthChecks.forEach(check => {
            logger.debug('HealthCheck [' + check.name + '] parameters: ' + util.inspect(check.params));
        });

        // log the configuration, including nested objects
        logger.debug('resolved config file: ' + util.inspect(config, { showHidden: false, depth: null }))

        return config;
    } catch (err) {
        logger.error(err);
    }
  }

  // ---------------------------------------------------------------------------  

  /**
   * @description Run all the health check reports, as defined in the configuration
   * @param {*} context 
   * @param {*} config 
   * @param {*} jsonData 
   */
  async function runReports(context, config, jsonData) {
    // execute all registered reports 
    // logger.info('runReports:config.reports: ' + util.inspect(config.reports))

    // check if we have any reports to run and they are not null
    if (config.reports !== null) {
      for (let i = 0; i < config.reports.length; i++) {
        let report = config.reports[i];
        // logger.info('runReports:report['+report.name+']: ' + util.inspect(report))
        // Eg.: ./healthChecks/reportAdapters/
        const reportModule = require(reportPath + '/' + report.name)
        const reportInstance = reportModule.getInstance()
        const reportConfig = config.reports.find(item => item.name === report.name);

        // DEBUG - log the report configuration
        // logger.debug('runReports:reportConfig['+report.name+']: ' + util.inspect(reportConfig))

        // change the working directory to the root of the App 
        // Making sure the reports have the correct starting location
        process.chdir(__dirname + '/..');

        await reportInstance.execute(context, reportConfig, jsonData)
      }
    }
    else {
      logger.debug('No reports to run')
    }
  }

  // ---------------------------------------------------------------------------
  // load all health check modules from the HealthChecks/ folder and watch for changes
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const modulesPath = process.cwd() + process.env.HEALTHCHECK_MODULE_PATH

  // Watch for file changes (add, delete) to 'modulesPath'
  fs.watch(modulesPath, (eventType, filename) => {
    logger.debug(`Event type: ${eventType}`);

    if (filename) {
      logger.info(`Filename: ${filename}`);
      // read the contents of the HealthChecks/ folder
      // ignoring the files that start with a dot and folders/
      healthCheckFiles = fs.readdirSync(modulesPath).filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
      })

    } else {
      logger.error('Filename not provided');
    }
  });

  // ---------------------------------------------------------------------------
  // schedule the Health Checks to run at a specific interval
  // ---------------------------------------------------------------------------

  // if the 'HEALTHCHECK_INTERVAL' environment variable is set, schedule the Health Checks
  if (process.env.HEALTHCHECK_INTERVAL !== undefined) {

    logger.info('running the health-checks on a cron schedule: ' + process.env.HEALTHCHECK_INTERVAL);
    // Schedule tasks to be run on the server.
    cron.schedule(process.env.HEALTHCHECK_INTERVAL, function () {
      executeHealthChecks(app, null, config)
    });
  }

  // ---------------------------------------------------------------------------
  // Register event based triggering of the Health Checks (Issue Ops)
  // ---------------------------------------------------------------------------

  // Trigger on Issue comment '/status' to execute the Health checks
  app.on('issue_comment.created', async context => {
    logger.info('received event: issue comment created')
    logger.debug('issue comment body: ' + context.payload.comment.body)

    // regular expression to make sure the comment starts with '/status', 
    // as a single word including newlines, case insensitive
    const regex = new RegExp('^/status\\b', 'i')

    if (regex.test(context.payload.comment.body)) {
      // prevent the bot from triggering itself
      if (context.payload.sender.type !== 'Bot') {
        logger.debug('sender is not a bot')

        // execute all registered health checks
        const reportCollection = await executeHealthChecks(app, context, config)
        runReports(context, config, reportCollection)
      }
      else {
        logger.debug('sender is a bot')
        return null
      }
    }
    else {
      logger.info('issue comment body does not contain /status')
      return null
    }

  })
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * @description Run all the health checks, listed in the config yaml file.
 *              Collect the results and create a report (JSON)
 * 
 * @param {*} app 
 * @param {*} context 
 * @param {*} config 
 * @returns report (JSON)
 */
async function executeHealthChecks(app, context, config) {
  logger.info('executeHealthChecks')
  // logger.info('context: ' + util.inspect(context))

  let reportCollection = []
  let result = {}

  try {
    // Loop through each health check in the config object
    for (let i = 0; i < config.health_checks.length; i++) {
      let check = config.health_checks[i];

      // get an instance of the module
      const cmd = require(__dirname + '/healthChecks/' + check.name)
      const command = cmd.getInstance()
      // run the health check and measure the execution time
      const start = process.hrtime.bigint();
      logger.info('Executing health check: ' + check.name)

      // set the current working directory to the root of the App
      process.chdir(__dirname + '/..');
      result = await command.execute(context, check)
      // check if the result is of the format, { "name": "check_repo_clone", "description": "test", "result": "result", "status": "status" }
      // if not, then add the name and description to the result with the status 'error' and the description 'invalid result format'
      if (!result.hasOwnProperty('name') || !result.hasOwnProperty('description') || !result.hasOwnProperty('result') || !result.hasOwnProperty('status')) {
        result.name = check.name
        result.description = check.description
        result.type = check.type
        result.severity = check.severity
        result.status = 'error'
        result.result = 'invalid result format'
      }
      const end = process.hrtime.bigint();
      const elapsed = Number(end - start) / 1000000
      // format elapsed time to 2 digits after the decimal point
      const formattedElapsed = elapsed.toFixed(2);
      // add the elapsed time to the result JSON
      result.type = check.type
      result.severity = check.severity
      result.elapsed = formattedElapsed + 'ms'
      reportCollection.push(result)
    };
  } catch (error) {

    // if ANY error occurs, log the error and add the error message to the result JSON
    logger.error('Error executing health checks: ' + error)
    result.name = 'NA'
    result.description = 'NA'
    result.type = check.type
    result.severity = 'NA'
    result.status = 'error'
    result.result = error.message.replace(/\|/g, '\\|').replace(/\n/g, '<br />');
  }

  // return the report
  return reportCollection
}
