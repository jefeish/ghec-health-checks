/**
 * @description Health-Check Handler Class (check_repo_pr_close).
 * @param
 */

const Command = require('./common/command.js')
const fs = require('fs-extra');
const simpleGit = require('simple-git');
const { logger } = require('../logger');

let instance = null

class check_repo_pr_close extends Command {
  
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
    this.git = simpleGit();
    this.destinationPath = '';
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_pr_close()
    }

    return instance
  }

  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  async execute(context, checkConfig) {

    logger.info(checkConfig.name +'.execute()')
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
        
        const repoName = checkConfig.params.repo.split('/').pop().replace('.git', '');
        logger.debug("repoPath: ", repoName)

        // ------------------------------------------------
        // Get the PR
        // ------------------------------------------------
        const r1 = await context.octokit.pulls.list({
          owner: context.payload.repository.owner.login,
          repo: repoName,
          head: checkConfig.params.branch,
          state: 'open',
        });

        // if the 'data' object is empty, then return an error
        if (r1.data.length == 0) {
          logger.debug('WARNING - ' + checkConfig.name + ': PR not found')
          checkResult.name = checkConfig.name
          checkResult.status = 'fail'
          checkResult.result = 'No open PR found'
          checkResult.description = checkConfig.description

          return checkResult
        }

        logger.debug('Pull #: ', r1.data[0].number)

        // ------------------------------------------------
        // Merge the PR
        // ------------------------------------------------
        const r2 = await context.octokit.pulls.merge({
          owner: context.payload.repository.owner.login,
          repo: repoName,
          pull_number: r1.data[0].number,
        });

        logger.debug('r2: ', r2)


        checkResult.name = checkConfig.name
        checkResult.status = 'pass'
        checkResult.result = 'PR #' + r1.data[0].number + ' merged'
        checkResult.description = checkConfig.description
        
        return checkResult

      }
      else {
        logger.debug('WARNING - '+ checkConfig.name +': context is not defined')
        checkResult.status = 'fail'
        checkResult.result = 'context is not defined'
        checkResult.description = checkConfig.description
        return checkResult
      }
    } catch (err) {
      logger.debug(err)
      logger.debug('WARNING - '+ checkConfig.name +': context is not defined')
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

module.exports = check_repo_pr_close
