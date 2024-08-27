/**
 * @description This module is responsible for converting JSON data to CSV format and writing it to a file.
 * @param {*} jsonData
 * @param {*} outputFilePath
*/

const fs = require('fs');
const { markdownReport } = require('./reportConverter'); 
const Command = require('../common/command.js')
const util = require('util')
const { logger } = require('../../logger');

let instance = null

class markdownReportFile extends Command {

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new markdownReportFile()
    }

    return instance
  }

  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  async execute(context, config, jsonData) {
    // logger.debug('markdownReportFile:config: ', config)

    const markdown = markdownReport(jsonData);
    const outputFilePath = config.params.path;

    fs.writeFileSync(outputFilePath, markdown);

    return markdown;
    }
}

module.exports = markdownReportFile