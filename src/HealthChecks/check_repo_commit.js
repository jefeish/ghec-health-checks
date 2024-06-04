/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 */

const Command = require('./common/command.js')
const fs = require('fs-extra');
const simpleGit = require('simple-git');
let instance = null

class check_repo_commit extends Command {

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
    this.git = simpleGit();
    this.destinationPath = '';
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

    console.log('check_repo_commit.execute()')
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

        console.log("checkConfig: ", checkConfig)
        checkResult = await this.createCommit(checkConfig);

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

  /**
   * @description Clone a repository into a new directory
   * 
   * @param {*} checkConfig
   * @returns 
   */
  async cloneRepository(checkConfig) {
    // Split the URL by '/' and get the last part
    const repositoryUrl = checkConfig.params.repo;
    const parts = repositoryUrl.split("/");
    const lastPartWithGit = parts[parts.length - 1];

    // Remove the '.git' extension
    const repoName = lastPartWithGit.replace(/\.git$/, '');
    this.destinationPath = checkConfig.params.target + '/' + repoName;

    // Remove the local repository if it exists
    await this.removeLocalRepository(this.destinationPath, checkConfig)

    console.log('Cloning repository:', repositoryUrl, 'to:', this.destinationPath)

    return new Promise((resolve, reject) => {
      this.git.clone(repositoryUrl, this.destinationPath, (error, result) => {
        if (error) {
          console.error('Error cloning repository [' + this.destinationPath + ']:', error);
          console.log('Result:', result);
          reject(error);
        } else {
          console.log('Repository [' + this.destinationPath + '] cloned successfully: ', result);
          resolve(true);
        }
      });
    });
  }

  /**
   * @description remove the local repository
   * 1. check if the directory exists
   * 2. remove the directory
   * 
   * @param {*} directoryPath 
   * @param {*} checkConfig
   */
  async removeLocalRepository(directoryPath, checkConfig) {
    console.log('\n\n ---------------------------------------------------\n Checking for directory: >' + directoryPath + '<\n ---------------------------------------------------\n\n');

    try {
      // check if the directory exists
      if (fs.existsSync(directoryPath)) {
        console.log('\n\n ---------------------------------------------------\n Directory >' + directoryPath + '< Exists!\n ---------------------------------------------------\n\n');

        await fs.remove(directoryPath);
        console.log('\n\n ---------------------------------------------------\n Directory >' + directoryPath + '< removed successfully.\n ---------------------------------------------------\n\n');
      }
    } catch (error) {
      console.error('Error removing directory >' + directoryPath + '<:' + error);
    }
    // log the folder current contents
    fs.readdirSync(checkConfig.params.target + '/').forEach(file => {
      console.log('DEBUG: ' + checkConfig.params.target + '/' + file);
    });
  }

  /**
   * @description Create a commit in the cloned repository
   * @param {*} checkConfig 
   * @returns 
   */
  async createCommit(checkConfig) {
    try {
      const timestamp = new Date().getTime();
      // format the timestamp to a readable date
      const date = new Date(timestamp).toUTCString();

      console.log("checkConfig: ", checkConfig)
      console.log("checkConfig.params.repo: ", checkConfig.params.repo)
      const repoPath = checkConfig.params.target + '/' + checkConfig.params.repo.split('/').pop().replace('.git', '');
      console.log("repoPath: ", repoPath)

      // initialize the git repository
      await this.cloneRepository(checkConfig)
      console.log('Repository cloned to:', repoPath);

      // create new file content using the timestamp
      const fileContent = `console.log('Updated code: ${date}');`;

      // File path
      const filePath = repoPath + '/example.js';

      // Create a new file with the code change
      require('fs').writeFileSync(filePath, fileContent, 'utf-8');

      // debug: print the file content and list the files in the directory
      console.log('File content:', fileContent);
      console.log('Files in the directory:', require('fs').readdirSync(repoPath));

      // Change working directory to the cloned repository
      await this.git.cwd(repoPath);

      console.log('Changed working directory to:', repoPath);

      //print a git status
      console.log('Git status:', await this.git.status());

      // Add the file to the staging area
      this.git.add(filePath)
        // Commit the changes with a commit message
        .commit('updated example.js', (error, result) => {
          if (error) {
            console.error('Error occurred while committing:', error);
            return;
          }
          console.log('Changes committed successfully:', result);
          // Push the changes to the origin
          this.git.push('origin', checkConfig.params.branch || 'main', (pushError, pushResult) => {
            if (pushError) {
              console.error('Error occurred while pushing:', pushError);
              return;
            }
            console.log('Changes pushed successfully:', pushResult);
          });
        });
    } catch (error) {
      console.error('Error occurred while creating a commit:', error);
      // escape the 'error' object to a string, excluding all '|' characters
      error = JSON.stringify(error).replace(/\|/g, '');

      return {
        "name": checkConfig.name,
        "description": checkConfig.description,
        "result": error,
        "status": "fail"
      }
    }

    // await this.removeLocalRepository(this.destinationPath)

    const checkResult = {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "commit created successfully",
      "status": "pass"
    }

    return checkResult
  }

}

// Export the singleton instance
module.exports = check_repo_commit
