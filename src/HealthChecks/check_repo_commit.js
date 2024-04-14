/**
 * @description Check to verify that commits can be made to the repository
 * @param
 */

const Command = require('./common/command.js')
let instance = null
let response = {}

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
  async execute(context, params) {
    
    console.log('check_repo_commit.execute()')
    let checkResult = { "name": "check_repo_commit", "description": "test", "result": "result", "status": "status" }
    // Debug: print current working directory
    // console.log('Current working directory: ', process.cwd());
    
    try {

      if (typeof params == 'undefined') {
        params = 'NA'
      }
     
      // if the context is not defined, return an error
      if (context.octokit !== undefined) {

        // const result = context.octokit.git.createCommit({
        //   owner: context.payload.repository.owner.login,
        //   repo: context.payload.repository.name,
        //   message: 'test commit',
        //   tree: context.payload.repository.tree,
        //   'author.name': context.payload.repository.owner.name,
        //   'author.email': context.payload.repository.owner.email,
        // })
      
        // Example usage
        // const gitHubCommit = new GitHubCommit( context, context.payload.repository.owner.login, context.payload.repository.name, 'main');
        // gitHubCommit.createCommit('Commit message', 'Hello, world!');
        
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
        console.log('WARNING - check_repo_commit: context is not defined')
        checkResult.result = 'Failure'
        checkResult.status = 'Fail'
        checkResult.result = 'Repository cloning failure'
        checkResult.description = params.description
        return checkResult
      }
    } catch (err) {
      console.log(err)
      console.log('WARNING - check_repo_commit: context is not defined')
      checkResult.result = 'Failure'
      checkResult.status = 'Fail'
      checkResult.result = 'an error occurred while cloning the repository: ' + err.message
      checkResult.description = checkConfig.params.description
      return checkResult
    }
  }
}

class GitHubCommit {
  constructor(context, owner, repo, branch) {
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.context = context;
  }

  async getLatestCommitSHA() {
    const { data } = await this.context.octokit.repos.getBranch({
      owner: this.owner,
      repo: this.repo,
      branch: this.branch
    });
    return data.commit.sha;
  }

  async createCommit(message, content) {
    const latestCommitSHA = await this.getLatestCommitSHA();

    // create a date timestamp string
    const date = new Date();
    const timestamp = date.toISOString();
    // print current working directory
    console.log('Current working directory: ', process.cwd());

    const { data: tree } = await this.context.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: latestCommitSHA,
      tree: [
        {
          path: './test/test.txt',
          mode: '100644',
          type: 'blob',
          content: timestamp
        }
      ]
    });

    const { data: commit } = await this.context.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message,
      tree: tree.sha,
      parents: [latestCommitSHA]
    });

    await this.context.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: commit.sha
    });

    console.log('Commit created successfully!');
  }
}

module.exports = check_repo_commit
             