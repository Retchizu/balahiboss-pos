---
description: Create implementation plan for highest priority ticket ready for spec
---

## PART I - IF A TICKET IS MENTIONED

0c. read the ticket description and all comments to learn about past implementations and research, and any questions or concerns about them


### PART I - IF NO TICKET IS MENTIONED

0. Ask the user to specify which ticket or task needs an implementation plan.
0a. Once identified, read the ticket description and comments fully before proceeding.

### PART II - NEXT STEPS

think deeply

1. move the item to "plan in progress" using the MCP tools
1a. read ./.cursor/commands/create_plan.md
1b. determine if the item has a linked implementation plan document based on the `links` section
1d. if the plan exists, you're done, respond with a link to the ticket
1e. if the research is insufficient or has unaswered questions, create a new plan document following the instructions in ./.cursor/commands/create_plan.md

think deeply

2. when the plan is complete, attach the doc to the ticket in your tracking system and create a terse comment with a link to it.
2a. move the item to "plan in review" using the MCP tools

think deeply, use TodoWrite to track your tasks.

### PART III - When you're done


Print a message for the user (replace placeholders with actual values):

```
✅ Completed implementation plan for ENG-XXXX: [ticket title]

Approach: [selected approach description]

The plan has been created and linked to the ticket in your tracking system.

Implementation phases:
- Phase 1: [phase 1 description]
- Phase 2: [phase 2 description]
- Phase 3: [phase 3 description if applicable]

View the ticket in your tracking system.
```
