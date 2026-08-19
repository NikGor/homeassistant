import logging

from homeassistant.ha_mcp.services import HomeAssistantMCPClient

from .pydantic_models import ClimateDeviceState, ClimateStateAggregate

logger = logging.getLogger(__name__)


class ClimateStateService:
    """Service for retrieving aggregated climate device states"""

    def get_all_devices_state(self):
        """Get current state of all climate devices from Home Assistant via MCP"""
        logger.info("climate_services_001: Fetching climate devices state via MCP")

        entities = HomeAssistantMCPClient().get_domain_entities("climate")

        devices = []
        temps = []
        for entity in entities:
            temp = entity.get("temperature")
            if temp is not None:
                temps.append(temp)
            is_active = entity.get("state") not in (
                None,
                "off",
                "idle",
                "unknown",
                "unavailable",
            )
            devices.append(
                ClimateDeviceState(
                    name=entity.get("name") or entity.get("entity_id") or "Climate",
                    icon="thermometer",
                    color="green" if is_active else "blue",
                    variant="solid" if is_active else "outline",
                    tooltip=f"{temp}°C" if temp is not None else "N/A",
                )
            )

        average = round(sum(temps) / len(temps), 1) if temps else 0.0

        return ClimateStateAggregate(average_temp=average, devices=devices)

    def save_to_redis(self, user_name: str = "Niko"):
        """Save climate state to user_state in Redis"""
        from homeassistant.redis_client import redis_client

        state = self.get_all_devices_state()

        try:
            redis_client.update_user_state(
                user_name, {"smarthome_climate": state.model_dump()}, ttl=None
            )
            logger.info(
                f"climate_services_002: Saved climate state to user_state:name:{user_name}"
            )
            return True
        except Exception as e:
            logger.error(f"climate_services_error_001: Failed to save to Redis: {e}")
            return False
