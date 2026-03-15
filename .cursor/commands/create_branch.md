---
description: Create branch using git
---

# Create Branch

You are tasked to write a branch name following the convention:

`<type>/<ticket-number>-<title>`

### Types:
- feature
- bugfix
- hotfix
- refactor
- chore
- cleanup
- restructure
- docs
- guide
- test
- ci
- perf
- optimize
- build
- infra
- deploy
- experiment
- spike
- poc
- release
- version
- security
- migration
- seed

### Rules:
1. If no ticket number is provided, ask for it. **DO NOT CREATE** unless a ticket number is present. Usually the ticket number format is `NA-XXXX` or `NW-XXXX`
2. When creating a branch name, provide **at least 3 options** and ask the user which one fits best, then proceed to create.
3. Default behavior:  
   ```bash
   git switch -c branch-name
   ```
4. If instructed to create a branch without switching, use:
    ```
    git branch branch-name
    ```
