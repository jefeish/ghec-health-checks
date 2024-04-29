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

const simpleGit = require('simple-git');
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

  /**
   * @description
   * 
   * @param {*} repositoryUrl 
   * @param {*} destinationPath 
   * @returns 
   */
  async cloneRepository(repositoryUrl, destinationPath) {
    const git = simpleGit();
    console.log('Cloning repository:', repositoryUrl, 'to:', destinationPath)

    return new Promise((resolve, reject) => {
      git.clone(repositoryUrl, destinationPath, (error, result) => {
        if (error) {
          console.error('Error:', error);
          console.log('Result:', result);
          reject(error);
        } else {
          console.log('Repository cloned successfully:', result);
          resolve(true);
        }
      });
    });
  }

  /**
   * @description
   * 
   * @param {*} directoryPath 
   */
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

        const res = await this.cloneRepository(repositoryUrl, destinationPath)
        if (res) {
          console.log('Repository cloned successfully!');
          checkResult.status = 'pass'
          checkResult.result = 'Repository cloned successfully!'
          checkResult.description = checkConfig.description
          await this.removeLocalRepository(destinationPath)
        } else {
          console.log('Failed to clone repository.');
          checkResult.status = 'fail'
          checkResult.result = 'Failed to clone repository'
          checkResult.description = checkConfig.description
          await this.removeLocalRepository(destinationPath)
        }

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
      console.error('ERROR - ' + checkConfig.name + ': ' + err)
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

module.exports = check_repo_clone