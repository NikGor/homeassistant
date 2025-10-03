# Copilot Instructions for Archie Home Assistant

## Architecture Overview

This is a **modular Django 5.2 smart home dashboard** with 6 distinct apps following a hub-and-spoke pattern. The main `webapp` serves as the central dashboard, while specialized apps (`light`, `weather`, `camera`, `ai_assistant`, `api`) handle specific functionality.

**Key architectural decisions:**
- **Dual model pattern**: Each app uses both Pydantic models (for API schemas/validation) and Django models (for persistence)
- **Microservice-ready**: AI assistant proxies to external services (`BACKEND_API_URL`, `AI_AGENT_URL`)
- **Poetry dependency management** with specific constraints (`python = ">=3.11,<4.0"`)

## Development Commands

```bash
# Use Poetry for all Python operations
poetry run python manage.py runserver
poetry run python manage.py migrate
make run  # Shortcut for runserver
```

## Critical Patterns

### 1. Model Structure Pattern
Every domain has **dual models** - study `homeassistant/ai_assistant/models.py`:
- **Pydantic models** (e.g., `ChatMessage`, `ConversationModel`) for API schemas/validation
- **Django models** (e.g., `Message`, `Conversation`) for database persistence
- **Conversion methods**: `to_chat_message()`, `to_conversation_model()` bridge the two

### 2. URL Routing Pattern
Main `urls.py` uses app-specific prefixes:
- Root `/` → webapp (dashboard)
- `/light/` → light control
- `/ai-assistant/` → chat interface
- `/weather/`, `/camera/`, `/api/` → respective apps

### 3. API Proxy Pattern
AI assistant doesn't implement chat directly - it **proxies** to external services:
```python
# In ai_assistant/views.py
response = requests.post(f'{AI_AGENT_URL}/chat', json=data)
```
Check for `BACKEND_API_URL` and `AI_AGENT_URL` environment variables.

### 4. Device Controller Pattern
`light/light_controller.py` implements a sophisticated device management system:
- Connection pooling and caching
- Thread-safe operations
- Automatic discovery via `yeelight` library
- State synchronization between physical devices and Django models

### 5. Logging Standards
Follow `LOGGING_GUIDELINES.md` strictly:
- Use numbered module prefixes: `light_controller_001:`, `api_002:`
- Global step markers: `=== STEP 1: App Init ===`
- ANSI color codes for different data types (blue for IDs, yellow for numbers)
- Only `logger.info()` and `logger.error()` levels

## Environment Configuration

Essential `.env` variables:
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3  # or Postgres
OPENWEATHER_API_KEY=your-api-key
BACKEND_API_URL=http://archie-backend:8002
AI_AGENT_URL=http://archie-ai-agent:8005
```

## App-Specific Knowledge

### Light App (`homeassistant/light/`)
- **Yeelight integration** via `yeelight` Python library
- **Device discovery** through `discover_bulbs()`
- **Models**: `LightDevice`, `LightState`, `LightGroup`, `LightSchedule`
- **API endpoints**: `/light/api/device/{id}/toggle/`, `/light/api/device/{id}/brightness/`

### Weather App (`homeassistant/weather/`)
- **OpenWeatherMap API** integration with 10-minute caching
- **Location**: Hardcoded to Bad Mergentheim, Germany
- **Service pattern**: `WeatherService` class handles API calls and caching

### AI Assistant (`homeassistant/ai_assistant/`)
- **Proxy architecture**: Forwards requests to external AI services
- **Complex UI models**: `UIElements`, `Card`, `NavigationCard` for rich responses
- **Token tracking**: `LllmTrace` model tracks API usage and costs

## Testing & Quality

- Django TestCase classes in each app's `tests.py`
- Run: `poetry run python manage.py test`
- Mock external APIs (e.g., `@patch('requests.get')` for weather service)

## README & Documentation

**NEVER** create documentation, I don't want it.

## Common Gotchas

1. **Database migrations**: Always run `makemigrations` then `migrate` after model changes
2. **Static files**: Use `collectstatic` for production, dev server serves automatically
3. **CORS headers**: AI assistant views manually add CORS for frontend integration
4. **Poetry constraints**: Stick to Python 3.11+ constraint in `pyproject.toml`

## Code Style Guidelines

### Python Standards & Formatting
- Use **PEP8** for all Python code (formatting, naming, imports, etc.)
- Apply code checks from the Makefile immediately after writing code
- Always use **type annotations** for function signatures and variables (except where type is None)
- When formatting a Class, function, or method definition with multiple parameters, place each parameter on a new line for readability
- The same applies to function calls with multiple arguments

### String Formatting & Documentation
- Use **f-strings** for string formatting
- Use `'''` and `"""` for multi-line string literals and docstrings; use `"` for single-line strings only
- Keep docstrings and comments concise: one-liners or short comments only

### Data Models & Type Safety
- Use **Pydantic** (`BaseModel`) for all data models and API schemas
- Avoid using `Any`, `None`, or `Dict` types in models
- Don't check if fields exist in Pydantic models; access them directly
- Use variables of primitive or Pydantic types as parameters instead of Classes, instances, or functions

### Async Programming & Performance
- Prefer **async/await** for all I/O and database operations
- Use parallelism (e.g., `asyncio.gather`) for concurrent tasks

### Code Organization & Architecture
- Organize code by responsibility: endpoints → business logic → data/models
- Prefer minimalistic, simple solutions over complex ones
- Avoid if-elif-elif-else chains; use dictionaries or polymorphism instead
- Don't overengineer: avoid unnecessary abstractions, files, or classes for small tasks
- Use Single Responsibility Principle: each function/class should have one clear purpose
- Do not not follow the DRY principle too strictly; if it's a standard and readable code, it's okay to repeat it
- Use standard, simple verbs for function names (e.g., `get_`, `create_`, `update_`, etc.)
- Use simple english for variable and function names; avoid abbreviations or acronyms
- I prefer following namespace for module names:
    - `app` as the main directory for all application code
    - `main.py` as the entrypoint: a few code lines to start the FastAPI app only.
    - `endpoints.py` for all API routes: facade and minimal architecture.
    - `api_controller.py` for logic that connects endpoints to services (optional). Facade and minimal architecture.
    - `..._tool.py` for utility modules (e.g., `text_tool.py`, `db_tool.py`)
    - `..._service.py` for business logic and service layer (e.g., `user_service.py`, `message_service.py`)
    - `..._utils.py` for helper functions (e.g., `string_utils.py`, `date_utils.py`). Divide utils into classes by responsibility.

### Import Management
- Don't use wildcard imports (`from x import *`)
- Follow import hierarchy: standard library → third-party → local modules:
    ```python
    import os
    from openai import OpenAI
    from .models import User, Message
    ```

### What NOT to Do
- **Don't** use global variables for state or configuration
- **Don't** use print statements for logging (use `logger` only, per logging guidelines)
- **Don't** hardcode values; use config, env vars, or constants
- **Don't** overuse if-checks; prefer exceptions for error handling
- **Don't** divide code with empty lines into sections; keep related code together
- **Don't** use imports inside functions or methods; keep them at the top of the file
- **Don't** use __init__.py files for imports
