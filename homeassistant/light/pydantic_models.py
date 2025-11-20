from pydantic import BaseModel, Field


class LightDeviceState(BaseModel):
    """State of a single light device"""
    name: str = Field(description="Device display name")
    icon: str = Field(description="Lucide icon name representing the device type")
    color: str = Field(description="Icon color representing device state")
    variant: str = Field(description="Icon style: 'solid' for on, 'outline' for off")
    tooltip: str = Field(description="Device status details for display")


class LightStateAggregate(BaseModel):
    """Aggregated state of all light devices"""
    on_count: int = Field(description="Number of lights currently on")
    total_count: int = Field(description="Total number of light devices")
    devices: list[LightDeviceState] = Field(description="List of individual device states")
