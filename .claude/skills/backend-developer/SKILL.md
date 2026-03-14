---
name: backend-developer
description: >
  Implement, edit, and analyze backend code for the Archie Home Assistant
  project — Django models, views, services, URL routing, migrations, tests,
  and Redis state management. Use this skill when working on Django apps,
  API endpoints, database models, business logic, or device integration.
  Use it even for small backend changes.
  Trigger on: "model", "view", "url", "api endpoint", "migration",
  "service", "controller", "redis", "device", "django", "backend",
  "database", "queryset", "pydantic", "schema", "auth", "poll".
---

# Backend Developer — Archie Home Assistant

## Architecture

Django 5.2 modular dashboard. Each app owns its models, views, URLs, and service layer.

```
homeassistant/
├── settings.py
├── urls.py                  # Root URL dispatcher
├── redis_client.py          # Global RedisClient singleton
├── webapp/                  # Auth, UserProfile, dashboard API
├── api/                     # User state CRUD via Redis
├── light/                   # Yeelight device management
├── weather/                 # OpenWeatherMap + caching
├── climate/                 # Climate mock state
├── ai_assistant/            # Chat proxy to AI Agent service
├── voice_assistant/         # Wake word + voice processing (optional deps)
└── camera/                  # Camera stream
```

### Tech Stack

| Layer | Tool |
|---|---|
| Framework | Django 5.2 |
| Data models | Django ORM + Pydantic v2 |
| State cache | Redis (`redis_client.py` singleton) |
| Device lib | `yeelight` for smart lights |
| Auth | Django built-in sessions + `UserProfile` OneToOne |
| DB | SQLite (dev) / PostgreSQL (prod) via `dj-database-url` |
| External AI | HTTP proxy to `AI_AGENT_URL` (FastAPI service) |
| Polling | `manage.py poll_devices` — infinite loop, 30 s interval |

## Main Process

### 1. Understand the scope

Before writing code, determine:
- **Which app?** Each concern lives in its own app. New device type → new app.
- **New model?** Requires `makemigrations` + `migrate` after changes.
- **Service or view?** Business logic → service class. HTTP handling → view.
- **Pydantic needed?** Any data crossing app boundaries or returned as JSON → Pydantic model.

Read `references/urls.md` to orient yourself in the URL space.

### 2. Read existing code first

Never guess existing structure. Read relevant files before editing:
- Models → `<app>/models.py` (Django) and `<app>/pydantic_models.py`
- Views → `<app>/views.py` and `<app>/api_views.py`
- Services → `<app>/services.py` or `<app>/light_controller.py`
- URLs → `<app>/urls.py` + root `homeassistant/urls.py`

### 3. Follow the dual-model pattern

Every domain uses **two model layers** — read `references/models.md` before adding models:
- **Django models** (`models.py`) — persistence, relationships, admin
- **Pydantic models** (`pydantic_models.py`) — API responses, validation, Redis serialisation
- Bridge via `.to_pydantic()` / `.model_dump()` — never return raw ORM objects as JSON

### 4. Implement views correctly

Read `references/views.md` for decorator and response patterns. Key rules:
- All page views → `@method_decorator(login_required)`
- All JSON API views → `@method_decorator(csrf_exempt)`
- Return `JsonResponse(pydantic_model.model_dump())` — never raw dicts with unchecked fields
- Validate input; return `status=400` on bad input, `status=404` on missing resource

### 5. Use the service layer

Read `references/services.md` for service and Redis patterns:
- Instantiate services per-request (no shared mutable state)
- Redis state key: `user_state:name:{user_name}` — always via `redis_client` singleton
- Device state updates go through `*Service.save_to_redis(user_name)` — never write raw device data to Redis directly

### 6. Migrations and admin

After any model change:
```bash
poetry run python manage.py makemigrations <app>
poetry run python manage.py migrate
```
Register new models in `<app>/admin.py` so they appear in the Django admin.

### 7. Tests

- Add tests in `<app>/tests.py` using Django `TestCase`
- Mock external calls (`@patch('requests.get')`, `@patch('yeelight.Bulb')`)
- Cover: model creation, view responses (status codes), service logic
- Run: `poetry run python manage.py test`

## References — When to Load

| Reference | Load when |
|---|---|
| `references/models.md` | Adding/editing models, writing migrations, checking field constraints |
| `references/views.md` | Adding/editing views, choosing decorators, structuring responses |
| `references/services.md` | Adding services, using Redis, integrating a new device type |
| `references/urls.md` | Adding URL routes, debugging 404s, mapping frontend calls to views |

## Edge Cases

- **Voice app dependencies**: `pvporcupine`, `pyaudio` etc. are optional — guarded with `try/import`. Don't make them required.
- **`archie-shared` package**: `archie_shared` is a local editable package at `archie-shared/`. `ChatMessage`, `ConversationModel`, UI card types come from there — don't redefine them.
- **AI assistant is a proxy**: `ai_assistant` views forward requests to `AI_AGENT_URL` — they don't contain chat logic. Don't add LLM logic here.
- **Redis may be unavailable**: Always handle `redis_client` errors gracefully — return degraded response, not 500.
- **CSRF on API endpoints**: JSON API views must use `@csrf_exempt`. Forms and page views must not.
- **`poll_devices` command**: It writes device state to Redis every 30 s. New devices must add a `save_to_redis()` call there too.
