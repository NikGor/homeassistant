#!/bin/bash

echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Running migrations..."
poetry run python manage.py makemigrations
poetry run python manage.py migrate

echo "Starting server..."
poetry run python manage.py runserver 0.0.0.0:8000
