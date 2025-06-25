# Home Assistant Dashboard

[![CI](https://github.com/NikGor/homeassistant/actions/workflows/ci.yml/badge.svg)](https://github.com/NikGor/homeassistant/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)

A modular Django-based smart home dashboard with Yeelight lighting integration, camera support, and a modern tablet-optimized UI.

## Features

- **Tablet-optimized web dashboard** with 8-button control grid
- **Yeelight smart light control** (on/off, brightness, color temp, RGB)
- **Camera module** with live video feed and controls
- **Modular Django apps**: webapp, api, light, camera
- **API endpoints** for device and group control
- **AI chat interface** (OpenAI integration, demo)
- **Matrix rain animation** and custom dark theme
- **Responsive, touch-friendly design**

## Project Structure

```
homeassistant/
├── __init__.py
├── asgi.py
├── settings.py
├── urls.py
├── wsgi.py
├── api/        # API endpoints
├── camera/     # Camera app
├── light/      # Lighting control app
├── webapp/     # Main web interface
├── static/     # Static assets
└── templates/  # Shared templates
```

## Quick Start

1. **Install dependencies:**
   ```bash
   poetry install
   ```
2. **Apply migrations:**
   ```bash
   poetry run python manage.py migrate
   ```
3. **Run development server:**
   ```bash
   poetry run python manage.py runserver
   ```
4. **Access dashboard:**
   Open [http://localhost:8000/](http://localhost:8000/) in your browser.

## Environment Setup

- Copy `.env.example` to `.env` and set your environment variables (SECRET_KEY, DEBUG, etc).
- Uses SQLite by default, can be configured for Postgres via `DATABASE_URL`.

## Main Modules

- **webapp/**: Main dashboard UI, navigation, chat, and widgets
- **light/**: Yeelight device discovery, control, groups, schedules, API
- **camera/**: Camera page, video streaming, camera API
- **api/**: (Scaffold) for future REST/GraphQL endpoints

## Lighting API Examples

- Toggle device: `POST /light/api/device/{id}/toggle/`
- Set brightness: `POST /light/api/device/{id}/brightness/`
- Set color temp: `POST /light/api/device/{id}/temperature/`
- Set RGB: `POST /light/api/device/{id}/rgb/`
- Get status: `GET /light/api/device/{id}/status/`
- All statuses: `GET /light/api/devices/status/`

## Testing

Run all tests:
```bash
poetry run python manage.py test
```

## Tech Stack

- Python 3.10+, Django 5.2.1
- Poetry for dependency management
- Bootstrap 5, custom CSS/JS
- Yeelight Python library
- OpenCV (for camera simulation)
- OpenAI (for chat demo)

## License

MIT License. See LICENSE file for details.
