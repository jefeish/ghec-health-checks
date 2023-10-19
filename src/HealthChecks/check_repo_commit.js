/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 * PLEASE REPLACE ALL `change this!` MARKERS WITH YOUR OWN CODE 
 * (including this one)
 */

const Command = require('./common/command.js')
let instance = null


class check_repo_commit extends Command {
  

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_commit()
                 
    }

    return instance
  }

  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  execute(context, params) {

    try {

      if (typeof params == 'undefined') {
        params = 'NA'
      }

      console.log('check_repo_commit.execute()')

      // YOUR CODE HERE !
      
      const fooJson = { "name": "check_repo_clone", "description": "test", "result": "result", "status": "status" }

      return fooJson
    } catch (err) {
      context.log(err)
      return -1
    }
  }
}

module.exports = check_repo_commit
             