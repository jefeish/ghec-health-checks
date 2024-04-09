/**
 * @description Check to verify that the repository PR has been closed
 * @param
 */

const Command = require('./common/command.js')
let instance = null


class check_repo_pr_close extends Command {
  

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
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
  async execute(context, params) { 

    console.log('check_repo_pr_close.execute()')
    let checkResult = { "name": "check_repo_pr_close", "description": "test", "result": "result", "status": "status" }

    try {

      if (typeof params == 'undefined') {
        params = 'NA'
      }

      // if the context is not defined, return an error
      if (context.octokit !== undefined) {

        // YOUR CODE HERE !
      
      }
      else {
        console.log('context is not defined')
      }
      return checkResult
    } catch (err) {
      console.log(err)
      return -1
    }
  }
}

module.exports = check_repo_pr_close
             