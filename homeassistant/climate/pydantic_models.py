from pydantic import BaseModel, Field


class ClimateDeviceState(BaseModel):
    """State of a single climate device"""
    name: str = Field(description="Device display name")
    icon: str = Field(description="Lucide icon name representing the device type")
    color: str = Field(description="Icon color representing device state")
    variant: str = Field(description="Icon style: 'solid' for active, 'outline' for inactive")
    tooltip: str = Field(description="Device status details for display")


class ClimateStateAggregate(BaseModel):
    """Aggregated state of all climate devices"""
    average_temp: float = Field(description="Average temperature across all devices")
    devices: list[ClimateDeviceState] = Field(description="List of individual device states")
