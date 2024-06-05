/**
 * @description Event Handler Class (TEMPLATE).
 * @param
 */

const Command = require('./common/command.js')
const fs = require('fs-extra');
const simpleGit = require('simple-git');
const util = require('util');
const { exec } = require('child_process');
const { data } = require('jquery');
let instance = null


class check_repo_pr_open extends Command {

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
    this.git = simpleGit();
  }

  /**
   * Singleton pattern
   */
  static getInstance() {
    if (!instance) {
      instance = new check_repo_pr_open()
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

    console.log('check_repo_pr_open.execute()')
    let checkResult = {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "result",
      "status": "status"
    }

    try {

      if (typeof checkConfig == 'undefined') {
        checkResult.name = 'check_repo_pr_open',
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

        // Split the URL by '/' and get the last part
        const repositoryUrl = checkConfig.params.repo;
        const parts = repositoryUrl.split("/");
        const lastPartWithGit = parts[parts.length - 1];

        // Remove the '.git' extension
        const repoName = lastPartWithGit.replace(/\.git$/, '');
        const destinationPath = checkConfig.params.target + '/' + repoName;

        console.log('Repository URL:', repositoryUrl);
        console.log('Destination path:', destinationPath);

        // Remove the local repository if it exists
        await this.removeLocalRepository(destinationPath)

        // initialize the git repository
        await this.cloneRepository(repositoryUrl, destinationPath) 
        console.log('Repository cloned to:', destinationPath);
        
        checkResult = await this.createPR(context, checkConfig)

        // await this.removeLocalRepository(this.destinationPath)

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
      console.log(err)
      console.log('WARNING - ' + checkConfig.name + ': context is not defined')
      checkResult.status = 'fail'
      checkResult.result = err.message
      checkResult.description = checkConfig.description
      return checkResult
    }
  }
  
  /**
   * @description
   * 
   * @param {*} repositoryUrl 
   * @param {*} destinationPath 
   * @returns 
   */
  async cloneRepository(repositoryUrl, destinationPath) {

    console.log('Cloning repository:', repositoryUrl, 'to:', destinationPath)

    return new Promise((resolve, reject) => {
      this.git.clone(repositoryUrl, destinationPath, (error, result) => {
        if (error) {
          console.error('Error cloning repository [' + destinationPath + ']:', error);
          console.log('Result:', result);
          reject(error);
        } else {
          console.log('Repository [' + destinationPath + '] cloned successfully: ', result);
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
   * @param {*} repoPath 
   */
  async removeLocalRepository(repoPath) {
    console.log('\n\n ---------------------------------------------------\n Checking for directory: >' + repoPath + '<\n ---------------------------------------------------\n\n');

    try {
      // check if the directory exists
      if (fs.existsSync(repoPath)) {
        console.log('\n\n ---------------------------------------------------\n Directory >' + repoPath + '< Exists!\n ---------------------------------------------------\n\n');

        await fs.remove(repoPath);
        console.log('\n\n ---------------------------------------------------\n Directory >' + repoPath + '< removed successfully.\n ---------------------------------------------------\n\n');
      }
    } catch (error) {
      console.error('Error removing directory >' + repoPath + '<:' + error);
    }
    // log the folder current contents
    // fs.readdirSync(checkConfig.params.target + '/').forEach(file => {
    //   console.log('DEBUG: ' + checkConfig.params.target + '/' + file);
    // });
  }

  /**
   * @description create a new branch or switch to an existing branch
   * @param {*} branchName
   * @returns
   */
  async createPR(context, checkConfig) {
    let response = null;

    try {
      const timestamp = new Date().getTime();
      // format the timestamp to a readable date
      const date = new Date(timestamp).toUTCString();

      console.log("checkConfig: ", checkConfig)
      console.log("checkConfig.params.repo: ", checkConfig.params.repo)
      const repoName = checkConfig.params.repo.split('/').pop().replace('.git', '');
      const repoPath = checkConfig.params.target + '/' + repoName;
      console.log("repoPath: ", repoPath)

      // Change working directory to the cloned repository
      await this.git.cwd(repoPath);
      console.log('Changed working directory to:', repoPath);
      
      // fetch all branches
      await this.git.fetch(['--all'], (fetchError) => {
        if (fetchError) {
            console.error('Error fetching all branches:', fetchError);
            return;
        }        
      });

      // ------------------------------------------------
      // SWITCH TO THE BRANCH
      // ------------------------------------------------

      const checkBranchExistence = async (branchName) => {
        return new Promise((resolve, reject) => {
          this.git.branchLocal((error, branches) => {
            if (error) {
              console.error('Error checking branches:', error);
              reject(error);
            } else {
              const exists = branches.all.includes(branchName);
              resolve(exists);
            }
          });
        });
      };
      
      const createOrSwitchToBranch = async (branchName) => {
        try {
          const branchExists = await checkBranchExistence(branchName);
          if (branchExists) {
            await this.git.checkout(branchName);
            console.log('Switched to branch:', branchName);

            // pull the latest changes from the remote repository branch
            await this.git.pull('origin', branchName, (pullError) => {
              if (pullError) {
                console.error('Error pulling latest changes:', pullError);
                return;
              }
            });
          } else {
            await this.git.checkoutLocalBranch(branchName);
            console.log('Created and switched to branch:', branchName);
                        
            // pull the latest changes from the remote repository branch
            await this.git.pull('origin', branchName, (pullError) => {
              if (pullError) {
                console.error('Error pulling latest changes:', pullError);
                return;
              }
            });
          }
        } catch (error) {
          console.error('Error creating or switching to branch:', error);
          throw error;
        }
      };
      
      await createOrSwitchToBranch(checkConfig.params.branch);
     
      // ------------------------------------------------
      // DONE SWITCHING TO THE BRANCH
      // ------------------------------------------------

      // create new file content using the timestamp
      const fileContent = `console.log('Updated code: ${date}');`;

      // File path
      const filePath = repoPath + '/example.js';

      // Create a new file with the code change
      await require('fs').writeFileSync(filePath, fileContent, 'utf-8');

      // debug: print the file content and list the files in the directory
      console.log('File content:', fileContent);
      console.log('Files in the directory:', require('fs').readdirSync(repoPath));

      // print a git status
      console.log('Git status:', await this.git.status());

       // Add the file to the staging area
      await this.git.add(filePath, (addError) => {
        if (addError) {
          console.error('Error occurred while adding:', addError);
          return;
        }
      });

      // Commit the changes with a commit message
      await this.git.commit('updated example.js', (commitError, commitResult) => {
        if (commitError) {
          console.error('Error occurred while committing:', commitError);
          return;
        }

        console.log('Changes committed successfully:', commitResult);
      });

      // Push the changes to the branch and create the upstream branch
      await this.git.push('origin', checkConfig.params.branch || 'patch-1', {'--set-upstream': null}, async (pushError, pushResult) => {
        if (pushError) {
          console.error('Error occurred while pushing:', pushError);
          return;
        }

        console.log('Pushed changes successfully:', pushResult);
      });

      // ------------------------------------------------
      // Create the PR
      // ------------------------------------------------
      console.log('create PR')

      response = await context.octokit.pulls.create({
        owner: context.payload.repository.owner.login,
        repo: repoName,
        title: checkConfig.name,
        body: "This is an automated pull request created by the health check.",
        head: checkConfig.params.branch,
        base: "main",
      });
  
      console.log('Pull request created:', util.inspect(response));
    } catch (error) {
      console.error('Error occurred while creating a PR:', error.response.data.errors[0].message);
      // escape the 'error' object to a string, excluding all '|' characters
      error = JSON.stringify(error.response.data.errors[0].message).replace(/\|/g, '');

      // if the error message indicates that the PR already exists, return a pass
      if (error.includes('A pull request already exists')) {
        return {
          "name": checkConfig.name,
          "description": checkConfig.description,
          "result": error,
          "status": "pass"
        }
      }

      return {
        "name": checkConfig.name,
        "description": checkConfig.description,
        "result": error,
        "status": "fail"
      }    
    }

    return {
      "name": checkConfig.name,
      "description": checkConfig.description,
      "result": "PR #"+  response.data.number +" created",
      "status": "pass"
    }
  }

}

module.exports = check_repo_pr_open
