from django.apps import AppConfig


class LightConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'homeassistant.light'
    verbose_name = 'Управление освещением'