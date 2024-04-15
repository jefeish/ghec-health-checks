/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 */

const Command = require('./common/command.js')
let instance = null


class check_repo_pr_open extends Command {
  
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_pr_open()
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

    console.log(checkConfig.name +'.execute()')
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
      
        // ------------------------------------------------
        // YOUR CODE HERE !
        // ------------------------------------------------

        return checkResult
      }
      else {
        console.log('WARNING - '+ checkConfig.name +': context is not defined')
        checkResult.status = 'fail'
        checkResult.result = 'context is not defined'
        checkResult.description = checkConfig.description
        return checkResult
      }
    } catch (err) {
      console.log(err)
      console.log('WARNING - '+ checkConfig.name +': context is not defined')
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

module.exports = check_repo_pr_open
