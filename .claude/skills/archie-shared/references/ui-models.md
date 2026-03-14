# UI Models Reference

## Response level hierarchy

The AI agent returns `Content` — the root type wrapping the message payload.
`content_format` tells the frontend which field to read:

| Level | `content_format` | Field on `Content` | When to use |
|---|---|---|---|
| 1 | `plain` / `markdown` / `html` etc. | `text: str` | Simple text, code, raw formats |
| 2 | `level2_answer` | `level2_answer: Level2Answer` | Text + quick action buttons |
| 3 | `level3_answer` | `level3_answer: Level3Answer` | Text + inline widget + quick actions |
| 4 | `ui_answer` | `ui_answer: UIAnswer` | Full generative UI (cards, tables, charts) |
| — | `dashboard` | `dashboard: Dashboard` | Smart home dashboard (tile-only UI, no text input) |
| — | `widget` | `widget: <WidgetType>` | Standalone widget without text |

Always set `content_format` to match the populated field.

---

## Button types

| Type | `type` discriminator | Use when |
|---|---|---|
| `AssistantButton` | `"assistant_button"` | Click triggers AI agent with `assistant_request` text |
| `FrontendButton` | `"frontend_button"` | Click triggers a frontend `command` (navigate, open map, call, etc.) |

`FrontendButton.command` options: `navigate_to`, `open_map`, `call`, `email`, `message`,
`show_details`, `export_to_notes`, `export_to_calendar`, `open_on_youtube_video`,
`open_on_youtube_music`, `url_to`, `check_amazon`

Buttons are always `List[Union[FrontendButton, AssistantButton]]`.
Max 3 buttons per card; max 2-3 for quick actions.

---

## Card types (used inside `CardGrid`)

| Type | `type` discriminator | Use when |
|---|---|---|
| `Card` | `"card"` | General content; title + text + image + buttons |
| `LocationCard` | `"location_card"` | Physical places, addresses, venues — always add `open_map` FrontendButton |
| `ProductCard` | `"product_card"` | Physical/digital products with price, rating, specs |
| `MovieCard` | `"movie_card"` | Films — always add `open_on_youtube_video` FrontendButton |
| `SeriesCard` | `"series_card"` | TV shows/series |
| `MusicCard` | `"music_card"` | Tracks/artists/albums — always add `open_on_youtube_music` FrontendButton |
| `ArticleCard` | `"article_card"` | News/blog posts — always add `export_to_notes` FrontendButton |
| `DocumentCard` | `"document_card"` | Document search results with filename, snippet, relevance score |
| `ShoppingListCard` | `"shopping_list_card"` | Grocery/shopping lists grouped by department |
| `WeatherCard` | `"weather_card"` | Weather queries — ALWAYS use this, never a generic Card |
| `ContactCard` | `"contact_card"` | People/organisations with call/email/message buttons |

Cards are grouped in `CardGrid(grid_dimensions, cards)`.
`grid_dimensions`: `"1_column"` for a single card, `"2_columns"` for two or more.

---

## Standalone components (used in `UIAnswer.items` as `AdvancedAnswerItem`)

| `AdvancedAnswerItem.type` | `content` type | Use when |
|---|---|---|
| `"text_answer"` | `TextAnswer` | Body text (markdown, plain, html, voice) |
| `"card_grid"` | `CardGrid` | Grid of cards |
| `"table"` | `Table` | Structured comparison data |
| `"chart"` | `Chart` | Data visualisation (Chart.js config) |
| `"image"` | `Image` | AI-generated image prompt |
| `"event_form"` | `EventForm` | Calendar event creation |
| `"email_form"` | `EmailForm` | Email composition |
| `"note_form"` | `InternalNoteForm` | Note saving |

---

## Widget types (used in `Level3Answer.widget` or standalone `Content.widget`)

| Type | `type` discriminator | Purpose |
|---|---|---|
| `LightWidget` | `"light_widget"` | Light device list + on/off counts + quick actions |
| `ClimateWidget` | `"climate_widget"` | Radiators, sensors, avg temp/humidity |
| `FootballWidget` | `"football_widget"` | Match info + league table (two tabs) |
| `MusicWidget` | `"music_widget"` | Playback state + playlist |
| `DocumentsWidget` | `"documents_widget"` | Document archive search results |
| `Widget` | (generic) | Placeholder for future types |

---

## Dashboard

`Dashboard` is a special full-screen tile-based UI — it replaces the chat interface entirely.
Six fixed tiles: `light`, `climate`, `music`, `documents`, `apps`, `settings`.
Each tile is a `DashboardTileState` with title, subtitle, icon, status_color,
optional `devices: List[DeviceIcon]`, and optional `quick_actions: List[AssistantButton]`.
There is no text input in Dashboard mode — users interact only via `AssistantButton` clicks.

---

## Adding a new UI type

1. Add the new model to `archie_shared/ui/models.py`
2. If it's a card → add it to `CardGrid.cards: List[Union[...]]`
3. If it's a widget → add it to `Level3Answer.widget`, `Content.widget`, and `Level3Answer`'s Union
4. If it's a standalone item → add to `AdvancedAnswerItem.type` Literal and `AdvancedAnswerItem.content` Union
5. Bump version in `pyproject.toml`
