from typing import Literal, Optional, List
from pydantic import BaseModel, Field
from archie_shared.ui.models import AssistantButton


class LightDeviceState(BaseModel):
    """State of a single light device within the widget"""
    device_id: str = Field(description="Unique device identifier")
    name: str = Field(description="Device display name (e.g., 'Люстра', 'Торшер')")
    room: Optional[str] = Field(default=None, description="Room location")
    is_on: bool = Field(description="Current power state")
    brightness: int = Field(
        description="Brightness level 1-100%",
        ge=1,
        le=100
    )
    color_mode: Literal["temperature", "color"] = Field(
        default="temperature",
        description="Light mode: 'temperature' for white temp control, 'color' for RGB"
    )
    color_temp: Optional[int] = Field(
        default=None,
        description="Color temperature in Kelvin (1700-6500K), used when color_mode='temperature'",
        ge=1700,
        le=6500
    )
    rgb_color: Optional[str] = Field(
        default=None,
        description="RGB hex color (e.g., '#FF5500'), used when color_mode='color'"
    )
    icon: str = Field(default="lightbulb", description="Lucide icon name")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        description="Icon color based on state: 'yellow' for on, 'gray' for off"
    )


class LightStateAggregate(BaseModel):
    """Light control widget with device list and quick actions"""
    type: Literal["light_widget"] = Field(
        "light_widget",
        description="Widget type identifier"
    )
    title: str = Field(default="Свет", description="Widget title")
    subtitle: str = Field(description="Status summary (e.g., '2 из 3 включены')")
    on_count: int = Field(description="Number of lights currently on")
    total_count: int = Field(description="Total number of light devices")
    devices: List[LightDeviceState] = Field(
        description="List of all light devices with their states"
    )
    quick_actions: List[AssistantButton] = Field(
        description="2 quick action buttons (e.g., 'Включить все', 'Выключить все')"
    )
