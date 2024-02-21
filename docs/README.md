# Documentation for the GitHub Health Checks App

 A GitHub App to run a set of Health checks against the GitHub platform API.

![diagram](images/flow-overview.svg)

## Some notes on the Application Scope

- This app is for testing standard health scenarios of th GitHub platform, via the GitHub API, such as, Cloning/Commits/PRs/Merge/ etc.
- You cannot stress test the system via any App, that is restricted by GitHub rate-limits
- Any performance degradation of CI/CD pipelines are only an Issue if we are talking GitHub hosted runners. Any other (Jenkins) pipeline issues might be detected from the GitHub side but GitHub is not considered the root-cause
- The app can help to correctly address “False-Positives” (a users “impression” is NOT a fact)

### Notes

GitHub provides the GHEC Health status information via https://www.githubstatus.com or to integrate this information into users local monitoring systems via the GitHub status API


