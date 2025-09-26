from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from django.contrib import messages
from .services import WeatherService
import logging

logger = logging.getLogger(__name__)


class WeatherView(View):
    """View for displaying weather information"""
    
    def get(self, request):
        weather_service = WeatherService()
        weather_data = weather_service.get_bad_mergentheim_weather()
        
        context = {
            'weather': weather_data,
            'city_name': 'Bad Mergentheim',
            'country_name': 'Germany'
        }
        
        if not weather_data:
            messages.warning(
                request, 
                "Не удалось получить данные о погоде. Проверьте настройки API ключа."
            )
        
        return render(request, 'weather/weather.html', context)


class WeatherAPIView(View):
    """API view for weather data (JSON response)"""
    
    def get(self, request):
        weather_service = WeatherService()
        weather_data = weather_service.get_bad_mergentheim_weather()
        
        if weather_data:
            return JsonResponse({
                'success': True,
                'data': weather_data
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Unable to fetch weather data'
            }, status=503)
