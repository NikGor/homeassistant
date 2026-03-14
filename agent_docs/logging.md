# Logging Convention

Use `logger` (not `print()`). Only `logger.info()` and `logger.error()` levels.

```python
logger.info(f"module_001: Description with \033[34m{id}\033[0m")    # Blue — IDs, URLs
logger.info(f"module_002: Count: \033[33m{count}\033[0m")           # Yellow — numbers
logger.error(f"module_error_001: \033[31m{error}\033[0m")           # Red — errors
logger.info("=== STEP 1: App Init ===")                             # Global step markers
```

Prefix format: `module_NNN:` where module is the short name (e.g. `light_controller`, `api`, `weather`).
