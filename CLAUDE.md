# Archie Home Assistant

## Architecture

**Modular Django 5.2 smart home dashboard** with 6 apps following a hub-and-spoke pattern.
`webapp` serves as the central dashboard; specialized apps (`light`, `weather`, `camera`, `ai_assistant`, `api`) handle specific functionality.

### Key Patterns

**Dual model pattern** — each app uses both Pydantic models (API schemas/validation) and Django models (persistence), bridged via `to_*()` conversion methods. See `homeassistant/ai_assistant/models.py`.

**API proxy pattern** — AI assistant proxies to external services:
```python
response = requests.post(f'{AI_AGENT_URL}/chat', json=data)
```

**Device controller pattern** — `light/light_controller.py` manages connection pooling, thread-safety, auto-discovery via `yeelight`, and state sync between physical devices and Django models.

### URL Routing

| Prefix | App |
|--------|-----|
| `/` | webapp (dashboard) |
| `/light/` | light control |
| `/ai-assistant/` | chat interface |
| `/weather/` | weather |
| `/camera/` | camera |
| `/api/` | API |

### App Overview

| App | Key Details |
|-----|------------|
| `light` | Yeelight via `yeelight` lib; models: `LightDevice`, `LightState`, `LightGroup`, `LightSchedule` |
| `weather` | OpenWeatherMap API, 10-min caching, `WeatherService` class |
| `ai_assistant` | Proxy to external AI; `UIElements`, `Card`, `NavigationCard`; `LllmTrace` for token tracking |

---

## Environment Variables

```
SECRET_KEY
DEBUG
DATABASE_URL          # sqlite:///db.sqlite3 or Postgres
OPENWEATHER_API_KEY
BACKEND_API_URL       # http://archie-backend:8002
AI_AGENT_URL          # http://archie-ai-agent:8005
```

---

## Task Workflow

When receiving a task, follow this strict 8-step process:

1. **Analyze** — Study the task. Analyze the codebase and estimate the required diff. Define acceptance criteria. If the task is large enough, break it into subtasks.
2. **JIRA** — Check existing JIRA tasks. If matching tasks exist, use them (update if needed). If not, create tasks of the appropriate type via `scripts/jira_tool.py`. Each JIRA task must have: description, affected modules, acceptance criteria.
3. **Branch** — Create a git branch named `<JIRA-KEY>-<short-english-description>` (e.g. `ARCHIE-42-add-token-cost-calc`). If there is no JIRA task, use just a short English description. Switch to the branch before any code changes.
4. **Implement** — Implement according to plan and coding rules. Create necessary and sufficient unit and smoke tests (temporary or permanent).
5. **Review** — Review relevant modules post-implementation. Ensure no dead code was left behind.
6. **Test** — Run `poetry run python manage.py test` and any task-specific temporary unit tests.
7. **Git** — If the task is done and meets acceptance criteria: `git add` changed/created modules one by one with a short commit message each. Then `git push` and open a PR via `gh pr create`.
8. **JIRA update** — Transition the JIRA task to `PR OPEN` (id `2`). Add a comment to the task with: any issues encountered during implementation, and a brief final report (what was done, what changed, key decisions made).

### JIRA Integration

- Project: **ARCHIE** (Solaris) on `badich.atlassian.net`, Cloud ID: `19b242d3-4de6-4f2d-8661-1a773d54f10d`
- Epic linking: use `parent` field (not `customfield_10014`)
- Issue types: `bug`, `story`, `task`, `subtask`, `epic`
- Transition IDs: `2` (PR OPEN), `11` (К выполнению), `21` (В работе), `31` (Postponed), `41` (Готово)
- CLI: `python scripts/jira_tool.py {create|update|list|get|transition|comment} ...`
- MCP: `mcp__jira-mcp__*` tools available — prefer these over CLI when in Claude Code

---

## Development

```bash
poetry run python manage.py runserver   # Dev server
make run                                # Shortcut for runserver
poetry run python manage.py migrate     # Apply migrations
poetry run python manage.py makemigrations  # After model changes
```

### Running Tests

```bash
poetry run python manage.py test        # All tests
poetry run python manage.py test <app>  # Single app
```

Mock external APIs in tests: `@patch('requests.get')` for weather service, etc.

Developer scripts (not production code): `scripts/`

---

## Logging Convention

```python
logger.info(f"light_controller_001: Description with \033[34m{id}\033[0m")   # Blue — IDs, URLs
logger.info(f"api_002: Count: \033[33m{count}\033[0m")                       # Yellow — numbers
logger.error(f"module_error_001: \033[31m{error}\033[0m")                    # Red — errors
logger.info("=== STEP 1: App Init ===")                                       # Global step markers
```

Only `logger.info()` and `logger.error()` levels. Use numbered module prefixes (`module_001:`).

---

## Code Style

### Python
- **Python 3.11+**, PEP8, type annotations on all function signatures
- `|` union syntax (`str | None`, not `Optional[str]`)
- **f-strings** for formatting; `"""` for docstrings, `"` for single-line strings
- Multi-parameter function definitions and calls: each parameter on a new line

### Pydantic Models
- `BaseModel` for all data structures; avoid `Any`, `None`, `Dict` types
- Access fields directly — don't guard with `hasattr` or `.get()`
- Use `model_dump()` / `model_validate()`, not deprecated `.dict()` / `.parse_obj()`

### Architecture Rules
- One responsibility per function/class
- No global variables for state; use config, env vars, or constants
- Prefer dict dispatch over long `if/elif` chains
- No `print()` — use `logger` only
- No hardcoded values — use settings, env vars, or constants
- No wildcard imports (`from x import *`)
- No code in `__init__.py`

### Import Order
```python
import os                                        # 1. stdlib
from django.db import models                     # 2. third-party
from homeassistant.light.models import LightDevice  # 3. local
```

### Naming
- Functions: `get_`, `create_`, `update_`, `execute_`, `parse_` prefixes
- Modules: `*_tool.py`, `*_service.py`, `*_utils.py`, `*_controller.py`
- No abbreviations in names

### What NOT to Do
- Don't use `print()` for logging
- Don't hardcode values — use settings or env vars
- Don't catch bare `except Exception` without logging the specific error
- Don't divide code with blank lines into visual "sections" inside functions
- Don't use imports inside functions or methods
- Don't create documentation files
