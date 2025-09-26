from django.urls import path
from .views import WeatherView, WeatherAPIView

app_name = 'weather'

urlpatterns = [
    path('', WeatherView.as_view(), name='weather'),
    path('api/', WeatherAPIView.as_view(), name='weather_api'),
]
