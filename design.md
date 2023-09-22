![wip](docs/images/WIP.png)

# Health Check App - Design Doc

## The Objective

Verifying the operational integrity of the GitHub platform using the GitHub API. These checks represent a proactive effort to confirm the health of the SaaS platform, complementing GitHub's own status and incident notifications.

---   

## Scope and Limits of Health Checks

   - :heavy_check_mark:  Test standard health scenarios Cloning/Commits/PRs/Merge/ etc.
   - :warning: Any performance degradation of CI/CD pipelines are only an Issue if we are talking GitHub hosted runners. Any other (Jenkins) pipeline issues might be detected from the GitHub side but GitHub is not considered the root-cause
  - :warning: Make sure to correctly address “False-Positives”… A developers “impression” is NOT a fact !
  - :heavy_exclamation_mark: You cannot stress test the system via any App, thats why we have rate-limits
  - :heavy_exclamation_mark: API based testing cannot provide any health information on the UI
  - :heavy_exclamation_mark: API based interval testing cannot provide realtime data
  - :heavy_exclamation_mark: Testing results can be affected by network location of the App

  - Make every developer/operator aware of the [GitHub Status Page](https://www.githubstatus.com/)
## Considerations for choosing the architecture of the health check app

- **Simplicity:** 

    The health check application's primary purpose is to monitor the health of various services or components in the GitHub platform. It involves sending requests to those services and checking their responses. This can be accomplished with a simple, single-service application.

- **Overhead:** 

    A compact and uncomplicated health check application typically does not necessitate the added complexity of microservices.

- **Scalability:** 

    The health check application doesn't need to scale to handle high loads because it is not processing significant amounts of data or serving user requests. A monolithic or single-service architecture is sufficient for handling health checks.

- **Ease of Use:** 
    
    A simple, monolithic health check application is often easier to set up and use than a distributed microservices architecture. It is a more practical choice for teams looking for a quick and efficient solution.



---

## Features

- Dynamically reload Health Check configuration (yaml)
   - Activate or Deactivate health checks at runtime
- Dynamically load/reload Health Check Modules (.js)
   - New Health Check Modules can be loaded at runtime, no App restart required

---

## Architecture

![diagram](docs/images/architecture.svg)
