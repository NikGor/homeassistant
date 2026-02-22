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

# Install Poetry with increased pip timeout
RUN pip install --upgrade pip && \
    pip install poetry --timeout 100

# Copy Poetry files and archie-shared dependency
COPY pyproject.toml poetry.lock ./
COPY archie-shared/ ./archie-shared/

# Configure Poetry: no venv, limit workers, increase timeout
RUN poetry config virtualenvs.create false && \
    poetry config installer.max-workers 10

# Install dependencies with retries (3 attempts total)
RUN for i in 1 2 3; do \
        echo "Attempt $i: Installing dependencies..." && \
        poetry install --no-interaction --no-ansi --no-root --without voice && exit 0 || \
        { echo "Attempt $i failed, retrying in 5s..."; sleep 5; }; \
    done && exit 1

# Copy application code
COPY . .

EXPOSE 8000

# Create a startup script to run migrations, start polling, and start server
RUN echo '#!/bin/bash\nset -e\necho "Running migrations..."\npython manage.py migrate\necho "Starting device polling service in background..."\npython manage.py poll_devices &\necho "Starting Django server..."\npython manage.py runserver 0.0.0.0:8000' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
