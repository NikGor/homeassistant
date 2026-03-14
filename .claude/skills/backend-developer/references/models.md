# Models Reference

## Which apps have Django models

| App | Django models | Pydantic models |
|---|---|---|
| `webapp` | `UserProfile` (OneToOne → `User`) | — |
| `light` | `LightDevice`, `LightState`, `LightGroup`, `LightSchedule` | `LightDeviceState`, `LightStateAggregate` |
| `weather` | `WeatherData` | — |
| `ai_assistant` | `Conversation`, `Message` | imported from `archie_shared` |
| `climate`, `camera`, `api`, `voice_assistant` | None | `ClimateDeviceState`, `ClimateStateAggregate` in climate |

## Key field conventions

- **Timestamps**: always `created_at = DateTimeField(auto_now_add=True)` + `updated_at = DateTimeField(auto_now=True)`
- **JSON fields**: `JSONField(default=list)` or `JSONField(default=dict)` — avoid `null=True` on JSON unless explicitly needed
- **PKs**: UUID `CharField` for ai_assistant models; default int PK everywhere else
- **Choices**: defined inline as list of tuples on the field, not as a separate `TextChoices` class
- **OneToOne state**: device state is a separate `*State` model with `OneToOneField` → keeps device registration separate from real-time state

## Pydantic conventions

- Return Pydantic models from services, not raw ORM objects
- Serialise with `.model_dump()` when returning `JsonResponse`
- `archie_shared` is the source of all shared types (`ChatMessage`, UI cards, `LllmTrace` etc.) — never redefine them locally
- Use `Literal[...]` for constrained string fields instead of `Optional[str]`

## Dual-model bridge pattern

Django model carries a `.to_pydantic()` or `.to_chat_message()` method.
Service returns the Pydantic model; view calls `.model_dump()` for JSON.
Redis stores `.model_dump()` output; reads deserialise back to Pydantic via `Model(**data)`.

## Access patterns

- User profile in a view: `request.user.profile`
- Light device state: `device.state` (reverse OneToOne, related_name="state")
- Conversation messages: `conversation.messages.all()` (related_name="messages")
- `UserProfile.sync_to_redis()` is triggered automatically via `post_save` signal — don't call it manually after profile saves
