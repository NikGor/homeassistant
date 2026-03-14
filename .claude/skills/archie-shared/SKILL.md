---
name: archie-shared
description: >
  Add, edit, or use Pydantic models from the archie-shared local package —
  chat protocol types, UI components (cards, widgets, response levels),
  and user state. Use this skill when touching any model in archie-shared/,
  when deciding which card or widget type to return from the AI agent,
  or when the AI agent or Django app needs a new shared type.
  Trigger on: "archie-shared", "archie_shared", "shared model", "shared type",
  "ChatMessage", "Conversation", "UIAnswer", "LightWidget", "ClimateWidget",
  "Card", "CardGrid", "Level2Answer", "Level3Answer", "Dashboard", "Content",
  "UserState", "AssistantButton", "FrontendButton", "response level".
---

# archie-shared — Shared Pydantic Models

`archie-shared` is a local editable Python package that contains all Pydantic models
shared across Archie services (Django homeassistant + AI Agent).

## Package Structure

```
archie-shared/
├── archie_shared/
│   ├── chat/
│   │   ├── models.py    # Chat protocol: ChatMessage, Conversation, ChatRequest,
│   │   │                #   LllmTrace, PipelineTrace, ConversationResponse, etc.
│   │   └── utils.py     # calculate_conversation_llm_trace()
│   ├── ui/
│   │   └── models.py    # All UI components: buttons, cards, widgets, response levels,
│   │                    #   Content (the root message content type)
│   └── user/
│       └── models.py    # UserState — Redis user state shared across all services
└── pyproject.toml       # version = "0.1.x" — bump on every release
```

## When to add a model here

Add to `archie-shared` if:
- The type is used by **both** Django homeassistant and the AI Agent service
- The type is part of the **chat protocol** (request/response/message format)
- The type is a **UI component** the AI agent returns and the frontend renders

Keep in the Django app if:
- The model is only used internally by one app (e.g., `LightDevice` ORM model)
- The model wraps Django ORM concepts (foreign keys, querysets)

## How to import

```python
# Chat protocol
from archie_shared.chat.models import ChatMessage, Conversation, ChatRequest, LllmTrace

# UI components
from archie_shared.ui.models import Content, Level3Answer, LightWidget, AssistantButton

# User state
from archie_shared.user.models import UserState
```

No re-exports via `__init__.py` — always import from the submodule directly.

## Development workflow

The package is installed as editable (`develop = true` in `pyproject.toml`).
Changes to `.py` files are live immediately — no reinstall needed.

After adding or changing models:
1. Bump the version in `archie-shared/pyproject.toml` (increment patch: `0.1.x` → `0.1.x+1`)
2. Commit and push the changes
3. Run `make bump` to publish the new version

```bash
# Example release flow
# 1. Edit models
# 2. Bump version in archie-shared/pyproject.toml
# 3. git add -p && git commit && git push
make bump
```

No migrations needed — this is pure Pydantic, no database.

## Model conventions

- All models extend `pydantic.BaseModel`
- Every field has a `Field(description=...)` — required, not optional
- Use `Literal[...]` for constrained strings, never bare `str` with a comment
- `Optional[X]` fields always get `default=None` or `default_factory=`
- No `Any` types — be explicit
- `type` discriminator fields use `Literal["exact_value"] = Field("exact_value", ...)` pattern
  so Union members are discriminated automatically by the frontend

## References — when to load

| Reference | Load when |
|---|---|
| `references/ui-models.md` | Choosing which card/widget/response level to use; adding new UI types |
| `references/chat-models.md` | Working with message/conversation protocol; LLM trace tracking |
