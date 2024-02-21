![wip](docs/images/WIP.png)

# GHEC Health Check App

 A GitHub App  to run a set of Health checks against the GitHub platform API.
<br><br><br>

![diagram](docs/images/flow-overview.svg)
![diagram](docs/images/architecture.svg)

(Built with [Probot](https://github.com/probot/probot))

## Setup

- REACT App

    In the REACT App root folder

    ```sh
    # Install dependencies
    npm install

    # build the react app
    npm run build
    ```

- Probot App root folder

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

[ISC](LICENSE) © 2023 Jürgen Efeish

```mermaid
sequenceDiagram
    participant main as Main Entrypoint
    participant init as Init Module
    participant fs as File System (fs)
    participant hc as Health Check Modules
    participant config as Config File
    participant report as Report Module
    participant ui as UI Module

    main->>init: loadConfig(app, configPath)
    init->>fs: fs.readFileSync(configPath, 'utf8')
    fs-->>init: Return config file content
    init-->>main: Return config object
    main->>fs: fs.watch(configPath)
    Note over main,fs: Watch for changes in config file

    main->>init: registerHealthCheckModules(app, modulesPath)
    init->>fs: fs.readdirSync(modulesPath)
    fs-->>init: Return list of health check files
    init->>hc: require each health check module
    hc-->>init: Return module instance
    init-->>main: Return map of health check modules
    main->>fs: fs.watch(modulesPath)
    Note over main,fs: Watch for changes in health check modules folder

    main->>ui: Initialize UI
    ui-->>main: UI started

    main->>report: executeHealthChecks(app, context, config)
    report->>hc: Execute each health check module
    hc-->>report: Return result of health check
    report-->>main: Return report
    ```