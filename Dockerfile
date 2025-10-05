FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --upgrade pip && pip install poetry

# Copy Poetry files and archie-shared dependency
COPY pyproject.toml poetry.lock ./
COPY archie-shared/ ./archie-shared/

# Install dependencies via Poetry
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY . .

EXPOSE 8000

# Create a startup script to run migrations and start server
RUN echo '#!/bin/bash\nset -e\necho "Running migrations..."\npython manage.py migrate\necho "Starting Django server..."\npython manage.py runserver 0.0.0.0:8000' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
