from django.shortcuts import render
from django.views import View
from homeassistant.weather.services import WeatherService

class IndexView(View):
    def get(self, request):
        # Получаем данные о погоде для главной страницы
        weather_service = WeatherService()
        weather_data = weather_service.get_bad_mergentheim_weather()
        forecast_data = weather_service.get_bad_mergentheim_forecast()
        
        context = {
            'weather': weather_data,
            'forecast': forecast_data
        }
        
        return render(request, 'webapp/index.html', context)
