# Archie Home Assistant

## Architecture

Modular Django 5.2 smart home dashboard. `webapp` is the central hub; specialized apps handle specific functionality.

**Dual model pattern** — Pydantic models (API/validation) + Django models (persistence), bridged via `to_*()`. See `homeassistant/ai_assistant/models.py`.
**API proxy pattern** — AI assistant proxies to external AI Agent via `requests.post(f'{AI_AGENT_URL}/chat', json=data)`.
**Device controller pattern** — `light/light_controller.py` manages connection pooling, thread-safety, auto-discovery.

| Prefix | App | Key details |
|--------|-----|-------------|
| `/` | webapp | Dashboard |
| `/light/` | light | Yeelight; `LightDevice`, `LightState`, `LightGroup`, `LightSchedule` |
| `/ai-assistant/` | ai_assistant | Proxy to external AI; `UIElements`, `Card`, `NavigationCard`; `LllmTrace` |
| `/weather/` | weather | OpenWeatherMap API, 10-min caching, `WeatherService` |
| `/camera/` | camera | — |
| `/api/` | api | — |

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

Use `/workflow` for the full checklist. Steps:

1. Analyze — explore codebase, define acceptance criteria
2. JIRA → find or create task
3. Implement — code + tests
4. Review → 
5. Test → 
6. Git → 
7. JIRA update → 

JIRA project: **ARCHIE** on `badich.atlassian.net`. Details: `/task`.

---

## Development

```bash
make run                                    # Dev server
poetry run python manage.py migrate         # Apply migrations
poetry run python manage.py makemigrations  # After model changes
```

See `agent_docs/` for code style and logging conventions.

---

## Skills & Agents

| Skill | When to invoke |
|-------|----------------|
| `backend-developer` | Any Django change — models, views, services, URLs, migrations, tests, Redis |
| `frontend-developer` | Any UI change — templates, static JS/CSS, URL routing |
| `archie-shared` | Adding or editing shared Pydantic models: chat protocol types, UI components (cards, widgets, response levels), UserState |
| `ai-agent` | Building or editing UI that consumes AI agent responses — rendering response levels, WebSocket streaming, button discriminator (AssistantButton vs FrontendButton) |
