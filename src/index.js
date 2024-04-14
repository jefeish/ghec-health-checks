/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const init = require('./init.js')
const util = require('util')
const fs = require('fs');
const ui = require('./ui/appUI.js')

// let healthChecksModules = new Map()
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

  // ---------------------------------------------------------------------------
  // load App configurations from .github/config.yml and watch for changes
  // ---------------------------------------------------------------------------

  //read the environment variable for the config file path
  const configPath = process.cwd() + process.env.HEALTHCHECK_CONFIG_PATH

  // initial read of the config file
  config = init.loadConfig(app, configPath)

  // Watch for file changes to 'configPath' (yaml)
  fs.watch(configPath, (eventType, filename) => {
    app.log.debug(`Event type: ${eventType}`);

    if (filename) {
      app.log.info(`Filename: ${filename}`);
      // reload App configurations from .github/config.yml
      config = init.loadConfig(app, configPath)
      app.log.info("Load configuration: " + util.inspect(config))
    } else {
      app.log.error('Filename not provided');
    }
  });

 
  async function runReports(context, config, jsonData) {
    // execute all registered reports 
    // app.log.info('runReports:config.reports: ' + util.inspect(config.reports))

    for (let i = 0; i < config.reports.length; i++) {
      let report = config.reports[i];
      // app.log.info('runReports:report['+report.name+']: ' + util.inspect(report))
      const reportModule = require('./healthChecks/reportAdapters/' + report.name)
      const reportInstance = reportModule.getInstance()

      const reportConfig = config.reports.find(item => item.name === report.name);

      // console.log('runReports:reportConfig['+report.name+']: ' + util.inspect(reportConfig))

      reportInstance.execute(context, reportConfig, jsonData)
    }
  }

  // ---------------------------------------------------------------------------
  // load all health check modules from the HealthChecks/ folder and watch for changes
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const modulesPath = process.cwd() + process.env.HEALTHCHECK_MODULE_PATH

  // initial read of the 'healthChecks/' folder
  healthChecksModules = init.registerHealthCheckModules(app, modulesPath)

  // require the health check modules, so that it can be found
  // requireModules(modulesPath, healthChecksModules)

  // console.log('require cache: '+ Object.keys(require.cache));

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
  // load all health check reports from the 'HEALTHCHECK_REPORT_PATH' location 
  // ---------------------------------------------------------------------------

  // read the environment variable for the folder path
  const reportPath = process.cwd() + process.env.HEALTHCHECK_REPORT_PATH

  // ---------------------------------------------------------------------------
  // Start executing the Health Checks based on the configuration (yaml)
  // ---------------------------------------------------------------------------

  // Trigger option for the Health checks
  app.on('issues.opened', async context => {
    app.log.info('issues.opened')

    // regular expression to make sure the comment starts with '/status', 
    // as a single word including newlines
    const regex = new RegExp('^/status\\b', 'm')
    
    if(regex.test(context.payload.comment.body)) {
      app.log.info('...issue created')
      app.log.info('...issue body contains /status')

      // prevent the bot from triggering itself
      if (context.payload.sender.type !== 'Bot') {
        app.log.info('...sender is not a bot')

        // execute all registered health checks
        const report = executeHealthChecks(app, context, config)



        // const issue = context.issue(
        //   {
        //     owner: context.payload.repository.owner.login,
        //     repo: context.payload.repository.name,
        //     title: 'Health check report',
        //     body: '# Health Check Report:\n\n' + report.markdown()
        //   }
        // )

        // app.log.info("report: " + report.json())
        // app.log.info("report: " + report.markdown())
        // app.log.info("report: " + report.csv())

        // return context.octokit.issues.createComment(issue)

      }
      else {
        app.log.debug('...sender is a bot')
        return null
      }
    }
  })

  // Trigger on Issue comment '/status' to execute the Health checks
  app.on('issue_comment.created', async context => {
    app.log.info('...issue comment created')
    app.log.info('...issue comment body: ' + context.payload.comment.body)

    // regular expression to make sure the comment starts with '/status', 
    // as a single word including newlines
    const regex = new RegExp('^/status\\b', 'm')

    if(regex.test(context.payload.comment.body)) {
      // prevent the bot from triggering itself
      if (context.payload.sender.type !== 'Bot') {
        app.log.info('...sender is not a bot')
        app.log.info('...creating a comment on the issue ')

        await context.octokit.issues.createComment({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.issue.number,
          body: 'Running health checks...'
        })
      
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

  // Loop through each health check in the config object
  for (let i = 0; i < config.health_checks.length; i++) {
    let check = config.health_checks[i];
  
    // get an instance of the module
    const cmd = require(process.cwd() + '/src/healthChecks/' + check.name)
    const command = cmd.getInstance()
    // run the health check and measure the execution time
    const start = process.hrtime.bigint();
    app.log.info('                                                    Executing health check: ' + check.name)

    // DEBUG: create a comment on the issue to indicate that the health check is running
    // await context.octokit.issues.createComment({
    //   owner: context.payload.repository.owner.login,
    //   repo: context.payload.repository.name,
    //   issue_number: context.payload.issue.number,
    //   body: "Running health check: " + check.name 
    // })
    
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

  // DEBUG: create a comment on the issue, reporting the health check results
  const { markdownReport } = require('./healthChecks/reportAdapters/reportConverter')

  await context.octokit.issues.createComment({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.issue.number,
    body: markdownReport(reportCollection)
  })
  console.log('\n\n\n>>>>>>>>>>>>>>>>>                             reportCollection: ' + util.inspect(reportCollection))

  // const issueLabels = await context.octokit.issues.addLabels(
  //   {
  //       owner: context.payload.repository.owner.login,
  //       repo: context.payload.repository.name,
  //       issue_number: context.payload.issue.number,
  //       labels: ['documentation']
  //   })
  // console.log('>>>>>>>>>>>>>>>>>>>>>>                              issueLabels: ' + util.inspect(issueLabels))

  // return the report
  return reportCollection
}
