/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 */

const Command = require('./common/command.js')
const simpleGit = require('simple-git');
let instance = null
// Initialize simple-git
const git = simpleGit();

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

  async createCommit(context, repositoryUrl, branch) {

    const fs = require('fs');
    const { promisify } = require('util');

    const exists = promisify(fs.exists);

    // Split the URL by '/' and get the last part
    const parts = repositoryUrl.split("/");
    const lastPartWithGit = parts[parts.length - 1];

    // Remove the '.git' extension
    const repoName = lastPartWithGit.replace(/\.git$/, '');
    const destinationPath = './tmp/' + repoName;

    console.log('DEBUG: createCommit()');

    // Check if the local repository exists
    exists(destinationPath).then( (exists) => {
      if (!exists) {
        // Clone the repository if it doesn't exist locally
        git.clone(repositoryUrl, destinationPath).then( () => {
          console.log('Repository cloned successfully.');
          this.makeChangesAndPush(destinationPath, branch);
        }).catch((err) => {
          console.error('Error cloning repository:', err);
        });
      } else {
        console.log('Repository already exists locally.');
        // If the repository exists locally, directly make changes and push
        this.makeChangesAndPush(destinationPath, branch);
      }
    }).catch((err) => {
      console.error('Error checking if repository exists locally:', err);
    });
  }

  /**
   * @description Make changes to the repository and push to remote.
   * 
   * @param {*} destinationPath 
   */
  async makeChangesAndPush(destinationPath, branch) {
    console.log('Making changes to the repository...' + destinationPath);
    // Navigate to the local repository directory
    process.chdir(destinationPath);

    const commit_file = 'commit-test.txt';  
    // Commit message
    const commitMessage = 'test commit from GitHub App';

    // create a temporary file
    const fs = require('fs');
    // add a new file to the repository with the content of the current date
    fs.writeFileSync('./'+ commit_file, new Date().toISOString());

    // log the folder content
    fs.readdirSync('.').forEach(file => {
      console.log('log folder content: ' + file);
    });
    //print current working directory
    console.log('git add . - current working directory: ' + process.cwd());
    // Add files you want to commit (e.g., '.')
    git.add(commit_file).then(() => {
      console.log('Files added to commit successfully.');
      // Commit changes
      git.commit(commitMessage).then(() => {
        console.log('Changes committed successfully: ' + commitMessage);
        // Push changes to remote
        git.push('origin', branch, (err) => {
          if (err) {
            console.error('Error pushing to remote:', err);
          } else {
            console.log('Changes pushed to remote repository successfully.');
          }
        });
      }).catch((err) => {
        console.error('Error committing changes:', err);
      });
    }).catch((err) => {
      console.error('Error adding files to commit:', err);
    });
  }

  /**
   * @description Main entry point for invocation from client
   * 
   * @param {*} context 
   * @param {*} data 
   */
  async execute(context, checkConfig) {

    console.log(checkConfig.name + '.execute()')
    let checkResult = {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "NA",
      "status": "NA"
    }
    console.log('checkConfig:', checkConfig)

    try {
      console.log('inside try 1')
      if (typeof checkConfig == 'undefined') {
        checkResult.name = 'checkConfig is not defined',
          checkResult.status = 'fail',
          checkResult.result = 'checkConfig is not defined',
          checkResult.description = 'checkConfig is not defined'
        return checkResult
      }
      console.log('inside try 2')
      // if the context is not defined or the checkConfig is not defined, return an error
      if (context.octokit !== undefined && checkConfig.params !== undefined) {
        console.log('inside if')
        // ------------------------------------------------
        // YOUR CODE HERE !
        // ------------------------------------------------

        // Define the branch you want to commit to, if the branch is not defined or empty, it will default to 'main'
        const branch = checkConfig.params.branch || "main";
        console.log('branch:', branch)
        await this.createCommit(context, checkConfig.params.repo, branch);

        return checkResult
      }
      else {
        console.log('WARNING - ' + checkConfig.name + ': context is not defined')
        checkResult.status = 'fail'
        checkResult.result = 'context is not defined'
        checkResult.description = checkConfig.description
        return checkResult
      }
    } catch (err) {
      console.error('ERROR - ' + checkConfig.name + ': ' + err)
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }

  // Utilitary function to handle the command

}

// Export the singleton instance
module.exports = check_repo_commit
