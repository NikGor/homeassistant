import logging
from abc import ABC, abstractmethod

from yeelight import Bulb

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
            logger.error(
                f"light_services_001: \033[31mError getting properties from \033[36m{self.ip}\033[31m: {str(e)}\033[0m"
            )
            return {"success": False, "error": str(e)}

    def toggle(self):
        properties = self.get_properties()

        # Check if get_properties returned an error
        if isinstance(properties, dict) and not properties.get("success", True):
            logger.error(
                f"light_services_002: \033[31mError toggling device \033[36m{self.ip}\033[31m: {properties.get('error')}\033[0m"
            )
            return {"success": False, "error": properties.get("error")}

        try:
            current_state = properties.get("power") == "on"
            if current_state:
                self.bulb.turn_off()
            else:
                self.bulb.turn_on()
            return not current_state
        except Exception as e:
            logger.error(
                f"light_services_003: \033[31mError toggling device \033[36m{self.ip}\033[31m: {str(e)}\033[0m"
            )
            return {"success": False, "error": str(e)}

    def set_brightness(self, brightness: int):
        try:
            self.bulb.set_brightness(brightness)
        except Exception as e:
            logger.error(
                f"light_services_004: \033[31mError setting brightness \033[33m{brightness}%\033[31m for \033[36m{self.ip}\033[31m: {str(e)}\033[0m"
            )
            raise

    def set_color_temp(self, temperature: int):
        try:
            self.bulb.set_color_temp(temperature)
        except Exception as e:
            logger.error(
                f"light_services_005: \033[31mError setting color temp \033[33m{temperature}K\033[31m for \033[36m{self.ip}\033[31m: {str(e)}\033[0m"
            )
            raise

    def set_rgb(self, red: int, green: int, blue: int):
        try:
            self.bulb.set_rgb(red, green, blue)
        except Exception as e:
            logger.error(
                f"light_services_006: \033[31mError setting RGB \033[33m({red},{green},{blue})\033[31m for \033[36m{self.ip}\033[31m: {str(e)}\033[0m"
            )
            raise


class LightStateService:
    """Service for retrieving aggregated light device states"""

    def get_all_devices_state(self):
        """
        Get current state of all light devices
        TODO: Replace with real device polling
        """
        from archie_shared.ui.models import AssistantButton

        from .pydantic_models import LightDeviceState, LightStateAggregate

        logger.info("light_services_007: Fetching light devices state (mock data)")

        devices = [
            LightDeviceState(
                device_id="light_001",
                name="Торшер гостиная",
                room="Гостиная",
                is_on=True,
                brightness=75,
                color_mode="temperature",
                color_temp=2700,
                rgb_color=None,
                icon="lamp",
                color="yellow",
            ),
            LightDeviceState(
                device_id="light_002",
                name="Потолочная кухня",
                room="Кухня",
                is_on=True,
                brightness=60,
                color_mode="temperature",
                color_temp=3000,
                rgb_color=None,
                icon="lightbulb",
                color="yellow",
            ),
            LightDeviceState(
                device_id="light_003",
                name="Спальня",
                room="Спальня",
                is_on=False,
                brightness=50,
                color_mode="temperature",
                color_temp=2700,
                rgb_color=None,
                icon="bed",
                color="gray",
            ),
        ]

        on_count = sum(1 for d in devices if d.is_on)

        quick_actions = [
            AssistantButton(
                text="Включить все",
                style="primary",
                icon="power",
                assistant_request="Включи все лампы",
            ),
            AssistantButton(
                text="Выключить все",
                style="secondary",
                icon="power-off",
                assistant_request="Выключи все лампы",
            ),
        ]

        return LightStateAggregate(
            type="light_widget",
            title="Свет",
            subtitle=f"{on_count} из {len(devices)} включены",
            on_count=on_count,
            total_count=len(devices),
            devices=devices,
            quick_actions=quick_actions,
        )

    def save_to_redis(self, user_name: str = "Niko"):
        """Save light state to user_state in Redis"""
        from homeassistant.redis_client import redis_client

        state = self.get_all_devices_state()

        try:
            redis_client.update_user_state(
                user_name, {"smarthome_light": state.model_dump()}, ttl=None
            )
            logger.info(
                f"light_services_008: Saved light state to user_state:name:{user_name}"
            )
            return True
        except Exception as e:
            logger.error(f"light_services_error_001: Failed to save to Redis: {e}")
            return False
