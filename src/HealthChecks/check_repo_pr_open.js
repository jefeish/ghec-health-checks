/**
 * @description Check to verify that the repository PR has been created
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
  async execute(context, params) {

    console.log('check_repo_pr_open.execute()')
    let checkResult = { "name": "check_repo_pr", "description": "test", "result": "result", "status": "status" }

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

module.exports = check_repo_pr_open
             