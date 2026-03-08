---
description: Create a GitHub PR following project conventions (workflow step 7)
disable-model-invocation: true
---

Create PR for the current branch:

1. Verify all tests pass: `./execute_tests.sh -m "not llm"`
2. Push branch: `git push -u origin <branch>`
3. Extract JIRA key from branch name (e.g. `ARCHIE-87-...` → `ARCHIE-87`)
4. Create PR:

```bash
gh pr create \
  --title "<JIRA-KEY>: <short summary>" \
  --body "$(cat <<'EOF'
## Summary
- <what was done>
- <key changes>

## Test plan
- [ ] Unit tests pass (`./execute_tests.sh -m "not llm"`)
- [ ] Smoke tests pass if applicable (`./execute_tests.sh -m llm`)
- [ ] Manually verified in dev server (`make run`)

🤖 Generated with Claude Code
EOF
)"
```

After PR is open — run `/jira:task` step 8 to transition JIRA to PR OPEN.
