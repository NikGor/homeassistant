.PHONY: run install migrate shell superuser

# Run development server
run:
	poetry run python manage.py runserver

# Install dependencies
install:
	poetry install

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