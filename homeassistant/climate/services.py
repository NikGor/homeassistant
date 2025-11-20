import logging
from .pydantic_models import ClimateStateAggregate, ClimateDeviceState

logger = logging.getLogger(__name__)


class ClimateStateService:
    """Service for retrieving aggregated climate device states"""
    
    def get_all_devices_state(self):
        """
        Get current state of all climate devices
        TODO: Replace with real device polling
        """
        logger.info("climate_services_001: Fetching climate devices state (mock data)")
        
        devices = [
            ClimateDeviceState(
                name="Гостиная",
                icon="thermometer",
                color="green",
                variant="solid",
                tooltip="22.1°C"
            ),
            ClimateDeviceState(
                name="Спальня",
                icon="thermometer",
                color="blue",
                variant="outline",
                tooltip="21.5°C"
            )
        ]
        
        temps = [22.1, 21.5]
        average = sum(temps) / len(temps)
        
        return ClimateStateAggregate(
            average_temp=round(average, 1),
            devices=devices
        )
    
    def save_to_redis(self, user_name: str = "Niko"):
        """Save climate state to user_state in Redis"""
        from homeassistant.redis_client import redis_client
        
        state = self.get_all_devices_state()
        
        try:
            redis_client.update_user_state(
                user_name,
                {"smarthome_climate": state.model_dump()},
                ttl=None
            )
            logger.info(f"climate_services_002: Saved climate state to user_state:name:{user_name}")
            return True
        except Exception as e:
            logger.error(f"climate_services_error_001: Failed to save to Redis: {e}")
            return False

