# Services & State Reference

## Service layer pattern

Each app has a `services.py` with a `*Service` class that:
1. Fetches state from devices or external APIs
2. Returns a Pydantic aggregate model
3. Exposes `save_to_redis(user_name: str)` for the polling command

Services are instantiated per-request — no singletons, no shared mutable state in service instances.

```
service = LightStateService()
state = service.get_all_devices_state()   # → LightStateAggregate (Pydantic)
service.save_to_redis("Niko")             # writes to Redis user_state
```

When adding a new device type, add a `save_to_redis()` call in `webapp/management/commands/poll_devices.py` too — otherwise the dashboard won't reflect the new device.

## WeatherService caching strategy

Three-level cache (check in order):
1. Django cache (10 min TTL)
2. `WeatherData` database row (if < 10 min old)
3. OpenWeatherMap API call → save to DB + cache

When implementing similar data-fetching services, follow this same layered pattern.

## Redis state

**Singleton**: `from homeassistant.redis_client import redis_client`

**Key format**: `user_state:name:{user_name}`

Useful methods on `redis_client`:
- `get_user_state_by_name(user_name)` → `UserState | None` (auto-updates current datetime)
- `set_user_state(user_name, state, ttl=None)`
- `update_user_state(user_name, updates: dict)` — partial update, merges into existing state
- `get_user_field(user_name, field)` / `set_user_field(user_name, field, value)`
- `ping()` — use this to check Redis availability; handle `False` gracefully

Always handle Redis being unavailable — `get_user_state_by_name` can return `None`. Return a degraded response, not a 500.

## LightController (`light/light_controller.py`)

Global singleton: `light_controller = LightController()`

Wraps Yeelight device discovery and connection pooling. Use it in `LightStateService` rather than instantiating `Bulb(ip)` directly in views.

## Device controller pattern

For new device types, mirror the light app:
- `YeelightDevice` class wraps the device SDK → exposes `connect()`, `toggle()`, `set_brightness()` etc.
- All device I/O goes through a controller/service class, never directly in views
- Errors raise custom exceptions from `<app>/exceptions.py`: `DeviceConnectionError`, `DeviceOperationError`

## Custom exceptions

`light/exceptions.py` defines `DeviceError` (base), `DeviceConnectionError`, `DeviceOperationError`.
Create a matching `exceptions.py` in any new device app. Catch these in views and return appropriate `JsonResponse` errors.
