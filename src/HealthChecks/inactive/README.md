# Inactive Health Check Modules

To activate a Modules:

1. Copy it to the `HealthChecks/` folder
2. Create a `config.yml` **HealthChecks** entry

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