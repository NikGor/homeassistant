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
    
    def save_to_redis(self):
        """Save climate state to Redis"""
        from homeassistant.redis_client import redis_client
        
        state = self.get_all_devices_state()
        key = "smarthome_state:climate"
        
        try:
            redis_client.redis_client.set(
                key,
                state.model_dump_json(),
                ex=60  # TTL 60 seconds
            )
            logger.info(f"climate_services_002: Saved climate state to Redis: {key}")
            return True
        except Exception as e:
            logger.error(f"climate_services_error_001: Failed to save to Redis: {e}")
            return False

