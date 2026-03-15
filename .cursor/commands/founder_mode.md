---
description: Create ticket and PR for experimental features after implementation
---

you're working on an experimental feature that didn't get the proper ticketing and pr stuff set up.

assuming you just made a commit, here are the next steps:


1. get the sha of the commit you just made (if you didn't make one, read `.cursor/commands/commit.md` and make one)

2. think deeply about what you just implemented, then create a ticket in your tracking system about what you just did, and put it in 'in dev' state - it should have ### headers for "problem to solve" and "proposed solution"
3. fetch the ticket to get the recommended git branch name (according to your tracker’s conventions)
4. git checkout main
5. git checkout -b 'BRANCHNAME'
6. git cherry-pick 'COMMITHASH'
7. git push -u origin 'BRANCHNAME'
8. gh pr create --fill
9. read '.cursor/commands/describe_pr.md' and follow the instructions
