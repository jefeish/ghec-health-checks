const cron = require('node-cron');

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

  app.log('Starting the Health Check - App!')

  // ---------------------------------------------------------------------------
  // Initialize the Health Check App
  // ---------------------------------------------------------------------------

  // initialize the web UI
  const webUI = new ui(app, getRouter('/healthCheck'), null)
  webUI.start()
  app.log.info('Web UI started')
  // log the web UI access URL
  app.log.info('Web UI access: https://<your-github-app-url>/healthCheck')

  // if the 'tmp' folder does not exist, create it
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
    app.log.info('tmp/ folder created')
  }

  // if the 'reports' folder does not exist, create it
  if (!fs.existsSync('./reports')) {
    fs.mkdirSync('./reports');
    app.log.info('reports/ folder created')
  }

  // ---------------------------------------------------------------------------
  // validate required .github/config.yml environment variables
  // ---------------------------------------------------------------------------
  let env_vars = ['HEALTHCHECK_CONFIG_PATH', 'HEALTHCHECK_REPORT_PATH', 'HEALTHCHECK_MODULE_PATH']

  // if the required environment variables are not defined, exit the App
  if (!env_vars.every(v => process.env[v] !== undefined)) {
    app.log.error('Missing environment variables check for: ' + env_vars)
    process.exit(1)
  }

  // ---------------------------------------------------------------------------
  // load App configurations from .github/config.yml and watch for changes
  // ---------------------------------------------------------------------------

  //read the environment variable for the config file path
  const configPath = process.cwd() + process.env.HEALTHCHECK_CONFIG_PATH

  // ---------------------------------------------------------------------------
  // load all health check reports from the 'HEALTHCHECK_REPORT_PATH' location 
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const reportPath = process.cwd() + process.env.HEALTHCHECK_REPORT_PATH

  // initial read of the config file
  config = loadConfig(app, configPath)
  app.log.info("Load configuration: " + util.inspect(config.health_checks[0].params))

  // Watch for file changes to 'configPath' (yaml)
  fs.watch(configPath, (eventType, filename) => {
    app.log.debug(`Event type: ${eventType}`);

    if (filename) {
      app.log.info(`Filename: ${filename}`);
      // reload App configurations from .github/config.yml
      config = loadConfig(app, configPath)
      app.log.info("Load configuration: " + util.inspect(config))
    } else {
      app.log.error('Filename not provided');
    }
  });

  /**
   * @description Load the configuration file from the given path
   * @param {*} app 
   * @param {*} configPath 
   * @returns 
   */
  function loadConfig(app, configPath) {
    app.log.info('Loading Health Check Configuration')
    // load App configurations from .github/config.yml
    try {
      let params = null
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'))
      app.log.debug('config: ' + util.inspect(config))
      const globalVars = config.global_vars;
      const healthChecks = config.health_checks;

      healthChecks.forEach(check => {
        check.params = { ...check.params, ...globalVars }; // This will overwrite global_vars with params if they have the same keys
      });
      return config
    } catch (err) {
      app.log.error(err)
    }
  }

  /**
   * @description Run all the health check reports, as defined in the configuration
   * @param {*} context 
   * @param {*} config 
   * @param {*} jsonData 
   */
  async function runReports(context, config, jsonData) {
    // execute all registered reports 
    // app.log.info('runReports:config.reports: ' + util.inspect(config.reports))

    // check if we have any reports to run and they are not null
    if (config.reports !== null) {
      for (let i = 0; i < config.reports.length; i++) {
        let report = config.reports[i];
        // app.log.info('runReports:report['+report.name+']: ' + util.inspect(report))
        // Eg.: ./healthChecks/reportAdapters/
        const reportModule = require(reportPath + '/' + report.name)
        const reportInstance = reportModule.getInstance()
        const reportConfig = config.reports.find(item => item.name === report.name);

        // DEBUG - log the report configuration
        // console.log('runReports:reportConfig['+report.name+']: ' + util.inspect(reportConfig))

        // change the working directory to the root of the App 
        // Making sure the reports have the correct starting location
        process.chdir(__dirname + '/..');

        await reportInstance.execute(context, reportConfig, jsonData)
      }
    }
    else {
      console.log('No reports to run')
    }
  }

  // ---------------------------------------------------------------------------
  // load all health check modules from the HealthChecks/ folder and watch for changes
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const modulesPath = process.cwd() + process.env.HEALTHCHECK_MODULE_PATH

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

    } else {
      app.log.error('Filename not provided');
    }
  });

  // ---------------------------------------------------------------------------
  // schedule the Health Checks to run at a specific interval
  // ---------------------------------------------------------------------------

  // if the 'HEALTHCHECK_INTERVAL' environment variable is set, schedule the Health Checks
  if (process.env.HEALTHCHECK_INTERVAL !== undefined) {

    app.log.info('running the health-checks on a cron schedule: ' + process.env.HEALTHCHECK_INTERVAL);
    // Schedule tasks to be run on the server.
    cron.schedule(process.env.HEALTHCHECK_INTERVAL, function () {
      executeHealthChecks(app, null, config)
    });
  }

  // ---------------------------------------------------------------------------
  // Start executing the Health Checks based on the configuration (yaml)
  // ---------------------------------------------------------------------------

  // Trigger on Issue comment '/status' to execute the Health checks
  app.on('issue_comment.created', async context => {
    app.log.info('...issue comment created')
    app.log.info('...issue comment body: ' + context.payload.comment.body)

    // regular expression to make sure the comment starts with '/status', 
    // as a single word including newlines
    const regex = new RegExp('^/status\\b', 'm')

    if (regex.test(context.payload.comment.body)) {
      // prevent the bot from triggering itself
      if (context.payload.sender.type !== 'Bot') {
        app.log.info('...sender is not a bot')

        // execute all registered health checks
        const reportCollection = await executeHealthChecks(app, context, config)
        runReports(context, config, reportCollection)
      }
      else {
        app.log.debug('...sender is a bot')
        return null
      }
    }
    else {
      app.log.debug('...issue comment body does not contain /status')
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
  app.log.info('executeHealthChecks')
  // app.log.info('context: ' + util.inspect(context))

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
      app.log.info('Executing health check: ' + check.name)

      // set the current working directory to the root of the App
      process.chdir(__dirname + '/..');
      result = await command.execute(context, check)
      // check if the result is of the format, { "name": "check_repo_clone", "description": "test", "result": "result", "status": "status" }
      // if not, then add the name and description to the result with the status 'error' and the description 'invalid result format'
      if (!result.hasOwnProperty('name') || !result.hasOwnProperty('description') || !result.hasOwnProperty('result') || !result.hasOwnProperty('status')) {
        result.name = check.name
        result.description = check.description
        result.severity = check.severity
        result.status = 'error'
        result.result = 'invalid result format'
      }
      const end = process.hrtime.bigint();
      const elapsed = Number(end - start) / 1000000
      // add the elapsed time to the result JSON
      result.elapsed = elapsed + ' ms'
      reportCollection.push(result)
    };
  } catch (error) {

    // if ANY error occurs, log the error and add the error message to the result JSON
    app.log.error('Error executing health checks: ' + error)
    result.name = 'NA'
    result.description = 'NA'
    result.severity = 'NA'
    result.status = 'error'
    result.result = error.message.replace(/\|/g, '\\|').replace(/\n/g, '<br />');
  }

  // return the report
  return reportCollection
}
