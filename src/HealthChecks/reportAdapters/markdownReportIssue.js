/**
 * @description This module is responsible for converting JSON data to CSV format and writing it to a file.
 * @param {*} jsonData
 * @param {*} outputFilePath
 */

const { markdownReport } = require('./reportConverter.js');
const Command = require('../common/command.js')
let instance = null

class markdownReportIssue extends Command {

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new markdownReportIssue()
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
    console.log('....markdownReportIssue:config: ', config)
    // const issueComment = markdownReport(jsonData)
    // console.log('markdownReportIssue:jsonData: >' + issueComment + '<')

    const issueLabels = await context.octokit.issues.addLabels({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      labels: ['invalid']
    })

    console.log('\n\n\n>>>>>>>>>>>>>>>>>>            markdownReportIssue:issueLabels: ', issueLabels + '\n\n\n')

    const issueComment = await context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      body: "issueComment"
    })

    console.log('markdownReportIssue:issueComment: ', issueComment)
  }
}

module.exports = markdownReportIssue;