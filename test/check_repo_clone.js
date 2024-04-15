/**
 * @description Check to verify that the repository can been cloned successfully
 * @param repo - the repository to check
 * @returns
 */

const fs = require('fs')
const Command = require('../src/healthChecks/common/command.js')
const util = require('util')
let instance = null
const { exec } = require('child_process');


class check_repo_clone extends Command {

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_clone()

    }

    return instance
  }

  async cloneRepository2(repositoryUrl, destinationPath) {
    try {
      // Construct the git clone command
      const command = `git clone ${repositoryUrl} ${destinationPath}`;

      // Execute the git clone command
      const { stdout, stderr } = await exec(command);

      // Check if there's any error output (stderr)
      if (stderr) {
        console.error('Error cloning repository:', stderr);
        await this.removeLocalRepository(destinationPath)
        return true; // Return false indicating failure
      } else {
        console.log('Repository cloned successfully:', stdout);
        await this.removeLocalRepository(destinationPath)
        return true; // Return true indicating success
      }
    } catch (error) {
      console.error('Error:', error);
      await this.removeLocalRepository(destinationPath)
      return false; // Return false indicating failure
    }
  }

  /**
   * @description Remove the repository from the local file system
   * @param {*} destinationPath
   */
  async removeLocalRepository(destinationPath) {

    console.log('removeLocalRepository()', destinationPath)
    // print the current working directory
    console.log('Current directory:', process.cwd());
    try {
      // Check if the directory exists
      if (fs.existsSync(destinationPath)) {
        console.log('Directory ${destinationPath} exists.');
        // If it exists, remove it
        fs.rmdirSync(destinationPath, { recursive: true });
        console.log(`Directory ${destinationPath} removed successfully.`);
      } else {
        console.log(`Directory ${destinationPath} does not exist.`);
      }
    } catch (err) {
      console.error(`Error removing directory ${destinationPath}:`, err);
    }
  }

  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} checkConfig 
   */
  async execute(context, checkConfig) {

    console.log('check_repo_clone.execute()')
    let checkResult = {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "result",
      "status": "status"
    }

    try {

      if (typeof checkConfig == 'undefined') {
        checkConfig = 'NA'
      }

      // Debug: Print the checkConfig
      // console.log('check_repo_clone - checkConfig: ', checkConfig)

      // if the context is not defined or the checkConfig is not defined, return an error
      if (context.octokit !== undefined && checkConfig.params !== undefined) {
        const repositoryUrl = checkConfig.params.repo;
        console.log('repositoryUrl: ', repositoryUrl)
        // Split the URL by '/' and get the last part
        const parts = repositoryUrl.split("/");
        const lastPartWithGit = parts[parts.length - 1];

        // Remove the '.git' extension
        const repoName = lastPartWithGit.replace(/\.git$/, '');
        const destinationPath = './tmp/' + repoName;

        try {
          const response = await this.cloneRepository2(repositoryUrl, destinationPath);
          console.log('response:             >>>>>>>>>>>>>>>>>>', response)
          // if the call was successful, return the result
          if (response === true) {
            console.log('Repository cloned successfully!');
            checkResult.result = 'Success'
            checkResult.status = 'pass'
            checkResult.result = checkConfig.description + ': successful'
            checkResult.description = checkConfig.description
            // print the directory contents of 'destinationPath'
            // console.log('Directory contents:', fs.readdirSync(destinationPath));
            // this.removeLocalRepository(destinationPath)
          }
        } catch (error) {
          console.error('Error cloning repository:', error);
          checkResult.result = 'Failure'
          checkResult.status = 'fail'
          checkResult.result = checkConfig.description + ' - status: ' + error
          checkResult.description = checkConfig.description
          // print the directory contents of 'destinationPath'
          // console.log('Directory contents:', fs.readdirSync(destinationPath));
          // this.removeLocalRepository(destinationPath)
        }

        return checkResult
      }
      else {
        console.log('WARNING - ' + checkConfig.name + ': context is not defined')
        checkResult.status = 'fail'
        checkResult.result = 'context is not defined'
        checkResult.description = ''
        return checkResult
      }
    } catch (err) {
      console.log(err)
      console.log('WARNING - ' + checkConfig.name + ': context is not defined')
      checkResult.status = 'fail'
      checkResult.result = 'an error occurred while cloning the repository: ' + err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

module.exports = check_repo_clone
