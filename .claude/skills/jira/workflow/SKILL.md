---
description: Start the full 8-step task workflow from scratch
disable-model-invocation: true
---

Run through the full task workflow defined in CLAUDE.md:

**[ ] Step 1 — Analyze**
Study the task. Explore the codebase, estimate the diff, define acceptance criteria. Break into subtasks if large.

**[ ] Step 2 — JIRA** → use `/jira:task`
Check for existing task. Create if not found. Must have: description, affected modules, acceptance criteria.

**[ ] Step 3 — Branch**
`git checkout -b <JIRA-KEY>-<short-english-description>`

**[ ] Step 4 — Implement**
Code changes + tests. Follow code style from CLAUDE.md and `agent_docs/`.

**[ ] Step 5 — Review**
Read changed modules. Remove dead code. Check logging convention (module_NNN: prefixes).

**[ ] Step 6 — Test** → use `/test:run`
`./execute_tests.sh` — all tests must pass.

**[ ] Step 7 — Git + PR** → use `/git:commit` then `/git:pr`
Stage files one by one. Commit per logical change. Push. Open PR.

**[ ] Step 8 — JIRA update**
Transition to PR OPEN (id `2`). Add comment: issues encountered + final report.
