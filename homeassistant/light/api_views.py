from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
import logging

from .services import YeelightDevice
from .exceptions import DeviceError
from .light_controller import light_controller

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class DeviceToggleAPIView(View):
    def post(self, request, device_id, *args, **kwargs):
        ip_suffix = device_id.split('_')[-1]
        ip = f"192.168.0.{ip_suffix}"
        device = YeelightDevice(ip)

        try:
            new_state = device.toggle()
            message = f'Лампа {ip} включена' if new_state else f'Лампа {ip} выключена'
            return JsonResponse({'success': True, 'is_on': new_state, 'message': message})
        except DeviceError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class DeviceBrightnessAPIView(View):
    def post(self, request, device_id, *args, **kwargs):
        data = json.loads(request.body)
        brightness = int(data.get('brightness', 50))

        if not 1 <= brightness <= 100:
            return JsonResponse({'success': False, 'message': 'Яркость должна быть от 1 до 100'}, status=400)

        ip_suffix = device_id.split('_')[-1]
        ip = f"192.168.0.{ip_suffix}"
        device = YeelightDevice(ip)

        try:
            device.set_brightness(brightness)
            return JsonResponse({'success': True, 'brightness': brightness, 'message': f'Яркость лампы {ip} установлена на {brightness}%'})
        except DeviceError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class DeviceColorTempAPIView(View):
    def post(self, request, device_id, *args, **kwargs):
        data = json.loads(request.body)
        temp = int(data.get('temperature', 4000))

        if not 1700 <= temp <= 6500:
            return JsonResponse({'success': False, 'message': 'Температура должна быть от 1700K до 6500K'}, status=400)

        ip_suffix = device_id.split('_')[-1]
        ip = f"192.168.0.{ip_suffix}"
        device = YeelightDevice(ip)

        try:
            device.set_color_temp(temp)
            return JsonResponse({'success': True, 'temperature': temp, 'message': f'Температура лампы {ip} установлена на {temp}K'})
        except DeviceError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class DeviceRGBColorAPIView(View):
    def post(self, request, device_id, *args, **kwargs):
        data = json.loads(request.body)
        red = int(data.get('red', 255))
        green = int(data.get('green', 255))
        blue = int(data.get('blue', 255))

        if not all(0 <= c <= 255 for c in [red, green, blue]):
            return JsonResponse({'success': False, 'message': 'RGB значения должны быть от 0 до 255'}, status=400)

        ip_suffix = device_id.split('_')[-1]
        ip = f"192.168.0.{ip_suffix}"
        device = YeelightDevice(ip)

        try:
            device.set_rgb(red, green, blue)
            return JsonResponse({'success': True, 'rgb': {'red': red, 'green': green, 'blue': blue}, 'message': f'RGB цвет лампы {ip} установлен'})
        except DeviceError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


class DeviceStatusAPIView(View):
    def get(self, request, device_id, *args, **kwargs):
        device = light_controller.get_device(device_id)
        if not device:
            return JsonResponse({'success': False, 'message': 'Устройство не найдено'}, status=404)

        device.update_properties()
        return JsonResponse({
            'success': True,
            'device_id': device_id,
            'name': device.name,
            'ip': device.ip,
            'model': device.model,
            'state': {
                'is_on': device.is_on,
                'brightness': device.brightness,
                'color_temp': device.color_temp,
                'rgb_color': device.rgb_color,
            },
            'properties': device.properties
        })


class AllDevicesStatusAPIView(View):
    def get(self, request, *args, **kwargs):
        devices = light_controller.get_all_devices()
        light_controller.refresh_devices()
        devices_data = [{
            'id': device.id,
            'name': device.name,
            'ip': device.ip,
            'model': device.model,
            'is_on': device.is_on,
            'brightness': device.brightness,
            'color_temp': device.color_temp,
            'rgb_color': device.rgb_color,
            'last_seen': device.last_seen
        } for device in devices]

        return JsonResponse({'success': True, 'devices': devices_data, 'total_count': len(devices)})


class ScanDevicesView(View):
    def get(self, request, *args, **kwargs):
        try:
            discovered = light_controller.discover_devices(timeout=5)
            return JsonResponse({
                'success': True,
                'discovered_count': len(discovered),
                'devices': [
                    {
                        'id': device.id,
                        'name': device.name,
                        'ip': device.ip,
                        'model': device.model,
                        'is_on': device.is_on
                    }
                    for device in discovered
                ]
            })
        except Exception as e:
            logger.error(f"Error in ScanDevicesView.get: {e}")
            return JsonResponse({
                'success': False,
                'message': f'Ошибка сканирования устройств: {str(e)}'
            }, status=500)
