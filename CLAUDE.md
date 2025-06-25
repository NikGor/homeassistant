# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack
- **Django 5.2.1** web framework with Python 3.10+
- **Poetry** for dependency management
- **FastAPI** and **OpenAI** libraries for API and AI integration
- **Bootstrap 5.3.0** with custom dark theme CSS
- **SQLite** database

## Development Commands
```bash
# Install dependencies
poetry install

# Run development server
python manage.py runserver

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run Django shell
python manage.py shell
```

## Project Architecture
This is a Django-based home automation dashboard with modular structure:

- **homeassistant/** - Main Django project configuration
- **webapp/** - Primary web interface module with templates and static files
- **api/** - Backend API endpoints (currently scaffolded)
- **lights/** - Light control module with Yeelight integration
- **templates/** - Django templates with tablet-optimized UI
- **static/** - Bootstrap, custom CSS, and JavaScript assets

## Key Features & Implementation
- **8-button control grid** for home automation categories in `webapp/templates/webapp/dashboard.html`
- **Real-time dashboard widgets** for weather and calendar (currently using placeholder data)
- **AI chat interface** positioned at bottom of dashboard
- **Matrix rain animation** using Canvas API in `static/js/matrix-rain.js`
- **Dark theme optimization** with custom CSS in `static/css/styles.css`
- **Touch-friendly responsive design** optimized for tablet displays

## Current Development State
- Frontend UI is complete with mockup data and full functionality
- Backend APIs are scaffolded but require implementation
- Django structure is properly configured with URL routing
- Environment-based configuration using python-dotenv
- Ready for backend development expansion

## Environment Configuration
Create `.env` file in project root with necessary environment variables. The application uses python-dotenv for configuration management.

## Database Models
Currently minimal models in place. Main models are in respective app directories (webapp, api, lights).