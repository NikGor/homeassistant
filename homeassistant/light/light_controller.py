from yeelight import Bulb

bulb = Bulb("192.168.0.35")  # замените на свой IP-адрес лампы
print(bulb.get_properties())
