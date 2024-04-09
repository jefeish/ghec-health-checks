/**
 * @description Check to verify that the repository can been cloned successfully
 * @param repo - the repository to check
 * @returns
 */

const { config } = require('process')
const Command = require('./common/command.js')
const util = require('util')
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
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  async execute(context, params) {

    console.log('check_repo_clone.execute()')
    let checkResult = { "name": "check_repo_clone", "description": "test", "result": "result", "status": "status" }

    try {

      if (typeof params == 'undefined') {
        params = 'NA'
      }
     
      // if the context is not defined, return an error
      if (context.octokit !== undefined) {

        const response = await context.octokit.repos.get({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name
        });
             
        // console.log('response: ', response)
        // if the call was successful, return the result
        if (response.status == 200) {
          checkResult.result = 'Success'
          checkResult.status = 'Pass'
          checkResult.result = 'Repository was cloned successfully'
          checkResult.description = params.description
          return checkResult
        }
        else {
          checkResult.result = 'Failure'
          checkResult.status = 'Fail'
          checkResult.result = 'Repository cloning failure'
          checkResult.description = params.description
          return checkResult
        }
      }
      else {
        console.log('check_repo_clone: context is not defined')
        checkResult.result = 'Failure'
        checkResult.status = 'Fail'
        checkResult.result = 'context is not defined'
        checkResult.description = params.description
        return checkResult
      }
    } catch (err) {
      console.log(err)
      return -1
    }
  }
}

module.exports = check_repo_clone
             