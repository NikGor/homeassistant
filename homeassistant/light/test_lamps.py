#!/usr/bin/env python3

from yeelight import Bulb

# IP адреса ламп
lamps = ["192.168.0.35", "192.168.0.226", "192.168.0.20"]

for ip in lamps:
    print(f"\n=== Лампа {ip} ===")
    try:
        bulb = Bulb(ip)
        properties = bulb.get_properties()
        
        print("Свойства:")
        for key, value in properties.items():
            print(f"  {key}: {value}")
            
        # Проверяем доступные команды
        print("\nДоступные методы:")
        methods = [method for method in dir(bulb) if not method.startswith('_') and callable(getattr(bulb, method))]
        for method in sorted(methods):
            if method in ['turn_on', 'turn_off', 'toggle', 'set_brightness', 'set_color_temp', 'set_rgb', 'set_hsv']:
                print(f"  {method}")
                
    except Exception as e:
        print(f"Ошибка подключения: {e}")