---
description: Safely apply Django migrations after model changes
disable-model-invocation: true
---

Run after any changes to Django models:

1. **Check for pending changes** (dry run):
   `poetry run python manage.py makemigrations --check`

2. **Generate migration files**:
   `poetry run python manage.py makemigrations`

3. **Review generated migration** — open the new file in `migrations/`, verify it matches the intended model change.

4. **Apply migrations**:
   `poetry run python manage.py migrate`

5. **Verify**:
   `poetry run python manage.py showmigrations`

If migration conflicts arise (multiple heads): `poetry run python manage.py migrate --run-syncdb` or merge via `poetry run python manage.py makemigrations --merge`.
