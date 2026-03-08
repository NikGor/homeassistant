---
description: Start the full 8-step task workflow from scratch
disable-model-invocation: true
---

Run through the full task workflow defined in CLAUDE.md:

**[ ] Step 1 — Analyze**
Study the task. Explore the codebase, estimate the diff, define acceptance criteria. Break into subtasks if large.

**[ ] Step 2 — JIRA** → use `/jira:task`
Check for existing task. Create if not found. Must have: description, affected modules, acceptance criteria.

**[ ] Step 3 — Implement**
Code changes + tests. Follow code style from `agent_docs/`.

**[ ] Step 4 — Review**
Read changed modules. Remove dead code. Check logging convention (module_NNN: prefixes).

**[ ] Step 5 — Test** → use `/test:run`
`./execute_tests.sh` — all tests must pass.

**[ ] Step 6 — Git** → use `/git:commit`
Stage files one by one. Commit per logical change. Push to main.

**[ ] Step 7 — JIRA update**
Transition to Done (id `41`). Add comment: issues encountered + final report.
