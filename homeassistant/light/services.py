from abc import ABC, abstractmethod
from yeelight import Bulb
import logging

logger = logging.getLogger(__name__)


class DeviceInterface(ABC):
    @abstractmethod
    def get_properties(self):
        pass

    @abstractmethod
    def toggle(self):
        pass

    @abstractmethod
    def set_brightness(self, brightness: int):
        pass

    @abstractmethod
    def set_color_temp(self, temperature: int):
        pass

    @abstractmethod
    def set_rgb(self, red: int, green: int, blue: int):
        pass


class YeelightDevice(DeviceInterface):
    def __init__(self, ip: str):
        self.ip = ip
        self.bulb = Bulb(ip)

    def get_properties(self):
        try:
            return self.bulb.get_properties()
        except Exception as e:
            logger.error(f"Error getting properties from {self.ip}: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def toggle(self):
        properties = self.get_properties()
        
        # Check if get_properties returned an error
        if isinstance(properties, dict) and not properties.get('success', True):
            logger.error(f"Error toggling device {self.ip}: {properties.get('error')}")
            return {
                "success": False,
                "error": properties.get('error')
            }
        
        try:
            current_state = properties.get('power') == 'on'
            if current_state:
                self.bulb.turn_off()
            else:
                self.bulb.turn_on()
            return not current_state
        except Exception as e:
            logger.error(f"Error toggling device {self.ip}: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def set_brightness(self, brightness: int):
        try:
            self.bulb.set_brightness(brightness)
        except Exception as e:
            logger.error(f"Error setting brightness for {self.ip}: {e}")
            raise

    def set_color_temp(self, temperature: int):
        try:
            self.bulb.set_color_temp(temperature)
        except Exception as e:
            logger.error(f"Error setting color temperature for {self.ip}: {e}")
            raise

    def set_rgb(self, red: int, green: int, blue: int):
        try:
            self.bulb.set_rgb(red, green, blue)
        except Exception as e:
            logger.error(f"Error setting RGB color for {self.ip}: {e}")
            raise
