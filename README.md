![License](https://img.shields.io/badge/License-ISC-blue.svg)
![npm audit](https://img.shields.io/badge/npm_audit-pass-green)

# GHEC Health Check App

 A GitHub App  to run a set of Health checks against the GitHub platform API.
<br><br><br>

![diagram](docs/images/flow-overview.svg)
![diagram](docs/images/architecture.svg)

(Built with [Probot](https://github.com/probot/probot))

---

## How to Register & Install the APP

This GitHub App relies on to main components to configure the App,

- .env - standard NodeJS app configuration file
- app.yml - GitHub App manifest Yaml

### Step 1: The GitHub App manifest

> **Note:** GitHub Documentation provides detailed information on how to ["Register a GitHub App from a manifest"](https://docs.github.com/en/enterprise-cloud@latest/apps/sharing-github-apps/registering-a-github-app-from-a-manifest).

The Probot framework use the Manifest file to install the Health-Check App. follow these instructions.

#### Explanation of the Manifest Content

The App's manifest file has several segments that require adjustment to the installation environment.

Manifest Reference: [app.yml](./app.yml)

- `Default Events` - These event are what the App reacts on to trigger the health-checks. The minimum requirement for using Issue Ops as a trigger would be this setup.

  ```yaml
  # - check_run
  # - check_suite
  # - commit_comment
  # - create
  # - delete
  # - deployment
  # - deployment_status
  # - fork
  # - gollum
  - issue_comment
  - issues
  # - label
  # - milestone
  # - member
  # - membership
  # - org_block
  # - organization
  # - page_build
  # - project
  # - project_card
  # - project_column
  # - public
  # - pull_request
  # - pull_request_review
  # - pull_request_review_comment
  # - push
  # - release
  # - repository
  # - repository_import
  # - status
  # - team
  # - team_add
  # - watch
  ```

- `Default Permissions` - Permissions that the App will be given to run GitHub Rest API calls.

  ```yaml
  # The set of permissions needed by the GitHub App. The format of the object uses
  # the permission name for the key (for example, issues) and the access type for
  # the value (for example, write).
  # Valid values are `read`, `write`, and `none`
  default_permissions:
    # Repository creation, deletion, settings, teams, and collaborators.
    # https://developer.github.com/v3/apps/permissions/#permission-on-administration
    administration: write
    ...
  ```

  - **NOTE:** The permissions for the App depend on the required and implemented Health-Check components. 

- Common App Settings

  ```yaml
  # The name of the GitHub App. Defaults to the name specified in package.json
  name: health-status

  # The homepage of your GitHub App.
  url: https://example.com/

  # A description of the GitHub App.
  description: A Probot health-status
  
  # Set to true when your GitHub App is available to the public or false when it is only accessible to the owner of the app.
  # Default: true
  # public: false
  ```
  - **NOTE:** `The homepage of your GitHub App`, is a documentation homepage, usually the README of the App Repo or a GitHub Pages location of the App Repo.

### Step 2: Probot App Installation
 
- Clone the App Repo to a specific host.
  <details><summary>Click here to see a sample of an App installation evironment</summary>
    <p>

    ![sample installation](docs/images/github-app-env.png)

    </p>
  </details>

  > **NOTE:** A GitHub Probot App follows the installation of a standard NodeJS application (ref: [NPM](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager)).

- Start the (Probot) App:

  
  > Note: Probot checkes for an existing `.env` file, if the file does not exist, Probot will start an App registration & installation, process using the local Manifest (yaml) file as a reference.

  ```bash
  npm install
  npm start
  ```

  ![probot-installation](docs/images/probot-install.png)
  
  When running it for the first time (no .env) the local web page provides a **`Register GitHub App`** button, that will take you to the GitHub app installation page, using the pre-configured Manifest file config settings.

  After completing the process you will see a local `.env` file with standard config setting replied from the installation process

  Reference: [Probot configuration](https://probot.github.io/docs/configuration/)

  - Example

  ```
  WEBHOOK_PROXY_URL=https://smee.io/3rivK3hkqfCp
  APP_ID=879555
  PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----...
  WEBHOOK_SECRET=f452...44af
  GITHUB_CLIENT_ID=Iv1.044839999999992c
  GITHUB_CLIENT_SECRET=ff4f...a171
  ```

- RESTART THE APP !

---

## Start the full App

- Build the REACT App

    In the REACT App root folder (`/src/ui/`)

    ```sh
    # Install dependencies
    npm install

    # build the react app
    npm run build
    ```

- Probot App root folder (`/`)

    ```sh
    # Install dependencies
    npm install
    ```

    ```sh
    # Run the bot
    npm start
    ```

- Access the app at `http://localhost:3000` (default)
- Access the UI at `http://localhost:3000/health-check` (default)

- **NOTE:** You can set a different port in the `package.json` file
  ```
    "scripts": {
      "start": "PORT=2001 probot run ./src/index.js",
      ...
    },
  ```

---

## Docker

```sh
# 1. Build container
docker build -t health-check-app .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> health-check-app
```

## Contributing

If you have suggestions for how health-check-app could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2024 Jürgen Efeish
