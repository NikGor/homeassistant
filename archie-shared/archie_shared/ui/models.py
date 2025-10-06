"""
UI component models for rich chat interfaces
"""

from typing import Optional, List
from typing_extensions import Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum


class ButtonOption(BaseModel):
    """Interactive button in chat interface"""
    text: str = Field(description="Display text shown on the button")
    command: str = Field(description="Command to execute when button is clicked")
    assistant_request: str = Field(description="Request which will be sent back to assistant when button is clicked")
    
    @field_validator('command')
    @classmethod
    def validate_command_not_empty(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("command field cannot be empty")
        return v.strip()
    
    @field_validator('assistant_request')
    @classmethod
    def validate_assistant_request_not_empty(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("assistant_request field cannot be empty")
        return v.strip()


class DropdownOption(BaseModel):
    """Option in a dropdown menu"""
    label: str = Field(description="Human-readable label displayed in the dropdown")
    value: str = Field(description="Value associated with this option")
    command: Optional[str] = Field(default=None, description="Command to execute when option is selected")
    
    @field_validator('command')
    @classmethod
    def validate_command_not_empty_if_present(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() == "":
            raise ValueError("command field cannot be empty string if provided")
        return v.strip() if v else None


class ChecklistOption(BaseModel):
    """Item in a checklist"""
    label: str = Field(description="Human-readable label displayed next to the checkbox")
    value: str = Field(description="Value associated with this checklist item")
    checked: bool = Field(default=False, description="Whether the checkbox is initially checked")
    command: Optional[str] = Field(default=None, description="Command to execute when checkbox state changes")
    
    @field_validator('command')
    @classmethod
    def validate_command_not_empty_if_present(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() == "":
            raise ValueError("command field cannot be empty string if provided")
        return v.strip() if v else None


class UIElements(BaseModel):
    """Collection of UI elements for rich chat interfaces"""
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="List of interactive buttons")
    # checklist: Optional[List[ChecklistOption]] = Field(default=None, description="List of checklist items")
    # dropdown: Optional[List[DropdownOption]] = Field(default=None, description="List of dropdown menu options")

class Card(BaseModel):
    """Generic card component for displaying structured content"""
    title: Optional[str] = Field(default=None, description="Main title of the card")
    subtitle: Optional[str] = Field(default=None, description="Subtitle or secondary heading")
    text: Optional[str] = Field(default=None, description="Main content text of the card")
    options: Optional[UIElements] = Field(default=None, description="Interactive UI elements within the card")


class NavigationCard(BaseModel):
    """Card for navigation and routing"""
    title: str = Field(description="Title of the navigation card")
    description: Optional[str] = Field(default=None, description="Optional description of the navigation destination")
    open_map_url: Optional[str] = Field(default=None, description="Google-format URL to open map location")
    navigate_to_url: Optional[str] = Field(default=None, description="Google-format URL to start navigation")
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="Buttons for open_map_url and navigate_to_url")


class ContactCard(BaseModel):
    """Card for displaying contact information"""
    name: str = Field(description="Full name of the contact person")
    email: Optional[str] = Field(default=None, description="Email address of the contact")
    phone: Optional[str] = Field(default=None, description="Phone number of the contact")
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="Action buttons for contacting the person")


class ToolCard(BaseModel):
    """Card for displaying available tools/functions"""
    name: str = Field(description="Name of the tool or function")
    description: Optional[str] = Field(default=None, description="Description of what the tool does")

class TableCell(BaseModel):
    """Single cell in a table"""
    content: str = Field(description="Content of the table cell")

class Table(BaseModel):
    """Table with structured data"""
    headers: list[str] = Field(description="List of column headers")
    rows: list[list[TableCell]] = Field(description="List of table rows, each row is a list of cell values")

class ElementsItem(BaseModel):
    """Single item in Elements list"""
    title: str = Field(description="Title of the element")
    value: str = Field(description="Value of the element")


class Elements(BaseModel):
    """Collection of key-value elements"""
    items: List[ElementsItem] = Field(description="List of key-value pairs")
 
class PlayerSkills(BaseModel):
    """Player skills in a football (soccer) match"""
    passing: int = Field(description="Passing skill rating (0-100)")
    shooting: int = Field(description="Shooting skill rating (0-100)")
    dribbling: int = Field(description="Dribbling skill rating (0-100)")
    defending: int = Field(description="Defending skill rating (0-100)")
    physical: int = Field(description="Physical skill rating (0-100)")
    pace: int = Field(description="Pace skill rating (0-100)")

class FootballPlayer(BaseModel):
    """Single player in a football (soccer) match. Always use it for football-related queries."""
    name: str = Field(description="Player's full name")
    age: int = Field(description="Player's age")
    country: str = Field(description="Player's country of origin")
    team: str = Field(description="Player's current team")
    position: str = Field(description="Player's position on the field (e.g., Forward, Midfielder)")
    is_captain: bool = Field(default=False, description="Whether the player is the team captain")
    skills: PlayerSkills = Field(description="Player's skill ratings")

class FootballTeam(BaseModel):
    """Football team information. Always use it for football-related queries."""
    name: str = Field(description="Name of the team")
    city: str = Field(description="City of the team")
    country: str = Field(description="Country of the team as emoji flag")
    coach: str = Field(description="Name of the team coach")
    lineup: List[FootballPlayer] = Field(description="List of players in the team lineup")
    tricot_color: Optional[str] = Field(default=None, description="Hex color code for team tricot")

class FootballEvent(BaseModel):
    """Single event in a football (soccer) match. Always use it for football-related queries."""
    event_report: str = Field(description="A short report or prediction about the match in the style of a sports journalist")
    home_team: FootballTeam = Field(description="Home team information")
    away_team: FootballTeam = Field(description="Away team information")
    home_score: int = Field(description="Current score of the home team")
    away_score: int = Field(description="Current score of the away team")
    event_date: str = Field(description="Date of the match (YYYY-MM-DD)")
    event_time: str = Field(description="Time of the match (HH:MM in Berlin timezone)")
    stadium: str = Field(description="Stadium where the match is taking place")
    event_status: Literal["scheduled", "live", "finished"] = Field(description="Current status of the match")

class FootballLeague(BaseModel):
    """Football (soccer) league information"""
    name: str = Field(description="Name of the league")
    country: str = Field(description="Country where the league is based")
    season: str = Field(description="Current season of the league (e.g., 2023/2024)")
    teams: Table = Field(description="List of teams participating in the league, with details: games played, wins, draws, losses, points")
    current_round: int = Field(description="Current round or matchday of the league")
    total_rounds: int = Field(description="Total number of rounds in the season")
    current_leader: str = Field(description="Name of the team currently leading the league or last season's champion")


class FootballWidget(BaseModel):
    """Football (soccer) match widget. Use it for **all** football-related queries instead of Cards."""
    event: FootballEvent = Field(description="Details of the football match event")
    league: Optional[FootballLeague] = Field(None, description="Details of the football league. Only if requested.")


from typing_extensions import Literal

WeatherMain = Literal[
    "Clear", "Clouds", "Rain", "Snow", "Drizzle", "Thunderstorm",
    "Mist", "Fog", "Haze", "Dust", "Sand", "Smoke", "Squall", "Tornado"
]


class WeatherCondition(BaseModel):
    """Weather condition information. Use it for **all** weather-related queries instead of Cards."""
    main: WeatherMain = Field(description="Main weather condition")
    description: str = Field(description="Detailed weather description (e.g., light rain)")
    icon: Literal[
        "01d", "01n", "02d", "02n", "03d", "03n",
        "04d", "04n", "09d", "09n", "10d", "10n",
        "11d", "11n", "13d", "13n", "50d", "50n"
    ] = Field(description="Weather icon code")


class WeatherData(BaseModel):
    """Current weather data"""
    temperature: float = Field(ge=-100, le=100, description="Current temperature in Celsius")
    feels_like: float = Field(ge=-100, le=100, description="Feels like temperature in Celsius")
    humidity: int = Field(ge=0, le=100, description="Humidity percentage")
    pressure: int = Field(ge=800, le=1200, description="Atmospheric pressure in hPa")
    pressure_trend: Optional[Literal["rising", "steady", "falling"]] = Field(
        default=None, description="Pressure tendency to draw arrows/indicators"
    )
    wind_speed: float = Field(ge=0, le=150, description="Wind speed in m/s")
    wind_gust: Optional[float] = Field(default=None, ge=0, le=150, description="Wind gust in m/s")
    wind_direction: Optional[int] = Field(default=None, ge=0, le=360, description="Wind direction in degrees")
    wind_direction_cardinal: Optional[
        Literal["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    ] = Field(default=None, description="Cardinal wind direction for UI badges")
    visibility: Optional[int] = Field(default=None, description="Visibility in meters")
    cloud_cover: Optional[int] = Field(default=None, ge=0, le=100, description="Total cloud cover in %")
    uv_index: Optional[float] = Field(default=None, ge=0, le=20, description="UV index")
    uv_category: Optional[
        Literal["low", "moderate", "high", "very_high", "extreme"]
    ] = Field(default=None, description="Categorized UV for color-coding")
    dew_point: Optional[float] = Field(default=None, description="Dew point in Celsius")
    precipitation_type: Optional[Literal["rain", "snow", "sleet", "hail", "mixed", "none"]] = Field(
        default=None, description="Dominant precipitation type"
    )
    precipitation_intensity_mmph: Optional[float] = Field(
        default=None, ge=0, description="Instant precip intensity in mm/h"
    )
    condition: WeatherCondition = Field(description="Weather condition details")
    is_day: Optional[bool] = Field(
        default=None, description="True if sun is above horizon - useful for theming"
    )


class WeatherForecast(BaseModel):
    """Weather forecast for a specific time"""
    date: str = Field(description="Forecast date (YYYY-MM-DD)")
    time: str = Field(description="Forecast time (HH:MM)")
    temperature: float = Field(ge=-100, le=100, description="Temperature in Celsius")
    temperature_min: float = Field(ge=-100, le=100, description="Minimum temperature in Celsius")
    temperature_max: float = Field(ge=-100, le=100, description="Maximum temperature in Celsius")
    feels_like: Optional[float] = Field(default=None, ge=-100, le=100, description="Feels like in Celsius")
    precipitation_chance: Optional[int] = Field(default=None, ge=0, le=100, description="Chance of precipitation in %")
    precipitation_amount_mm: Optional[float] = Field(default=None, ge=0, description="Expected precipitation in mm")
    wind_speed: Optional[float] = Field(default=None, ge=0, le=150, description="Wind speed in m/s")
    wind_gust: Optional[float] = Field(default=None, ge=0, le=150, description="Wind gust in m/s")
    wind_direction: Optional[int] = Field(default=None, ge=0, le=360, description="Wind direction in degrees")
    cloud_cover: Optional[int] = Field(default=None, ge=0, le=100, description="Cloud cover in %")
    condition: WeatherCondition = Field(description="Weather condition details")
    is_day: Optional[bool] = Field(default=None, description="Daylight flag for slot")


class WeatherToday(BaseModel):
    """Aggregated daily info for 'Today' card"""
    sunrise: Optional[str] = Field(default=None, description="Local time HH:MM")
    sunset: Optional[str] = Field(default=None, description="Local time HH:MM")
    temperature_min: Optional[float] = Field(default=None, description="Today's min temperature")
    temperature_max: Optional[float] = Field(default=None, description="Today's max temperature")
    precipitation_total_mm: Optional[float] = Field(default=None, ge=0, description="Total precip expected today")
    alerts: Optional[List[str]] = Field(default=None, description="Short titles of active weather alerts")

class WeatherWidget(BaseModel):
    """Weather information widget"""
    location: str = Field(description="Location information")  # kept for compatibility
    current_weather: WeatherData = Field(description="Current weather conditions")
    today: Optional[WeatherToday] = Field(default=None, description="Aggregated 'today' metrics")
    forecast: Optional[List[WeatherForecast]] = Field(default=None, description="Weather forecast list")
    last_updated: datetime = Field(description="Last update timestamp (ISO with timezone)")
    data_source: Optional[str] = Field(default=None, description="Attribution, e.g., OpenWeather/Met.no")
    update_interval_sec: Optional[int] = Field(default=None, description="Recommended refresh interval for UI")


class Metadata(BaseModel):
    """Rich metadata for chat messages with UI components"""
    options: UIElements = Field(description="Interactive UI elements")
    cards: Optional[List[Card]] = Field(default=None, description="List of generic cards to display")
    tool_cards: Optional[List[ToolCard]] = Field(default=None, description="List of available tools/functions")
    navigation_card: Optional[List[NavigationCard]] = Field(default=None, description="List of navigation cards")
    contact_card: Optional[List[ContactCard]] = Field(default=None, description="List of contact information cards")
    football_widget: Optional[FootballWidget] = Field(default=None, description="Football (soccer) match widget")
    weather_widget: Optional[WeatherWidget] = Field(default=None, description="Weather information widget")
    table: Optional[Table] = Field(default=None, description="Table data structure")
    elements: Optional[List[ElementsItem]] = Field(default=None, description="List of key-value pairs for additional info")
