"""
UI component models for rich chat interfaces
"""

from typing import Optional, List
from typing_extensions import Literal
from pydantic import BaseModel, Field


class ButtonOption(BaseModel):
    """Interactive button in chat interface"""
    text: str = Field(description="Display text shown on the button")
    command: str = Field(description="Command to execute when button is clicked")
    assistant_request: str = Field(description="Request which will be sent back to assistant when button is clicked")


class DropdownOption(BaseModel):
    """Option in a dropdown menu"""
    label: str = Field(description="Human-readable label displayed in the dropdown")
    value: str = Field(description="Value associated with this option")
    command: Optional[str] = Field(default=None, description="Command to execute when option is selected")


class ChecklistOption(BaseModel):
    """Item in a checklist"""
    label: str = Field(description="Human-readable label displayed next to the checkbox")
    value: str = Field(description="Value associated with this checklist item")
    checked: bool = Field(default=False, description="Whether the checkbox is initially checked")
    command: Optional[str] = Field(default=None, description="Command to execute when checkbox state changes")


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
 
class PlayerSkills(BaseModel):
    """Player skills in a football (soccer) match"""
    passing: int = Field(description="Passing skill rating (0-100)")
    shooting: int = Field(description="Shooting skill rating (0-100)")
    dribbling: int = Field(description="Dribbling skill rating (0-100)")
    defending: int = Field(description="Defending skill rating (0-100)")
    physical: int = Field(description="Physical skill rating (0-100)")
    pace: int = Field(description="Pace skill rating (0-100)")

class FootballPlayer(BaseModel):
    """Single player in a football (soccer) match"""
    name: str = Field(description="Player's full name")
    age: int = Field(description="Player's age")
    country: str = Field(description="Player's country of origin")
    team: str = Field(description="Player's current team")
    position: str = Field(description="Player's position on the field (e.g., Forward, Midfielder)")
    is_captain: bool = Field(default=False, description="Whether the player is the team captain")
    skills: PlayerSkills = Field(description="Player's skill ratings")

class FootballTeam(BaseModel):
    """Football team information"""
    name: str = Field(description="Name of the team")
    city: str = Field(description="City of the team")
    country: str = Field(description="Country of the team as emoji flag")
    coach: str = Field(description="Name of the team coach")
    lineup: List[FootballPlayer] = Field(description="List of players in the team lineup")
    tricot_color: Optional[str] = Field(default=None, description="Hex color code for team tricot")

class FootballEvent(BaseModel):
    """Single event in a football (soccer) match"""
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
    """Football (soccer) match widget"""
    event: FootballEvent = Field(description="Details of the football match event")
    league: FootballLeague = Field(description="Details of the football league")


class WeatherCondition(BaseModel):
    """Weather condition information"""
    main: str = Field(description="Main weather condition (e.g., Clear, Clouds, Rain)")
    description: str = Field(description="Detailed weather description (e.g., light rain)")
    icon: str = Field(description="Weather icon code")


class WeatherData(BaseModel):
    """Current weather data"""
    temperature: float = Field(description="Current temperature in Celsius")
    feels_like: float = Field(description="Feels like temperature in Celsius")
    humidity: int = Field(description="Humidity percentage")
    pressure: int = Field(description="Atmospheric pressure in hPa")
    wind_speed: float = Field(description="Wind speed in m/s")
    wind_direction: Optional[int] = Field(default=None, description="Wind direction in degrees")
    visibility: Optional[int] = Field(default=None, description="Visibility in meters")
    uv_index: Optional[float] = Field(default=None, description="UV index")
    condition: WeatherCondition = Field(description="Weather condition details")


class WeatherForecast(BaseModel):
    """Weather forecast for a specific time"""
    date: str = Field(description="Forecast date (YYYY-MM-DD)")
    time: str = Field(description="Forecast time (HH:MM)")
    temperature: float = Field(description="Temperature in Celsius")
    temperature_min: float = Field(description="Minimum temperature in Celsius")
    temperature_max: float = Field(description="Maximum temperature in Celsius")
    condition: WeatherCondition = Field(description="Weather condition details")
    precipitation_chance: Optional[int] = Field(default=None, description="Chance of precipitation in percentage")


class WeatherLocation(BaseModel):
    """Weather location information"""
    city: str = Field(description="City name")
    country: str = Field(description="Country name or code")
    coordinates: Optional[str] = Field(default=None, description="Coordinates (lat, lon)")


class WeatherWidget(BaseModel):
    """Weather information widget"""
    location: WeatherLocation = Field(description="Location information")
    current_weather: WeatherData = Field(description="Current weather conditions")
    forecast: Optional[List[WeatherForecast]] = Field(default=None, description="Weather forecast list")
    last_updated: str = Field(description="Last update timestamp")


class Metadata(BaseModel):
    """Rich metadata for chat messages with UI components"""
    cards: Optional[List[Card]] = Field(default=None, description="List of generic cards to display")
    options: Optional[UIElements] = Field(default=None, description="Interactive UI elements")
    tool_cards: Optional[List[ToolCard]] = Field(default=None, description="List of available tools/functions")
    navigation_card: List[NavigationCard] = Field(default_factory=list, description="List of navigation cards")
    contact_card: List[ContactCard] = Field(default_factory=list, description="List of contact information cards")
    football_widget: Optional[FootballWidget] = Field(default=None, description="Football (soccer) match widget")
    weather_widget: Optional[WeatherWidget] = Field(default=None, description="Weather information widget")
    table: Optional[Table] = Field(default=None, description="Table data structure")
    elements: List[ElementsItem] = Field(default_factory=list, description="List of key-value pairs for additional info")
