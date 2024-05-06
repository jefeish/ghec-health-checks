/**
 * @description Event Handler Class (TEMPLATE).
 * @param
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

        // Define the branch you want to commit to, if the branch is not defined or empty, it will default to 'main'
        const branch = checkConfig.params.branch || "main";
        // await createCommit(context, context.payload.repository.owner.login, context.payload.repository.name, branch);
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
      console.error('ERROR - '+ checkConfig.name +': '+ err)
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
}

// Utilitary function to handle the command
// Define the branch you want to commit to
const branch = "main";

async function createCommit(context, owner, repo, branch) {
  try {
    // create a temporary file
    const fs = require('fs');
    // add a new file to the repository with the content of the current date
    fs.writeFileSync('./tmp/commit-test.txt', new Date().toISOString());
    console.log('branch: ', branch)
    console.log('owner: ', owner)
    console.log('repo: ', repo)
    console.log('ref: ', `heads/${branch}`)
    // Get the latest commit SHA of the branch
    const { data: { object: { sha: latestCommitSha } } } = await context.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    // Create a new blob for the file content
    const { data: { sha: newBlobSha } } = await context.octokit.git.createBlob({
      owner,
      repo,
      content: "Content of your new file",
      encoding: "utf-8"
    });

    // Create a new tree with the updated file
    const { data: { sha: newTreeSha } } = await context.octokit.git.createTree({
      owner,
      repo,
      base_tree: latestCommitSha,
      tree: [{
        path: "./tmp/commit-test.txt",
        mode: "100644",
        type: "blob",
        sha: newBlobSha
      }]
    });

    // Create a new commit referencing the new tree and the latest commit
    const { data: { sha: newCommitSha } } = await context.octokit.git.createCommit({
      owner,
      repo,
      message: "healthCheck App test commit",
      tree: newTreeSha,
      parents: [latestCommitSha]
    });

    // Update the branch reference to point to the new commit
    await context.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitSha
    });

    console.log("Commit created successfully!");
  } catch (error) {
    console.error("Error creating commit:", error);
  }
}


// Export the singleton instance
module.exports = check_repo_commit
