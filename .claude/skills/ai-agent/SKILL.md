---
name: ai-agent
description: >
  Understand and work with the Archie AI Agent API from the frontend — what /chat and
  /ws_chat return, how to render each response level, how to handle streaming WebSocket
  events, and how to discriminate between button types. Use this skill when building or
  editing UI that consumes AI agent responses, adding rendering logic for a new response
  format or widget type, or debugging what the frontend receives from the AI agent.
  Trigger on: "ai agent", "/chat", "ws_chat", "response format", "level2_answer",
  "level3_answer", "ui_answer", "ChatRequest", "ChatMessage", "AssistantButton",
  "FrontendButton", "widget response", "streaming chat", "pipeline steps", "render ai".
---

# AI Agent — Frontend Integration Skill

## Schema Sources (always canonical)

- **Swagger UI**: `http://localhost:8005/docs` — live, always in sync with the running service
- **Pydantic models**: `archie-shared/` — source of truth for `ChatRequest`, `ChatMessage`, `Content`, all widget and card types, button types

Do not duplicate or memorise schemas here. Check Swagger when you need exact field names, types, or required fields.

---

## Transports

| Transport | Endpoint | Use for |
|---|---|---|
| HTTP POST | `/chat` | Backend proxy calls, title generation, system calls |
| WebSocket | `/ws_chat` | User-facing chat UI — streams intermediate status, then the final result |

Frontend key files:
- `homeassistant/webapp/static/webapp/js/chat/ChatAssistant.js` — existing WS client implementation

---

## Response Levels — how to decide what to render

The `content_format` field on `ChatMessage.content` tells the frontend which rendering branch to take:

| `content_format` | Active field on `content` | Renders as |
|---|---|---|
| `plain` / `markdown` / `html` | `content.text` | Plain text or formatted text block |
| `level2_answer` | `content.level2_answer` | Text block + quick-action buttons bar |
| `level3_answer` | `content.level3_answer` | Text block + inline widget + quick-action buttons |
| `ui_answer` | `content.ui_answer` | Ordered list of UI components (cards, tables, charts, forms, images) + buttons |
| `dashboard` | `content.dashboard` | Full dashboard tile grid |
| `widget` | `content.widget` | Standalone widget (no text) |

For `ui_answer`, each item in `ui_answer.items` has a `type` field:
`text_answer` | `card_grid` | `table` | `chart` | `image` | `event_form` | `email_form` | `note_form`

Render each item according to its `type`; the `layout_hint` and `spacing` fields control visual placement.

---

## Button Discriminator

Buttons appear in `quick_action_buttons.buttons[]` and in card `buttons[]`.
Always check the `type` field to decide how to handle a click:

| `type` | Action on click |
|---|---|
| `"assistant_button"` | Send `assistant_request` (string) as a new message to the AI agent |
| `"frontend_button"` | Execute `command` locally in the frontend (navigate, call, open map, etc.) |

The full list of `command` values for `FrontendButton` is in `archie-shared` / Swagger under `FrontendButton.command`.

---

## WebSocket Streaming Protocol (`/ws_chat`)

Send the `ChatRequest` payload as JSON on `ws.onopen`. The server then pushes a sequence of messages:

```
{ "type": "status", "step": "<step_name>", "status": "running", "message": "<human label>" }
  ... one or more status updates ...
{ "type": "final", "data": { <ChatMessage> } }
```

On error:
```
{ "type": "error", "message": "<error text>" }
```

- `status` messages → show loading indicator / pipeline step label
- `final` → `msg.data` is the full `ChatMessage` — pass it to the normal rendering pipeline
- `error` → show error state, close the connection

The WebSocket is one-shot per message: open → send → receive events → close.

