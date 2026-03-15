# Chat & User Models Reference

## ChatMessage

The core unit of a conversation.

Key fields:
- `role` — `"user" | "assistant" | "system"`
- `content: Content` — structured message payload (see ui-models.md for Content)
- `message_id`, `conversation_id`, `previous_message_id` — threading
- `llm_trace: Optional[LllmTrace]` — token counts and cost for this message
- `pipeline_trace: Optional[PipelineTrace]` — per-stage timing from AI agent
- `pipeline_steps: list[PipelineStep]` — ordered step timing records

---

## Conversation

Aggregates messages with token/cost totals.

Key fields:
- `conversation_id: str` — UUID string, primary key
- `title: str` — auto-generated or user-set
- `messages: Optional[List[ChatMessage]]`
- `total_input_tokens`, `total_output_tokens`, `total_tokens`, `total_cost` — accumulated
- On `__init__`, if `messages` are provided, `llm_trace` is auto-calculated via `calculate_conversation_llm_trace()`

---

## ChatRequest

What the frontend sends to the AI agent.

Key fields:
- `user_name: Optional[str]` — identifies Redis user state
- `input: str` — the user's message text
- `response_format` — tells the agent what output format to produce:
  `plain | markdown | html | ssml | json | csv | xml | yaml | prompt | python | bash | sql | regex | dockerfile | makefile | level2_answer | level3_answer | ui_answer | dashboard | widget`
- `conversation_id`, `previous_message_id` — threading
- `chat_history: Optional[str]` — YAML-serialised prior messages for context
- `demo_mode: bool` — skip real API calls
- `no_image: bool` — skip image generation (faster, cheaper)
- `command_model`, `final_output_model` — override LLM model per stage

---

## LLM trace hierarchy

```
LllmTrace
  ├── model: str
  ├── input_tokens: int
  ├── input_tokens_details: InputTokensDetails
  │     └── cached_tokens: int
  ├── output_tokens: int
  ├── output_tokens_details: OutputTokensDetails
  │     └── reasoning_tokens: int
  ├── total_tokens: int
  └── total_cost: float

StepTrace
  ├── duration_ms: int
  └── llm_trace: Optional[LllmTrace]

PipelineTrace
  ├── command_call: Optional[StepTrace]    # command call
  ├── tool_execution: Optional[StepTrace]  # tool execution
  ├── create_output: Optional[StepTrace]   # output generation
  └── total_ms: int
```

`calculate_conversation_llm_trace(messages)` in `chat/utils.py` sums traces
from all messages in a conversation into a single `LllmTrace`.

---

## ConversationRequest / ConversationResponse / MessageResponse

Simple CRUD protocol types for conversation management endpoints.
`ConversationRequest` — create a conversation (optional `conversation_id`, optional `title`).
`ConversationResponse` — returns `conversation_id`, `title`, `created_at`.
`MessageResponse` — returns `message_id`, `conversation_id`, `created_at`.

---

## ChatHistoryMessage / ChatHistoryResponse

Simplified read-only message types for returning history to the frontend.
`ChatHistoryMessage` has only `role` + `content` — no IDs or traces.

---

## UserState

Stored in Redis under key `user_state:name:{user_name}`.
Read/written by `redis_client` in the Django app.

Key fields:
- `user_id`, `user_name`
- Preferences: `persona`, `language`, `currency`, `measurement_units`, `user_timezone`, etc.
- Location: `default_city`, `default_country`
- Time: `current_date`, `current_time`, `current_weekday` — auto-updated by `redis_client.get_user_state_by_name()`
- Smart home state (serialised from Pydantic): `smarthome_light`, `smarthome_climate`, `smarthome_dashboard`

`UserState` is the primary context object the AI agent reads to personalise responses.
All fields are `Optional` — the agent must handle missing fields gracefully.
