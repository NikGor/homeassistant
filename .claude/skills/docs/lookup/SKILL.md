---
description: Look up current library documentation via context7 MCP
---

Use context7 MCP tools to get up-to-date documentation for any library used in this project.

**When to use**: before implementing features that depend on an external library — verify current API,
method signatures, and examples rather than relying on training data cutoff.

**Key libraries in this project:**
- `django` 5.2 — web framework (`homeassistant/settings.py`, views, models)
- `pydantic` v2 — data models (`ai_assistant/pydantic_models.py`, `archie-shared/`)
- `yeelight` — smart light control (`light/light_controller.py`)
- `httpx` — async HTTP client (external API calls)
- `requests` — sync HTTP client (AI Agent proxy in `ai_assistant/views.py`)
- `jinja2` — template engine (Django templates)
- `poetry` — dependency management (`pyproject.toml`)

**Usage pattern:**
1. Call `mcp__context7__resolve-library-id` with the library name to get its context7 ID
2. Call `mcp__context7__query-docs` with the ID and a topic to retrieve relevant docs
3. Use the returned documentation to inform implementation
