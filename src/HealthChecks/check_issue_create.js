/**
 * @description Health-Check Handler Class (check_issue_create).
 * @param
 */

const Command = require('./common/command.js')
const fs = require('fs-extra');
const simpleGit = require('simple-git');
const { logger } = require('../logger');

let instance = null

class check_issue_create extends Command {
  
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
      instance = new check_issue_create()
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
        
        const repoName = checkConfig.params.repo
        logger.debug("repoName: ", repoName)

        // ------------------------------------------------
        // create an Issue
        // ------------------------------------------------
        const r1 = await context.octokit.issues.create({
          owner: context.payload.repository.owner.login,
          repo: repoName,
          title: 'Issue created by check_issue_create',
        });

        logger.debug('Issue #: ', r1.data.number)

        checkResult.name = checkConfig.name
        checkResult.status = 'pass'
        checkResult.result = 'Issue #' + r1.data.number + ' created'
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

module.exports = check_issue_create
