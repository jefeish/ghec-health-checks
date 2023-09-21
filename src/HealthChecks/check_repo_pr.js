/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 * PLEASE REPLACE ALL `change this!` MARKERS WITH YOUR OWN CODE 
 * (including this one)
 */

const Command = require('./common/command.js')
let instance = null


class check_repo_pr extends Command {
  

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_pr()
                 
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

      console.log('check_repo_pr.execute()')

      // YOUR CODE HERE !
      
      const fooJson = {
        
      }

      return fooJson
    } catch (err) {
      context.log(err)
      return -1
    }
  }
}

module.exports = check_repo_pr
             