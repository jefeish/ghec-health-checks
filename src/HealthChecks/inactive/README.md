# Inactive Health Check Modules

This folder should contain `healthChecks` code that the App does not currently use.

To activate a Modules:

1. Copy it to the `HealthChecks/` folder
    - `./check_repo.js` -> to `../healthChecks/`
2. Create a `config.yml` **HealthChecks** entry 
   - The `name:` has to be the name of the file, without the extension.

    Example:
    ```yaml
    health_checks:
    - name: "check_repo"
        description: standard repository checks (clone, push, PR)
        type: "repo"
        severity: "critical"
        message: "This is a custom message"
        params:
        repo: "" # required: repository name
        branch: "" # optional: default is "main"
        description: "" 
    ```