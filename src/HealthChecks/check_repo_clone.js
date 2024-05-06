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
          console.error('Error cloning repository ['+ destinationPath +']:', error);
          console.log('Result:', result);
          reject(error);
        } else {
          console.log('Repository ['+ destinationPath +'] cloned successfully: ', result);
          resolve(true);
        }
      });
    });
  }

  /**
   * @description remove the local repository
   * 1. check if the directory exists
   * 2. remove the directory
   * 
   * @param {*} directoryPath 
   */
  async removeLocalRepository(directoryPath) {
    console.log('\n\n ---------------------------------------------------\n Checking for directory: >'+ directoryPath +'<\n ---------------------------------------------------\n\n');

    try {
      // check if the directory exists
      if (fs.existsSync(directoryPath)) {
        console.log('\n\n ---------------------------------------------------\n Directory >'+ directoryPath +'< Exists!\n ---------------------------------------------------\n\n');

        await fs.remove(directoryPath);
        console.log('\n\n ---------------------------------------------------\n Directory >'+ directoryPath +'< removed successfully.\n ---------------------------------------------------\n\n');
      }
    } catch (error) {
      console.error('Error removing directory >'+ directoryPath +'<:'+ error);
    }
    // log the folder current contents
    fs.readdirSync('./tmp/').forEach(file => {
      console.log('DEBUG: ./tmp/' + file);
    });

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

    let destinationPath = '';

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
        destinationPath = './tmp/' + repoName;

        // start by removing the local repository, if it exists
        await this.removeLocalRepository(destinationPath)

        const res = await this.cloneRepository(repositoryUrl, destinationPath)
        if (res) {
          checkResult.status = 'pass'
          checkResult.result = 'Repository cloned successfully!'
          checkResult.description = checkConfig.description
          await this.removeLocalRepository(destinationPath)
        } else {
          console.log('Failed to clone repository: '+ destinationPath);
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
        await this.removeLocalRepository(destinationPath)
        return checkResult
      }
    } catch (err) {
      console.error('ERROR - ' + checkConfig.name + ': ' + err)
      checkResult.status = 'fail'
      checkResult.result = err.message.replace(/\|/g, '\\|').replace(/\n/g, '<br />');
      checkResult.description = checkConfig.description
      await this.removeLocalRepository(destinationPath)
      return checkResult
    }
  }
}

module.exports = check_repo_clone