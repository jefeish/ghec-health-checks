# Documentation for the GitHub Health Checks App

 A GitHub App to run a set of Health checks against the GitHub platform API.

![diagram](images/architecture.svg)

## Some notes on the Application Scope

- This app is for testing standard health scenarios of the GitHub platform, via the GitHub API, such as, Cloning/Commits/PRs/Merge/ etc.
- You cannot stress test the system via any App, that is restricted by GitHub rate-limits
- Any performance degradation of CI/CD pipelines are only an Issue if we are talking GitHub hosted runners. Any other (Jenkins) pipeline issues might be detected from the GitHub side but GitHub is not considered the root-cause
- The app can help to correctly address “False-Positives”, eliminating "white-noise"

### Notes

GitHub provides the GHEC Health status information via https://www.githubstatus.com or to integrate this information into users local monitoring systems via the GitHub status API

---

## How To Create/Implement a new Health-Check

- **Create** a new file in the `healthChecks/` folder
  - **Example**
  
    ```
    /src/healthChecks/check_repo_issue_create.js
    ```
- **Copy** the `healthChecks/common/checksTemplate.js` content in to your new health check file
  - Make sure to replace all `checksTemplate` names with the name of your new file
  - look for every comment like this, `//  ^^^^^^^^^^^^^^--- change this!`

- **Add** your API testing code in to the `execute(...)` function
  - **Look for this comment**
  
    ```node
    // ------------------------------------------------
    // YOUR CODE HERE !
    // ------------------------------------------------
    ```

  - **Some sample code:**

  ```node
      const issueBody = checkConfig.params.body || '';

      const issue = await context.octokit.issues.create({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title: checkConfig.params.title,
        body: issueBody
      })
  ```

- **Add** the Health-Check configuration to the `.github/config.yml` file, to active the check.

  ```yaml
   health_checks:
   - name: "check_repo_issue_create"
        description: Checking the creation of an Issue
        type: "repo"
        severity: "critical"
        message: "This is a custom message"
        params:
          titel: "Test Issue" 
          body: "A simple test Issue" # optional
  ```

  > **NOTE: The filename and the name in the configuration need to match, in order for the App to run the check.**

---

  ## How To Activate/Deactivate a Health-Check(s)

  - **Open** the `.github/config.yml` file and uncomment or comment a `health_checks:` element.

  - **Example**
    
    ```yaml
    - health_checks:
      #- name: "check_repo_clone"
      #    description: standard repository checks (clone, push, PR)
      #    type: "repo"
      #    severity: "critical"
      #    message: "This is a custom message"
      #    params:
      #      repo: "https://github.com/jefeish/test-health-check.git" # required: repository name
      #      branch: "" # optional: default is "main"

      - name: "check_repo_issue_create"
          description: Checking the creation of an Issue
          type: "repo"
          severity: "critical"
          message: "This is a custom message"
          params:
            repo: "https://github.com/jefeish/test-health-check.git" # required: repository name
            titel: "Test Issue" 
            body: "A simple test Issue" # optional
    ```

---

  ## How To Create/Implement a new Report

  - **Create** a new file in the `healthChecks/reportAdapters` folder

  - **Example**

    ```node
    /**
    * @description This module is responsible for writing JSON data to a file.
    * @param {*} jsonData
    * @param {*} outputFilePath
    */

    const fs = require('fs');
    const { jsonReport } = require('./reportConverter');
    const Command = require('../common/command.js')
    let instance = null

    class jsonReportFile extends Command {

        // eslint-disable-next-line no-useless-constructor
        constructor() {
            super()
        }

        /**
        * Singleton pattern
        */
        static getInstance() {
            if (!instance) {
                instance = new jsonReportFile()
            }

            return instance
        }

        /**
        * @description Main entry point for invocation from client
        * 
        * @param {*} context 
        * @param {*} data 
        */
        async execute(context, config, jsonData) {
            console.log('jsonReportFile:config: ', config)

            const json = JSON.stringify(jsonReport(jsonData), null, 2);
            const outputFilePath = config.params.path;
            fs.writeFileSync(outputFilePath, json);

            return json;
        }
    }

    module.exports = jsonReportFile;
    ```

---

  ## How To Activate/Deactivate Report(s)

  - **Open** the `.github/config.yml` file and uncomment or comment a `reports:` element.

  - Example
    ```yaml
    reports:
    - name: "markdownReportIssue"
      description: "Markdown report issue"

    - name: "markdownReportFile"
      description: "Markdown report"
      params:
        path: "./reports/report.md"
      
    - name: "csvReportFile"
      description: "CSV report"
      params:
        path: "./reports/report.csv"   

    # - name: "jsonReportFile"
    #   description: "JSON report"
    #   params:
    #     path: "./reports/report.json"
    ```