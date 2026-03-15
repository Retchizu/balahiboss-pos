---
description: Implement highest priority small ticket with worktree setup
model: sonnet
---

## PART I - IF A TICKET IS MENTIONED

0c. read the ticket description and all comments to understand the implementation plan and any concerns

## PART I - IF NO TICKET IS MENTIONED

0. Ask the user to specify which ticket or task to implement.
0a. Once identified, read the ticket description and comments fully before proceeding.

## PART II - NEXT STEPS

think deeply

1. move the item to "in dev" using the MCP tools
1a. identify the linked implementation plan document from the `links` section
1b. if no plan exists, move the ticket back to "ready for spec" and EXIT with an explanation

think deeply about the implementation

2. set up worktree for implementation:
2a. read `hack/create_worktree.sh` and create a new worktree with the ticket branch name: `./hack/create_worktree.sh ENG-XXXX BRANCH_NAME`
2b. launch implementation session in worktree:
    `agent -p --force --trust --approve-mcps --workspace ~/wt/bot-bot/ENG-XXXX "/implement_plan and when you are done implementing and all tests pass, read ./.cursor/commands/commit.md and create a commit, then read ./.cursor/commands/describe_pr.md and create a PR, then add a comment to the ticket with the PR link"`

think deeply, use TodoWrite to track your tasks.
