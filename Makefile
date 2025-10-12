.PHONY: run install install-voice migrate shell superuser voice bump-archie-shared

# Run development server
run:
	poetry run python manage.py runserver

# Install dependencies
install:
	poetry install

# Install voice dependencies (for local voice assistant)
install-voice:
	poetry install --with voice

# Run database migrations
migrate:
	poetry run python manage.py makemigrations
	poetry run python manage.py migrate

# Open Django shell
shell:
	poetry run python manage.py shell

# Create superuser
superuser:
	poetry run python manage.py createsuperuser

# Start voice assistant (wake word detection)
voice:
	poetry run python manage.py start_voice_assistant

# Bump archie-shared version and commit (usage: make bump-archie-shared VERSION=0.1.2)
bump-archie-shared:
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION is required. Usage: make bump-archie-shared VERSION=0.1.2"; \
		exit 1; \
	fi
	@echo "Updating archie-shared version to $(VERSION)..."
	@sed -i 's/version = "[^"]*"/version = "$(VERSION)"/' archie-shared/pyproject.toml
	@git add archie-shared/pyproject.toml
	@git commit -m "bump archie-shared version to v$(VERSION)"
	@echo "Version updated to $(VERSION) and committed. Push to trigger auto-tagging:"
	@echo "git push origin main"

# Create and push git tag from current archie-shared version
bump:
	@VERSION=$$(grep '^version = ' archie-shared/pyproject.toml | sed 's/version = "\(.*\)"/\1/'); \
	echo "Creating tag v$$VERSION from archie-shared version..."; \
	git tag "v$$VERSION" || (echo "Tag v$$VERSION already exists" && exit 1); \
	git push origin "v$$VERSION"; \
	echo "Tag v$$VERSION created and pushed successfully!"