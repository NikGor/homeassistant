---
description: Release archie-shared: bump version, commit, push tag, update dependency
disable-model-invocation: true
---

Release workflow for `archie-shared` (shared Pydantic models used by multiple repos).

## Steps

1. **Check current version**
   - Read `archie-shared/pyproject.toml` — find `version = "X.Y.Z"`

2. **Determine new version**
   - Ask the user for the new version if not provided
   - Default: bump patch (`0.1.60` → `0.1.61`)

3. **Review changes**
   - `git diff archie-shared/` — show what changed
   - Summarize the changes briefly for the commit message

4. **Bump version**
   ```bash
   make bump-archie-shared VERSION=X.Y.Z
   ```
   This updates `archie-shared/pyproject.toml` and commits the version bump.

5. **Commit model changes** (if any uncommitted changes in `archie-shared/`)
   - Stage and commit archie-shared changes **before** running bump
   - Use `/git:commit` convention: `feat(archie-shared): <description>`

6. **Push and tag**
   ```bash
   git push origin <current-branch>
   make bump
   ```
   `make bump` reads the version from `pyproject.toml`, creates tag `vX.Y.Z`, and pushes it.

7. **Update dependency in homeassistant**
   ```bash
   poetry update archie-shared
   ```
   Then commit the updated `poetry.lock`:
   ```
   chore: update archie-shared to vX.Y.Z
   ```

## Important

- `make bump-archie-shared` only updates `pyproject.toml` and commits — it does NOT push or tag
- `make bump` creates and pushes the git tag — this triggers auto-tagging in CI
- Other repos consuming `archie-shared` via git tag will need to run `poetry update archie-shared` on their side
- Never skip the `poetry update` step — stale `poetry.lock` will pin the old version
