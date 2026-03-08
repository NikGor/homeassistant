---
description: Push changes to main and update JIRA
disable-model-invocation: true
---

Push committed changes to main and close out the task:

1. Verify all tests pass: `./execute_tests.sh -m "not llm"`
2. Push: `git push origin main`
3. Update JIRA → use `/jira:task` step 7 to transition to Done and add comment
