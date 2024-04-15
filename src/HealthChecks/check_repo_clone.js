/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 * PLEASE REPLACE ALL `change this!` MARKERS WITH YOUR OWN CODE 
 * (including this one)
 */

const Command = require('./common/command.js')
const { exec } = require('child_process');
const fs = require('fs-extra');
const util = require('util')
const path = require('path');
let instance = null


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

  async cloneRepository(repositoryUrl, destinationPath) {
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

  
  async removeLocalRepository(directoryPath) {
      try {
          await fs.remove(directoryPath);
          console.log(`Directory ${directoryPath} removed successfully.`);
      } catch (error) {
          console.error(`Error removing directory ${directoryPath}:`, error);
      }
  }
  
  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  async execute(context, checkConfig) {

    console.log(checkConfig.name + '.execute()')
    let checkResult = {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "result",
      "status": "status"
    }

    try {

      if (typeof checkConfig == 'undefined') {
        checkResult.name = 'checkConfig is not defined',
          checkResult.status = 'fail',
          checkResult.result = 'checkConfig is not defined',
          checkResult.description = 'checkConfig is not defined'
        return checkResult
      }

      // if the context is not defined or the checkConfig is not defined, return an error
      if (context.octokit !== undefined && checkConfig.params !== undefined) {

        const repositoryUrl = checkConfig.params.repo;
        // Split the URL by '/' and get the last part
        const parts = repositoryUrl.split("/");
        const lastPartWithGit = parts[parts.length - 1];

        // Remove the '.git' extension
        const repoName = lastPartWithGit.replace(/\.git$/, '');
        const destinationPath = './tmp/' + repoName;

        this.cloneRepository(repositoryUrl, destinationPath)
          .then(success => {
            if (success) {
              this.removeLocalRepository(destinationPath)
              console.log('Repository cloned and removed successfully!');
            } else {
              this.removeLocalRepository(destinationPath)
              console.log('Failed to clone repository or remove repository folder.');
            }
          })
          .catch(error => {
            this.removeLocalRepository(destinationPath)
            console.error('Error:', error);
          });

        return checkResult
      }
      else {
        console.log('WARNING - ' + checkConfig.name + ': context is not defined')
        checkResult.status = 'fail'
        checkResult.result = 'context is not defined'
        checkResult.description = checkConfig.description
        return checkResult
      }
    } catch (err) {
      console.log(err)
      console.log('WARNING - ' + checkConfig.name + ': context is not defined')
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

module.exports = check_repo_clone