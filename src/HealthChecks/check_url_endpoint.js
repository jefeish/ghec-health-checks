/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 * PLEASE REPLACE ALL `change this!` MARKERS WITH YOUR OWN CODE 
 * (including this one)
 */
const https = require('https');
const Command = require('./common/command.js')
let instance = null


class check_url_endpoint extends Command {
  

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_url_endpoint()
                 
    }

    return instance
  }

  // Async function to make a GET request to a URL and return the response data
  async fetchUrlData(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        // A chunk of data has been received.
        res.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        res.on('end', () => {
          resolve(data);
        });

      }).on('error', (err) => {
        reject(err);
      });
    });
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
        const url = checkConfig.params.url
        const response = await this.fetchUrlData(url)
        // convert the string to Json
        const jsonResponse = JSON.parse(response)
        // make the response string markdown friendly, specifically for tables

        const responseString = JSON.stringify(jsonResponse).replace(/|/g, '')

        // if the response is not empty and the status is 'ok' and the retunr code is '200'
        if (jsonResponse !== '' && jsonResponse.status === 'ok' && jsonResponse.ns1 === "200 OK") {          
          checkResult.status = 'pass'
          checkResult.result = 'URL is reachable - '+ responseString
          checkResult.description = checkConfig.description

        } else {
          checkResult.status = 'fail'
          checkResult.result = 'URL is not reachable - '+ responseString
          checkResult.description = checkConfig.description
        }
   
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

module.exports = check_url_endpoint
             