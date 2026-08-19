import logging

from archie_shared.ui.models import (AssistantButton, ClimateWidget,
                                     RadiatorState, TemperatureSensorState)
from django.http import JsonResponse
from django.views import View

from homeassistant.ha_mcp.services import HomeAssistantMCPClient, to_float

logger = logging.getLogger(__name__)

INACTIVE_STATES = (None, "off", "unknown", "unavailable")

CLIMATE_MODE_MAP = {"heat": "heat", "auto": "auto", "eco": "eco"}

QUICK_ACTIONS = [
    AssistantButton(
        text="Режим эко",
        style="primary",
        icon="leaf",
        assistant_request="Включи эко режим отопления",
    ),
    AssistantButton(
        text="Прогреть дом",
        style="secondary",
        icon="flame",
        assistant_request="Прогрей весь дом до 23 градусов",
    ),
]


def _radiator_mode(state):
    if state in INACTIVE_STATES:
        return "off"
    return CLIMATE_MODE_MAP.get(state, "auto")


def _build_radiators(client: HomeAssistantMCPClient):
    radiators = []
    for i, entity in enumerate(client.get_domain_entities("climate")):
        state = entity.get("state")
        is_on = state not in INACTIVE_STATES
        attrs = entity.get("attributes", {})
        target_temp = to_float(attrs.get("temperature"))
        radiators.append(
            RadiatorState(
                device_id=entity.get("entity_id") or f"radiator_{i}",
                name=entity.get("name") or "Radiator",
                room=entity.get("area") or "",
                is_on=is_on,
                target_temp=target_temp if target_temp is not None else 20.0,
                current_temp=to_float(attrs.get("current_temperature")),
                mode=_radiator_mode(state),
                icon="heater",
                color="red" if is_on else "blue",
            )
        )
    return radiators


def _build_sensors(client: HomeAssistantMCPClient):
    readings_by_area = {}
    for entity in client.get_domain_entities("sensor"):
        area = entity.get("area")
        device_class = entity.get("attributes", {}).get("device_class")
        if not area or device_class not in ("temperature", "humidity"):
            continue
        value = to_float(entity.get("state"))
        if value is None:
            continue
        readings_by_area.setdefault(area, {})[device_class] = value

    sensors = []
    for i, (area, readings) in enumerate(readings_by_area.items()):
        if "temperature" not in readings or "humidity" not in readings:
            continue
        sensors.append(
            TemperatureSensorState(
                device_id=f"sensor_{i}",
                name=f"Датчик {area}",
                room=area,
                temperature=readings["temperature"],
                humidity=readings["humidity"],
                icon="thermometer",
                color="green",
            )
        )
    return sensors


class ClimateStatusAPIView(View):
    def get(self, request, *args, **kwargs):
        logger.info("climate_api_views_001: Fetching climate widget data via MCP")

        client = HomeAssistantMCPClient()
        radiators = _build_radiators(client)
        sensors = _build_sensors(client)

        temps = [s.temperature for s in sensors] or [
            r.current_temp for r in radiators if r.current_temp is not None
        ]
        humidities = [s.humidity for s in sensors]
        average_temp = round(sum(temps) / len(temps), 1) if temps else 0.0
        average_humidity = (
            round(sum(humidities) / len(humidities), 1) if humidities else 0.0
        )

        widget = ClimateWidget(
            subtitle=f"средняя {average_temp:.1f}°C, влажность {average_humidity:.0f}%",
            average_temp=average_temp,
            average_humidity=average_humidity,
            radiators=radiators,
            sensors=sensors,
            quick_actions=QUICK_ACTIONS,
        )

        return JsonResponse({"success": True, **widget.model_dump()})
