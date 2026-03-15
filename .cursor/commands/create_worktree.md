---
description: Create worktree and launch implementation session for a plan
---

2. set up worktree for implementation:
2a. read `hack/create_worktree.sh` and create a new worktree with the ticket branch name: `./hack/create_worktree.sh ENG-XXXX BRANCH_NAME`

3. determine required data:

branch name
path to plan file (use relative path only)
launch prompt
command to run

**IMPORTANT PATH USAGE:**
- Use the `@cursor/project/*` directory for any local plans, research, or notes
- Always use ONLY the relative path starting with `cursor/project/...` without any directory prefix
- Example: `cursor/project/plan/fix-mcp-keepalive-proper.md` (not the full absolute path)
- This works because `cursor/project` is part of the main repo and accessible from the worktree

3a. confirm with the user by sending a message to the Human

```
based on the input, I plan to create a worktree with the following details:

worktree path: ~/wt/bot-bot/ENG-XXXX
branch name: BRANCH_NAME
path to plan file: $FILEPATH
launch prompt:

    /implement_plan at $FILEPATH and when you are done implementing and all tests pass, read ./.cursor/commands/commit.md and create a commit, then read ./.cursor/commands/describe_pr.md and create a PR, then add a comment to the ticket with the PR link

command to run:

    agent -p --force --trust --approve-mcps --workspace ~/wt/bot-bot/ENG-XXXX "/implement_plan at $FILEPATH and when you are done implementing and all tests pass, read ./.cursor/commands/commit.md and create a commit, then read ./.cursor/commands/describe_pr.md and create a PR, then add a comment to the ticket with the PR link"
```

incorporate any user feedback then:

4. launch implementation session: `agent -p --force --trust --approve-mcps --workspace ~/wt/bot-bot/ENG-XXXX "<prompt from step 3a above>"`
