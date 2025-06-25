#!/usr/bin/env python3

import sys
import os
sys.path.append('/home/niko/documents/projects/homeassistant')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'homeassistant.settings')

import django
django.setup()

from yeelight import discover_bulbs, Bulb

def scan_network():
    print("Сканирование сети на предмет Yeelight устройств...")
    
    try:
        # Сканируем с большим таймаутом
        discovered = discover_bulbs(timeout=10)
        
        print(f"Найдено {len(discovered)} устройств:")
        
        for i, bulb_info in enumerate(discovered, 1):
            print(f"\n--- Устройство {i} ---")
            print(f"IP: {bulb_info['ip']}")
            print(f"Порт: {bulb_info.get('port', 55443)}")
            
            # Подключаемся и получаем свойства
            try:
                bulb = Bulb(bulb_info['ip'])
                properties = bulb.get_properties()
                
                print(f"Состояние: {'Включено' if properties.get('power') == 'on' else 'Выключено'}")
                print(f"Яркость: {properties.get('bright', 'Н/Д')}%")
                print(f"Температура: {properties.get('ct', 'Н/Д')}K")
                print(f"Модель: {properties.get('model', 'Неизвестно')}")
                print(f"ID: {properties.get('id', 'Неизвестен')}")
                
            except Exception as e:
                print(f"Ошибка подключения к {bulb_info['ip']}: {e}")
    
    except Exception as e:
        print(f"Ошибка сканирования: {e}")

if __name__ == "__main__":
    scan_network()