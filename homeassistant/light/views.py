from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.generic import TemplateView, ListView, DetailView
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging

from .light_controller import light_controller
from .models import LightDevice

logger = logging.getLogger(__name__)


class LightDashboardView(TemplateView):
    template_name = 'light/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        lamp_ips = ["192.168.0.35", "192.168.0.226", "192.168.0.20"]
        devices = []
        
        for ip in lamp_ips:
            try:
                from yeelight import Bulb
                bulb = Bulb(ip)
                properties = bulb.get_properties()
                
                from .light_controller import YeelightDevice
                device = YeelightDevice(ip, properties=properties)
                device.name = f"Yeelight {ip.split('.')[-1]}"
                device.id = f"Yeelight_{ip.split('.')[-1]}"
                devices.append(device)
                
            except Exception as e:
                logger.error(f"Error connecting to {ip}: {e}")
                try:
                    from .light_controller import YeelightDevice
                    device = YeelightDevice(ip, properties={
                        'power': 'off', 'bright': 0, 'ct': 4000, 'rgb': 0
                    })
                    device.name = f"Yeelight {ip.split('.')[-1]} (unavailable)"
                    device.id = f"Yeelight_{ip.split('.')[-1]}"
                    device._connected = False
                    devices.append(device)
                except Exception as inner_e:
                    logger.error(f"Error creating fallback device for {ip}: {inner_e}")
        
        try:
            context.update({
                'devices': devices,
                'discovered_count': len([d for d in devices if getattr(d, '_connected', True)]),
                'total_devices': len(devices),
                'page_title': 'Управление освещением'
            })
        except Exception as e:
            logger.error(f"Error updating context in LightDashboardView: {e}")
        return context


class DeviceListView(TemplateView):
    template_name = 'light/device_list.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            light_controller.discover_devices(timeout=3)
            devices = light_controller.get_all_devices()
            context.update({
                'devices': devices,
                'page_title': 'Найденные устройства Yeelight'
            })
        except Exception as e:
            logger.error(f"Error in DeviceListView.get_context_data: {e}")
            context['devices'] = []
            context['page_title'] = 'Ошибка получения устройств'
        return context


class DeviceDetailView(TemplateView):
    template_name = 'light/device_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        device_id = kwargs.get('device_id')
        try:
            device = light_controller.get_device(device_id)
            if not device:
                context['error'] = 'Устройство не найдено'
                return context
            device.update_properties()
            context.update({
                'device': device,
                'page_title': f'Устройство: {device.name}'
            })
        except Exception as e:
            logger.error(f"Error in DeviceDetailView.get_context_data: {e}")
            context['error'] = 'Ошибка получения информации об устройстве'
        return context


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


# API Views были перенесены в api_views.py

class LightControlMixin:
    def get_device_by_id(self, device_id):
        return light_controller.get_device(device_id)
    
    def extract_ip_from_device_id(self, device_id):
        ip_suffix = device_id.split('_')[-1]
        return f"192.168.0.{ip_suffix}"
    
    def create_bulb_instance(self, ip):
        from yeelight import Bulb
        return Bulb(ip)


class DeviceToggleAPIViewWithMixin(LightControlMixin, View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request, device_id, *args, **kwargs):
        try:
            ip = self.extract_ip_from_device_id(device_id)
            bulb = self.create_bulb_instance(ip)
            
            properties = bulb.get_properties()
            current_state = properties.get('power') == 'on'
            
            if current_state:
                bulb.turn_off()
                new_state = False
                message = f'Лампа {ip} выключена'
            else:
                bulb.turn_on()
                new_state = True
                message = f'Лампа {ip} включена'
            
            return JsonResponse({
                'success': True,
                'is_on': new_state,
                'message': message
            })
                
        except Exception as e:
            logger.error(f"Ошибка в device toggle: {e}")
            return JsonResponse({
                'success': False,
                'message': f'Ошибка управления устройством {device_id}: {str(e)}'
            }, status=500)
