---
name: frontend-developer
description: >
  Implement, edit, and analyze frontend code for the Archie Home Assistant
  project — Django templates, static JS/CSS files, UI components, and
  template inheritance. Use this skill when working on HTML templates,
  JavaScript modules, CSS styling, or when the user asks to change how
  something looks or behaves in the browser. Use it even for small UI tweaks.
  Trigger on: "template", "html", "css", "javascript", "js", "frontend",
  "UI", "widget", "sidebar", "chat interface", "dashboard layout",
  "styles", "button", "component", "page", "render".
---

# Frontend Developer — Archie Home Assistant

## Project Frontend Architecture

The frontend is **Django templates + vanilla JavaScript with React via CDN** — no build tool (no webpack/vite).

### Directory Layout

```
homeassistant/
├── webapp/
│   ├── templates/webapp/
│   │   ├── layout.html        # Master layout — base for all pages
│   │   ├── index.html         # Dashboard (extends layout)
│   │   └── login.html
│   └── static/webapp/
│       ├── css/custom.css     # Single global stylesheet
│       └── js/
│           ├── main.js        # Entry point, initializes page
│           ├── globals.js     # Global state (window.* vars)
│           ├── dashboard.js   # Dashboard widget logic
│           ├── dashboard-api.js
│           ├── sidebar.js     # Left sidebar collapse/expand
│           ├── chat.js        # AI chat panel (mounts React)
│           ├── widget.js      # Reusable widget helpers
│           ├── utils.js
│           ├── data.js
│           └── chat/
│               ├── ChatAssistant.js   # Main React component (functional, hooks)
│               ├── api.js             # ChatAPI class — AJAX to /ai-assistant/
│               └── components/
│                   ├── UIElements.js  # Renders AI-returned UIElements/Cards
│                   ├── ChatInput.js   # Message input bar
│                   └── ChartComponent.js
├── light/templates/light/
│   ├── base.html              # Light-app base (extends webapp layout)
│   ├── dashboard.html
│   ├── device_list.html
│   ├── device_detail.html
│   ├── group_list.html
│   └── schedule_list.html
├── weather/templates/weather/weather.html
└── camera/templates/camera/camera.html
```

### Key Technologies

| Technology | Usage |
|------------|-------|
| Django template engine | HTML, `{% block %}`, `{% url %}`, `{% static %}` |
| React 18 (CDN) | Chat assistant UI — `ChatAssistant.js` is a functional component |
| Lucide Icons (CDN) | Icons — call `lucide.createIcons()` after DOM updates |
| Bootstrap (CDN) | Grid, utilities, base components |
| Vanilla JS (ES6+) | Everything outside the chat component |

## Main Process

### 1. Understand the request scope

Before writing code, determine:
- **Template or static file?** Templates live in `*/templates/` and use Django syntax. Static files are in `webapp/static/webapp/`.
- **Which app does this page belong to?** Each app has its own template directory and extends either `webapp/layout.html` or the app's own `base.html`.
- **Is this inside the chat component?** Changes to chat/AI UI go in `chat/ChatAssistant.js` or `chat/components/`.

### 2. Read existing code first

Always read the relevant files before making changes — never guess existing structure:
- For layout changes → read `layout.html`
- For dashboard changes → read `index.html` + `dashboard.js`
- For chat/AI UI → read `ChatAssistant.js` + `UIElements.js`
- For a specific page → find its template with glob `**/{page-name}.html`

### 3. Follow Django template patterns

- All templates extend a base: `{% extends "webapp/layout.html" %}` or `{% extends "light/base.html" %}`
- Static files: always use `{% load static %}` and `{% static 'path/to/file' %}`
- URL links: always use `{% url 'view-name' %}` — never hardcode paths
- Context variables from views are accessed directly: `{{ variable }}`

### 4. JavaScript conventions

- **No modules/imports** — all JS is loaded as global scripts via `<script>` tags in the template
- **React components** are functional with hooks (`useState`, `useEffect`, `useRef`)
- **State that needs to cross JS file boundaries** goes on `window.*` (see `globals.js`)
- After rendering new DOM elements with icons, call `lucide.createIcons()`
- For periodic state sync (e.g., sidebar state), polling with `setInterval` is acceptable (existing pattern)
- Prefer `fetch` for API calls; the `ChatAPI` class handles AI-assistant calls

### 5. CSS conventions

- Single stylesheet: `homeassistant/webapp/static/webapp/css/custom.css`
- Use Bootstrap utility classes first — only add custom CSS for things Bootstrap can't do
- CSS custom properties (`var(--color-*)`) are used for theming — check existing variables before adding new ones
- Class naming: BEM-like, kebab-case (e.g., `.chat-sidebar__header`, `.widget-card--active`)

### 6. Adding a new page

1. Create template in the appropriate app's `templates/<app>/` directory
2. Extend the correct base template
3. Register the URL in `homeassistant/<app>/urls.py`
4. Add the view in `views.py`
5. If new static JS/CSS is needed, add it to `webapp/static/webapp/` and reference with `{% static %}`

### 7. Code style for JavaScript

- Use `const` / `let`, never `var`
- Arrow functions for callbacks
- Template literals for string formatting
- Async/await for fetch calls
- Descriptive variable names — no abbreviations

## Output Format

When implementing frontend changes, always:
1. Show which file(s) you're editing and why
2. Make surgical edits — don't rewrite a whole file for a small change
3. If adding a new `<script>` tag, place it at the end of the `{% block scripts %}` block
4. If a change requires a Django view update (new context variable), mention it explicitly

## Edge Cases

- **Icons not showing after dynamic render** — always call `lucide.createIcons()` after adding new DOM with icon elements
- **Static files not updating in dev** — Django dev server serves static automatically; hard-refresh (`Ctrl+Shift+R`) clears browser cache
- **React component not mounting** — verify the mount target `<div id="...">` exists in the template before `ReactDOM.render()`
- **CSRF for POST requests** — use the `{% csrf_token %}` tag in forms; for fetch, read `document.cookie` for the `csrftoken` value
