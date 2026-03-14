# Views Reference

## View types in use

| Type | When to use | Example |
|---|---|---|
| `View` (CBV) | Any request needing custom logic, multiple methods | Most API endpoints, page views |
| `TemplateView` | Simple HTML render with static context | Rarely used — most pages need dynamic context |
| FBV with decorators | Simple single-method endpoints | `logout_view`, profile helpers |

## Mandatory decorators

**Page views (return HTML):**
```
@method_decorator(login_required, name="dispatch")
```

**JSON API views (return JsonResponse):**
```
@method_decorator(csrf_exempt, name="dispatch")
```

Never mix — CSRF-exempt views must not render sensitive HTML, and page views must never skip authentication.

For FBVs use `@login_required` / `@csrf_exempt` directly on the function.

## Response types

- HTML pages → `render(request, "app/template.html", context)`
- JSON success → `JsonResponse(pydantic_model.model_dump())`
- JSON error → `JsonResponse({"error": "message"}, status=4xx)`
- Streaming → `StreamingHttpResponse(generator)` (e.g. file download)

## Standard HTTP status codes

| Situation | Status |
|---|---|
| Bad or missing input | 400 |
| Not found | 404 |
| Internal failure | 500 |
| External service unavailable | 503 |

## Request body parsing

JSON body: `data = json.loads(request.body)`
Query params: `request.GET.get("key")`
Form data: `request.POST.get("key")`

## File structure

- Page views → `<app>/views.py`
- JSON API views → `<app>/api_views.py` (light app convention)
- Both patterns exist — follow whichever the app already uses

## Common mistakes to avoid

- Don't return a raw `dict` with unchecked fields — always go through Pydantic first
- Don't add `@login_required` to API views called from JS — they'll silently redirect instead of returning 401
- Don't forget `json.loads(request.body)` — `request.POST` is empty for `application/json` requests
