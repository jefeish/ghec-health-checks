/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 * PLEASE REPLACE ALL `change this!` MARKERS WITH YOUR OWN CODE 
 * (including this one)
 */

const Command = require('./command.js')
let instance = null


class checksTemplate extends Command {
  //  ^^^^^^^^^^^^^^^^^^^^--- change this!

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new checksTemplate()
                 //  ^^^^^^^^^^^^^^^^^^^^--- change this!
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
      console.log('checksTemplate.execute()')
      // THIS IS A SAMPLE GITHUB REST API CALL
      // PLEASE PROVIDE YOUR OWN CODE HERE !
      //
      // FOR REFERENCE SEE: https://octokit.github.io/rest.js
      //
      // --------------------------------------

      // const issue = context.issue(
      //   {
      //     owner: context.payload.repository.owner.login,
      //     repo: context.payload.repository.name,
      //     title: data[0],
      //     body: data[1]
      //   }
      // )
      //
      // return context.github.issues.create(issue)
      return {
        name: 'checksTemplate',
        status: 'failure',
        summary: 'unable to execute checksTemplatef',
      }
    } catch (err) {
      context.log(err)
      return -1
    }
  }
}

module.exports = checksTemplate
             //  ^^^^^^^^^^^^^^^^^^^^--- change this!