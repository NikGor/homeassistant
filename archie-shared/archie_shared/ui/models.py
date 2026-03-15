from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class Button(BaseModel):
    """Interactive action button with clear visual hierarchy and purpose"""

    text: str = Field(
        description="Concise action-oriented button label (2-4 words max). Use verbs."
    )
    style: Optional[Literal["primary", "secondary", "success", "warning", "danger"]] = (
        Field(
            default="secondary",
            description="Button visual style. 'primary' for main action, 'secondary' for alternatives.",
        )
    )
    icon: Optional[str] = Field(
        default=None,
        description="Icon identifier for visual representation. Use Lucide icon names or emoji as fallback.",
    )


class FrontendButton(Button):
    """Frontend-specific button with additional properties for UI/UX"""

    type: Literal["frontend_button"] = Field(
        "frontend_button", description="Button type for frontend discrimination"
    )
    command: Literal[
        "navigate_to",
        "open_map",
        "call",
        "email",
        "message",
        "show_details",
        "export_to_notes",
        "export_to_calendar",
        "open_on_youtube_video",
        "open_on_youtube_music",
        "url_to",
        "check_amazon",
    ] = Field(
        description="Predefined command for frontend routing: for general actions"
    )
    url: Optional[str] = Field(default=None, description="URL for 'url_to' button")


class AssistantButton(Button):
    """Assistant-specific button with tailored behavior and context"""

    type: Literal["assistant_button"] = Field(
        "assistant_button", description="Button type for frontend discrimination"
    )
    assistant_request: str = Field(
        description="Natural language request that will be processed by assistant when clicked. Be specific and contextual."
    )


class Card(BaseModel):
    """Versatile content card with clear information hierarchy and actionability"""

    type: Literal["card"] = Field(
        "card", description="Type of the card for frontend rendering"
    )
    title: Optional[str] = Field(
        default=None,
        description="Clear, descriptive headline (3-6 words). Use title case. Focus on user benefit or key information.",
    )
    subtitle: Optional[str] = Field(
        default=None,
        description="Supporting context or category label. Keep under 10 words. Use for dates, locations, or types.",
    )
    text: Optional[str] = Field(
        default=None,
        description="Concise body content (1-3 sentences max). Focus on essential information user needs to act.",
    )
    image_prompt: Optional[str] = Field(
        default=None,
        description="Image generation prompt for card illustration. Follow card image style instructions from system prompt.",
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons ordered by importance. Always include at least 1 primary action. Max 3 buttons per card.",
    )


class LocationCard(BaseModel):
    """Use for physical locations, addresses, restaurants, and venues — never for abstract concepts. Always include an `open_map` FrontendButton."""

    type: Literal["location_card"] = Field(
        "location_card", description="Type of the card for frontend rendering"
    )
    title: str = Field(description="Clear location name or destination")
    description: Optional[str] = Field(
        default=None, description="Brief context: distance, travel time, or key details"
    )
    address: Optional[str] = Field(
        default=None, description="Full address for precise navigation and user clarity"
    )
    open_map_url: Optional[str] = Field(
        default=None,
        description="Direct link to map view - use platform-specific URLs (Google Maps)",
    )
    buttons: List[Union[FrontendButton, AssistantButton]] = Field(
        default=None,
        description="Action buttons for location navigation and quick actions. Max 3.",
    )


class ProductCard(BaseModel):
    """Use for physical/digital products. Include `show_details` FrontendButton. Provide price, rating, and 3-5 key specs."""

    type: Literal["product_card"] = Field(
        "product_card", description="Type of the card for frontend rendering"
    )

    # Main info
    title: str = Field(description="Product name and model")
    brand: Optional[str] = Field(
        default=None, description="Product brand or manufacturer"
    )

    # Commercial info
    price: Optional[str] = Field(
        default=None, description="Current price with currency"
    )
    rating: Optional[str] = Field(
        default=None, description="User rating and review count"
    )

    # Technical details
    specifications: Optional[List[str]] = Field(
        default=None, description="3-5 key specifications or features"
    )

    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for product: purchase, compare, find alternatives. Max 3.",
    )


class MovieCard(BaseModel):
    """Use for movies. Include `open_on_youtube_video` FrontendButton for trailer/watching."""

    type: Literal["movie_card"] = Field(
        "movie_card", description="Type of the card for frontend rendering"
    )

    # Main info
    title: str = Field(description="Movie title")
    year: int = Field(description="Release year")

    # Production details
    director: Optional[str] = Field(default=None, description="Director name")
    cast: Optional[List[str]] = Field(
        default=None, description="Top 3 main actors/actresses"
    )
    studio: Optional[str] = Field(
        default=None, description="Production studio or company"
    )

    # Classification & metrics
    genre: Optional[str] = Field(default=None, description="Primary genre or genres")
    rating: Optional[str] = Field(default=None, description="Rating with source")
    duration: Optional[str] = Field(default=None, description="Runtime")

    # Content
    description: Optional[str] = Field(
        default=None, description="Brief plot summary (2-3 sentences max)"
    )

    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for movie: trailer, streaming, recommendations. Max 3.",
    )


class SeriesCard(BaseModel):
    """Use for TV shows and series. Include `open_on_youtube_video` FrontendButton."""

    type: Literal["series_card"] = Field(
        "series_card", description="Type of the card for frontend rendering"
    )

    # Main info
    title: str = Field(description="Series title")
    years: str = Field(description="Years aired")
    status: Optional[str] = Field(default=None, description="Current status")

    # Production details
    network: Optional[str] = Field(
        default=None, description="Network, streaming platform, or original broadcaster"
    )
    creators: Optional[List[str]] = Field(
        default=None, description="Show creators or showrunners"
    )

    # Series metrics
    seasons: Optional[int] = Field(default=None, description="Number of seasons")
    episodes: Optional[int] = Field(
        default=None, description="Total number of episodes"
    )
    genre: Optional[str] = Field(default=None, description="Primary genre")
    rating: Optional[str] = Field(default=None, description="Rating with source")

    # Content
    description: Optional[str] = Field(
        default=None, description="Brief show summary (2-3 sentences max)"
    )

    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for series: trailer, episode guide, streaming. Max 3.",
    )


class MusicCard(BaseModel):
    """Use for music tracks, artists, and albums. Include `open_on_youtube_music` FrontendButton for listening."""

    type: Literal["music_card"] = Field(
        "music_card", description="Type of the card for frontend rendering"
    )

    # Main info
    track_title: str = Field(description="Song title")
    artist: str = Field(description="Artist or band name")

    # Album info
    album_title: Optional[str] = Field(default=None, description="Album name")
    album_year: Optional[int] = Field(default=None, description="Album release year")

    # Track details
    duration: Optional[str] = Field(default=None, description="Track length")
    track_year: Optional[int] = Field(default=None, description="Track release year")
    genre: Optional[str] = Field(default=None, description="Music genre")
    country: Optional[str] = Field(
        default=None, description="Artist's country of origin"
    )

    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for music: listen, similar tracks, artist info. Max 3.",
    )


class ArticleCard(BaseModel):
    """Use for news articles and blog posts. Include `export_to_notes` FrontendButton for saving."""

    type: Literal["article_card"] = Field(
        "article_card", description="Type of the card for frontend rendering"
    )
    title: str = Field(description="Article headline")
    source: str = Field(description="Publication or website name")
    published_date: Optional[str] = Field(default=None, description="Publication date")
    summary: Optional[str] = Field(
        default=None,
        description="Brief article summary (2-3 sentences highlighting key points)",
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for article: open link, summarize, share. Max 3.",
    )


class DocumentCard(BaseModel):
    """Use for document search results (invoices, contracts, insurance, receipts). Show filename, snippet, relevance score, extracted date/amount."""

    type: Literal["document_card"] = Field(
        "document_card", description="Type of the card for frontend rendering"
    )

    # Main info from search
    filename: str = Field(
        description="Original filename (e.g., 'INV34571480V38136181.pdf')"
    )
    title: Optional[str] = Field(
        default=None, description="Extracted document title or first heading"
    )

    # Search result info
    snippet: str = Field(
        description="Relevant text snippet from the document matching the search query"
    )
    relevance_score: float = Field(
        description="Search relevance score 0.0-1.0", ge=0.0, le=1.0
    )

    # Document metadata
    document_type: Optional[
        Literal[
            "invoice",
            "contract",
            "insurance",
            "receipt",
            "tax",
            "medical",
            "legal",
            "other",
        ]
    ] = Field(
        default=None, description="Document category inferred from content or filename"
    )
    date: Optional[str] = Field(
        default=None,
        description="Document date extracted from content (e.g., '02.09.2025')",
    )
    amount: Optional[str] = Field(
        default=None, description="Monetary amount if applicable (e.g., '1.089,00 €')"
    )

    # Internal reference
    file_id: Optional[str] = Field(
        default=None,
        description="Internal file ID for reference (e.g., OpenAI file-xxx)",
    )

    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for document: view details, find similar. Max 2.",
    )


class ShoppingListCard(BaseModel):
    """Use for grocery and shopping lists grouped by department. Include `export_to_notes` FrontendButton."""

    type: Literal["shopping_list_card"] = Field(
        "shopping_list_card", description="Type of the card for frontend rendering"
    )
    title: str = Field(description="List title")
    items_by_department: Optional[Dict[str, List[str]]] = Field(
        default=None,
        description="Shopping items grouped by store department. Use store units (kg, g, L, packs), not recipe units.",
    )
    total_cost: int = Field(
        default=0, description="Total estimated cost of all items in the list"
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons for shopping list: save to notes, modify. Max 2.",
    )


class WeatherCard(BaseModel):
    """ALWAYS use for weather queries — NEVER use a generic Card for weather. Include temperature, condition, forecast, and clothing advice."""

    type: Literal["weather_card"] = Field(
        "weather_card", description="Type of the card for frontend rendering"
    )
    # Location
    location: str = Field(description="Location name")
    # Current conditions
    current_temp: str = Field(description="Current temperature with unit")
    feels_like: Optional[str] = Field(
        default=None, description="Feels like temperature"
    )
    condition: str = Field(description="Weather condition")
    condition_icon: Optional[str] = Field(
        default=None, description="Lucide icon representing current weather condition"
    )
    # Additional metrics
    humidity: Optional[str] = Field(default=None, description="Humidity percentage")
    wind: Optional[str] = Field(default=None, description="Wind speed and direction")
    wind_direction_icon: Optional[
        Literal[
            "north",
            "north-east",
            "east",
            "south-east",
            "south",
            "south-west",
            "west",
            "north-west",
        ]
    ] = Field(default=None, description="Lucide icon representing wind direction")
    # Forecast & advice
    daily_forecast: Optional[str] = Field(default=None, description="Today's high/low")
    clothing_advice: Optional[str] = Field(
        default=None, description="Clothing recommendation"
    )
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons: '7-Day Forecast', 'Weather Alerts', 'Hourly Forecast'. Maximum 3 buttons.",
    )


class ContactCard(BaseModel):
    """Use for people and organizations with contact details. Include call/email/message FrontendButtons."""

    type: Literal["contact_card"] = Field(
        "contact_card", description="Type of the card for frontend rendering"
    )
    name: str = Field(description="Person's full name or professional title + name")
    role: Optional[str] = Field(
        default=None, description="Professional context or relationship"
    )
    company: Optional[str] = Field(
        default=None,
        description="Organization or company name for professional contacts",
    )
    email: Optional[str] = Field(
        default=None,
        description="Primary email address - ensure it's actionable (clickable mailto: link)",
    )
    phone: Optional[str] = Field(
        default=None,
        description="Phone number in international format for universal compatibility (+1-555-123-4567)",
    )
    availability: Optional[str] = Field(
        default=None,
        description="When they're available or best time to contact (e.g., 'Available 9-5 EST', 'Weekends preferred')",
    )
    preferred_contact: Optional[Literal["phone", "email", "message"]] = Field(
        default=None, description="Suggested primary contact method to prioritize in UI"
    )
    buttons: List[Union[FrontendButton, AssistantButton]] = Field(
        default=None,
        description="Action buttons for contact: call, email, message, schedule. Max 3.",
    )


class CardGrid(BaseModel):
    """Grid layout for multiple cards to enhance visual scanning and comparison"""

    grid_dimensions: Literal["1_column", "2_columns"] = Field(
        description="Grid layout choice: '1 column' for a single card, '2_columns' for 2 or more cards"
    )
    cards: List[
        Union[
            Card,
            LocationCard,
            ContactCard,
            ProductCard,
            MovieCard,
            SeriesCard,
            MusicCard,
            ArticleCard,
            DocumentCard,
            ShoppingListCard,
            WeatherCard,
        ]
    ] = Field(
        description="List of cards to display in the grid. Keep individual card content concise for quick scanning."
    )


class Table(BaseModel):
    """Structured data table optimized for comparison and scanning"""

    title: Optional[str] = Field(
        default=None,
        description="Table caption explaining what user is comparing (e.g., 'Price Comparison', 'Weekly Schedule')",
    )
    headers: List[str] = Field(
        description="Clear, concise column headers (1-2 words each). Use nouns or questions users are comparing."
    )
    rows: List[List[str]] = Field(
        description="Data rows with consistent formatting. Keep cell content scannable - use abbreviations, symbols, colors for quick reading."
    )
    sortable: Optional[bool] = Field(
        default=False,
        description="Whether user can sort columns - useful for price, date, or ranking comparisons",
    )
    highlight_column: Optional[int] = Field(
        default=None,
        description="Zero-based index of column to emphasize (usually the comparison point or recommended option)",
    )


class EmailForm(BaseModel):
    """Use for composing emails. ALWAYS render this form for email creation — do not ask clarifying questions. Pre-fill known fields; leave others empty for user input."""

    to: Optional[str] = Field(
        description="Recipient email address in standard format (e.g., 'user@example.com')"
    )
    subject: Optional[str] = Field(
        default=None, description="Subject line of the email"
    )
    body: Optional[str] = Field(default=None, description="Main content of the email")


class EventForm(BaseModel):
    """Use for scheduling/adding calendar events. ALWAYS render this form for event creation. Pre-fill known fields; leave others empty for user input."""

    title: str = Field(description="Event title or name")
    date: str = Field(description="Event date in DD.MM.YYYY format")
    time: Optional[str] = Field(
        default=None, description="Event time in HH:MM format (24-hour)"
    )
    duration_minutes: Optional[int] = Field(
        default=60, description="Event duration in minutes"
    )
    location: Optional[str] = Field(
        default=None, description="Event location or address"
    )
    description: Optional[str] = Field(
        default=None, description="Additional notes or details about the event"
    )


class InternalNoteForm(BaseModel):
    """Use for saving notes. ALWAYS render this form for note creation. Pre-fill known fields; leave others empty for user input."""

    title: Optional[str] = Field(default=None, description="Note title or headline")
    content: str = Field(description="Main body content of the note")


class TextAnswer(BaseModel):
    """Rich text content with appropriate formatting for optimal readability"""

    type: Literal["plain", "markdown", "html", "voice"] = Field(
        description="Text format: 'markdown' for structured, 'plain' for simple, 'html' for rich"
    )
    text: str = Field(description="Main text content in the specified format.")


class Chart(BaseModel):
    """Use for data visualization. chart_config must be complete Chart.js JSON: type, data with labels + datasets with backgroundColor, and mobile options: responsive: true, maintainAspectRatio: false."""

    chart_type: Literal["bar", "line", "pie", "doughnut", "area", "scatter"] = Field(
        description="Chart.js chart type"
    )
    chart_config: str = Field(
        description="Chart.js configuration JSON string. Must include type, data (labels, datasets), and mobile-optimized options."
    )
    title: Optional[str] = Field(
        default=None,
        description="Human-readable chart title for accessibility and context (e.g., 'Sales Distribution', 'Temperature Trend')",
    )
    description: Optional[str] = Field(
        default=None,
        description="Brief explanation of what the chart shows and key insights (e.g., 'Revenue peaked in Q4', 'Most users prefer mobile')",
    )
    height: Optional[int] = Field(
        default=300,
        description="Chart height in pixels, optimized for mobile viewing (200-400px recommended)",
    )


class Image(BaseModel):
    """Standalone image component for visual content display"""

    image_prompt: str = Field(
        description="AI image generation prompt in English. Follow image format instructions from system prompt."
    )


class AdvancedAnswerItem(BaseModel):
    """Strategic UI component with clear hierarchy and user flow optimization"""

    order: int = Field(
        description="Display order (1-based). Use increments of 10 for easy reordering."
    )
    type: Literal[
        "text_answer",
        "card_grid",
        "table",
        "chart",
        "image",
        "event_form",
        "email_form",
        "note_form",
    ] = Field(
        description="UI component type. Follow component selection instructions from system prompt."
    )
    content: Union[
        TextAnswer,
        CardGrid,
        Table,
        Chart,
        Image,
        EventForm,
        EmailForm,
        InternalNoteForm,
    ] = Field(description="Component content payload matching the selected type.")
    layout_hint: Optional[Literal["full_width", "half_width", "inline", "emphasis"]] = (
        Field(
            default="full_width",
            description="Visual layout: 'emphasis' for critical, 'inline' for quick, 'half_width' for side-by-side",
        )
    )
    spacing: Optional[Literal["tight", "normal", "loose"]] = Field(
        default="normal",
        description="Vertical spacing: 'tight' for related items, 'loose' for section breaks",
    )


class QuickActionButtons(BaseModel):
    """Persistent action bar for immediate user needs and conversation flow"""

    buttons: List[AssistantButton] = Field(
        description="2-3 quick action buttons for likely next steps."
    )


class Widget(BaseModel):
    """Generic widget container for future extensions"""

    widget_type: str = Field(description="Widget type identifier")
    title: Optional[str] = Field(default=None, description="Widget title")
    data: Optional[str] = Field(default=None, description="Widget-specific data")


# =============================================================================
# LIGHT WIDGET
# =============================================================================


class LightDeviceState(BaseModel):
    """State of a single light device within the widget"""

    device_id: str = Field(description="Unique device identifier")
    name: str = Field(description="Device display name (e.g., 'Люстра', 'Торшер')")
    room: Optional[str] = Field(default=None, description="Room location")
    is_on: bool = Field(description="Current power state")
    brightness: int = Field(description="Brightness level 1-100%", ge=1, le=100)
    color_mode: Literal["temperature", "color"] = Field(
        default="temperature",
        description="Light mode: 'temperature' for white temp control, 'color' for RGB",
    )
    color_temp: Optional[int] = Field(
        default=None,
        description="Color temperature in Kelvin (1700-6500K), used when color_mode='temperature'",
        ge=1700,
        le=6500,
    )
    rgb_color: Optional[str] = Field(
        default=None,
        description="RGB hex color (e.g., '#FF5500'), used when color_mode='color'",
    )
    icon: str = Field(default="lightbulb", description="Lucide icon name")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = (
        Field(description="Icon color based on state: 'yellow' for on, 'gray' for off")
    )


class LightWidget(BaseModel):
    """Light control widget with device list and quick actions"""

    type: Literal["light_widget"] = Field(
        "light_widget", description="Widget type identifier"
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


# =============================================================================
# CLIMATE WIDGET
# =============================================================================


class RadiatorState(BaseModel):
    """State of a heating radiator"""

    device_id: str = Field(description="Unique radiator identifier")
    name: str = Field(description="Radiator display name (e.g., 'Батарея гостиная')")
    room: str = Field(description="Room location")
    is_on: bool = Field(description="Current heating state")
    target_temp: float = Field(
        description="Target temperature in Celsius", ge=5.0, le=35.0
    )
    current_temp: Optional[float] = Field(
        default=None, description="Current temperature reading if available"
    )
    mode: Literal["heat", "off", "auto", "eco"] = Field(description="Operating mode")
    icon: str = Field(default="heater", description="Lucide icon name")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = (
        Field(
            description="Icon color: 'red' for heating, 'blue' for off, 'orange' for eco"
        )
    )


class TemperatureSensorState(BaseModel):
    """State of a temperature/humidity sensor"""

    device_id: str = Field(description="Unique sensor identifier")
    name: str = Field(description="Sensor display name (e.g., 'Датчик спальня')")
    room: str = Field(description="Room location")
    temperature: float = Field(description="Current temperature in Celsius")
    humidity: float = Field(description="Current humidity percentage", ge=0.0, le=100.0)
    battery_level: Optional[int] = Field(
        default=None, description="Battery level 0-100% if wireless", ge=0, le=100
    )
    last_updated: Optional[str] = Field(
        default=None, description="Last reading timestamp"
    )
    icon: str = Field(default="thermometer", description="Lucide icon name")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = (
        Field(
            description="Icon color based on temperature: 'blue' cold, 'green' comfort, 'red' hot"
        )
    )


class ClimateWidget(BaseModel):
    """Climate control widget with radiators, sensors, and quick actions"""

    type: Literal["climate_widget"] = Field(
        "climate_widget", description="Widget type identifier"
    )
    title: str = Field(default="Климат", description="Widget title")
    subtitle: str = Field(
        description="Status summary (e.g., 'средняя 21.8°C, влажность 45%')"
    )
    average_temp: float = Field(description="Average temperature across all sensors")
    average_humidity: float = Field(description="Average humidity across all sensors")
    radiators: List[RadiatorState] = Field(
        description="List of heating radiators (2 devices)"
    )
    sensors: List[TemperatureSensorState] = Field(
        description="List of temperature/humidity sensors (2 devices)"
    )
    quick_actions: List[AssistantButton] = Field(
        description="2 quick action buttons (e.g., 'Режим эко', 'Прогреть дом')"
    )


# =============================================================================
# FOOTBALL WIDGET
# =============================================================================


class MatchInfo(BaseModel):
    """Single football match information"""

    match_id: str = Field(description="Unique match identifier")
    home_team: str = Field(description="Home team name")
    home_team_id: str = Field(description="Home team ID for navigation")
    home_logo_url: Optional[str] = Field(default=None, description="Home team logo")
    away_team: str = Field(description="Away team name")
    away_team_id: str = Field(description="Away team ID for navigation")
    away_logo_url: Optional[str] = Field(default=None, description="Away team logo")
    home_score: Optional[int] = Field(
        default=None, description="Home team score (None if not started)"
    )
    away_score: Optional[int] = Field(
        default=None, description="Away team score (None if not started)"
    )
    status: Literal["scheduled", "live", "halftime", "finished", "postponed"] = Field(
        description="Match status"
    )
    match_time: Optional[str] = Field(
        default=None, description="Current match minute if live (e.g., '67′')"
    )
    start_datetime: str = Field(description="Match start datetime ISO format")
    stadium: Optional[str] = Field(default=None, description="Match venue")
    competition: str = Field(description="Competition name (e.g., 'Premier League')")


class LeagueTableRow(BaseModel):
    """Single row in league standings table"""

    position: int = Field(description="Current league position")
    team_id: str = Field(description="Team ID for navigation")
    team_name: str = Field(description="Team name")
    played: int = Field(description="Matches played")
    won: int = Field(description="Matches won")
    drawn: int = Field(description="Matches drawn")
    lost: int = Field(description="Matches lost")
    goals_for: int = Field(description="Goals scored")
    goals_against: int = Field(description="Goals conceded")
    goal_difference: int = Field(description="Goal difference")
    points: int = Field(description="Total points")
    form: Optional[List[Literal["W", "D", "L"]]] = Field(
        default=None, description="Last 5 match results"
    )


class FootballMatchTab(BaseModel):
    """Match tab content for football widget"""

    current_match: Optional[MatchInfo] = Field(
        default=None, description="Featured/live match if any"
    )
    upcoming_matches: List[MatchInfo] = Field(
        default_factory=list, description="List of upcoming matches"
    )
    recent_results: List[MatchInfo] = Field(
        default_factory=list, description="List of recent match results"
    )


class FootballLeagueTab(BaseModel):
    """League table tab content for football widget"""

    competition_name: str = Field(description="League/competition name")
    season: str = Field(description="Season (e.g., '2024/25')")
    standings: List[LeagueTableRow] = Field(description="League standings table rows")
    last_updated: Optional[str] = Field(
        default=None, description="Last update timestamp"
    )


class FootballWidget(BaseModel):
    """Football widget with match and league tabs"""

    type: Literal["football_widget"] = Field(
        "football_widget", description="Widget type identifier"
    )
    title: str = Field(default="Футбол", description="Widget title")
    active_tab: Literal["match", "league"] = Field(
        default="match", description="Currently active tab"
    )
    match_tab: FootballMatchTab = Field(
        description="Match tab with current/upcoming matches"
    )
    league_tab: FootballLeagueTab = Field(description="League table tab with standings")
    quick_actions: List[AssistantButton] = Field(
        description="2 quick action buttons (e.g., 'Обновить', 'Другая лига')"
    )


# =============================================================================
# MUSIC WIDGET
# =============================================================================


class MusicTrack(BaseModel):
    """Single track in a playlist"""

    track_id: str = Field(description="Unique track identifier")
    title: str = Field(description="Track title")
    artist: str = Field(description="Artist name")
    album: Optional[str] = Field(default=None, description="Album name")
    duration_seconds: int = Field(description="Track duration in seconds")
    cover_url: Optional[str] = Field(default=None, description="Album cover URL")
    is_favorite: bool = Field(default=False, description="Is track in favorites")


class PlaybackState(BaseModel):
    """Current playback state"""

    is_playing: bool = Field(description="Is music currently playing")
    current_track: Optional[MusicTrack] = Field(
        default=None, description="Currently playing track"
    )
    progress_seconds: int = Field(
        default=0, description="Current playback position in seconds"
    )
    volume: int = Field(default=50, description="Volume level 0-100%", ge=0, le=100)
    shuffle: bool = Field(default=False, description="Shuffle mode enabled")
    repeat: Literal["off", "all", "one"] = Field(
        default="off", description="Repeat mode"
    )


class MusicWidget(BaseModel):
    """Music player widget with playlist and playback controls"""

    type: Literal["music_widget"] = Field(
        "music_widget", description="Widget type identifier"
    )
    title: str = Field(default="Музыка", description="Widget title")
    subtitle: str = Field(
        description="Status summary (e.g., 'Воспроизводится: Artist - Track')"
    )
    playback: PlaybackState = Field(description="Current playback state")
    playlist: List[MusicTrack] = Field(description="Current playlist (queue of tracks)")
    quick_actions: List[AssistantButton] = Field(
        description="2 quick action buttons (e.g., 'Мои плейлисты', 'Рекомендации')"
    )


# =============================================================================
# DOCUMENTS WIDGET
# =============================================================================


class DocumentMatch(BaseModel):
    """Single document search result with relevance info"""

    document_id: str = Field(description="Unique document identifier")
    filename: str = Field(description="Original filename (e.g., 'insurance_2024.pdf')")
    title: str = Field(description="Document title or extracted heading")
    document_type: Literal[
        "insurance",
        "contract",
        "invoice",
        "receipt",
        "tax",
        "medical",
        "legal",
        "other",
    ] = Field(description="Document category")
    match_snippet: str = Field(
        description="Relevant text snippet with search match highlighted"
    )
    relevance_score: float = Field(
        description="Vector similarity score 0.0-1.0", ge=0.0, le=1.0
    )
    page_number: Optional[int] = Field(
        default=None, description="Page number where match was found"
    )
    date: Optional[str] = Field(
        default=None, description="Document date (creation or content date)"
    )
    file_size: Optional[str] = Field(
        default=None, description="File size (e.g., '2.4 MB')"
    )
    tags: Optional[List[str]] = Field(
        default=None, description="Document tags for filtering"
    )


class DocumentCategory(BaseModel):
    """Document category with count for filtering"""

    category: Literal[
        "insurance",
        "contract",
        "invoice",
        "receipt",
        "tax",
        "medical",
        "legal",
        "other",
    ] = Field(description="Category identifier")
    label: str = Field(description="Display label (e.g., 'Страховки', 'Договоры')")
    count: int = Field(description="Number of documents in category")
    icon: str = Field(description="Lucide icon name")


class DocumentsWidget(BaseModel):
    """Document archive search widget with vector search capabilities"""

    type: Literal["documents_widget"] = Field(
        "documents_widget", description="Widget type identifier"
    )
    title: str = Field(default="Документы", description="Widget title")
    subtitle: str = Field(
        description="Status summary (e.g., '147 документов в архиве')"
    )
    total_documents: int = Field(description="Total documents in archive")
    last_sync: Optional[str] = Field(
        default=None, description="Last synchronization timestamp"
    )
    current_query: Optional[str] = Field(
        default=None, description="Current search query if any"
    )
    categories: List[DocumentCategory] = Field(
        description="Available document categories with counts"
    )
    search_results: List[DocumentMatch] = Field(
        default_factory=list, description="Current search results (empty if no search)"
    )
    recent_documents: List[DocumentMatch] = Field(
        default_factory=list, description="Recently accessed documents"
    )
    quick_actions: List[AssistantButton] = Field(
        description="2 quick action buttons (e.g., 'Загрузить документ', 'Все страховки')"
    )


class Level2Answer(BaseModel):
    """Level 2 response: text with quick action buttons"""

    text: TextAnswer = Field(description="Main text content (markdown)")
    quick_action_buttons: QuickActionButtons = Field(
        description="Quick action buttons for follow-up actions"
    )


class Level3Answer(BaseModel):
    """Level 3 response: text with inline widgets and quick action buttons"""

    text: TextAnswer = Field(description="Main text content (markdown)")
    widget: Optional[
        Union[
            Widget,
            LightWidget,
            ClimateWidget,
            FootballWidget,
            MusicWidget,
            DocumentsWidget,
        ]
    ] = Field(default=None, description="Inline widget embedded in the response")
    quick_action_buttons: QuickActionButtons = Field(
        description="Quick action buttons for follow-up actions"
    )


class UIAnswer(BaseModel):
    """Level 4 response: full generative UI with all components except Dashboard"""

    intro_text: TextAnswer | None = Field(
        default=None, description="Introductory paragraph"
    )
    items: List[AdvancedAnswerItem] = Field(
        description="List of items in the generative UI answer"
    )
    quick_action_buttons: QuickActionButtons = Field(
        description="Quick action buttons for the UI"
    )


class DeviceIcon(BaseModel):
    """Smart device icon representation within dashboard tiles"""

    name: str = Field(description="Device name for tooltip display")
    icon: str = Field(description="Lucide icon name representing the device")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = (
        Field(description="Icon color representing device state")
    )
    variant: Literal["solid", "outline"] = Field(
        description="Icon style: 'solid' for active/on devices, 'outline' for inactive/off devices"
    )
    tooltip: str = Field(description="Device status details for hover display")


class DashboardTileState(BaseModel):
    """Smart home dashboard tile state"""

    type: Literal["light", "climate", "music", "documents", "apps", "settings"] = Field(
        description="Tile type identifier"
    )
    title: str = Field(description="Tile title")
    subtitle: str = Field(description="Status summary")
    icon: str = Field(description="Lucide icon name")
    status_color: Literal[
        "orange", "green", "blue", "red", "purple", "yellow", "gray"
    ] = Field(description="Color indicating overall status")
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None, description="2 quick action buttons"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None, description="Device icons within the tile"
    )


class Dashboard(BaseModel):
    """
    Smart home dashboard - a button-driven AI interface without text input.
    User interacts with AI by clicking AssistantButton elements within tiles or global quick_actions.
    Each button triggers AI agent processing, which returns updated Dashboard state that replaces the entire UI.
    """

    type: Literal["dashboard"] = Field(
        "dashboard", description="Type identifier for frontend rendering"
    )
    light: DashboardTileState = Field(description="Light control tile")
    climate: DashboardTileState = Field(description="Climate control tile")
    music: DashboardTileState = Field(description="Music player tile")
    documents: DashboardTileState = Field(description="Documents tile")
    apps: DashboardTileState = Field(description="AI apps tile")
    settings: DashboardTileState = Field(description="Settings tile")
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="3 global quick action buttons for common tasks",
    )


class Content(BaseModel):
    """Content of a chat message, can be text or structured data"""

    content_format: Literal[
        "plain",
        "markdown",
        "html",
        "ssml",
        "json",
        "csv",
        "xml",
        "yaml",
        "prompt",
        "python",
        "bash",
        "sql",
        "regex",
        "dockerfile",
        "makefile",
        "level2_answer",
        "level3_answer",
        "ui_answer",
        "dashboard",
        "widget",
    ] = Field(default="plain", description="Format of the content")
    text: Optional[str] = Field(default=None, description="Level 1: Plain text content")
    level2_answer: Optional[Level2Answer] = Field(
        default=None, description="Level 2: Text with quick action buttons"
    )
    level3_answer: Optional[Level3Answer] = Field(
        default=None, description="Level 3: Text with widgets and quick actions"
    )
    ui_answer: Optional[UIAnswer] = Field(
        default=None, description="Level 4: Full UI elements content"
    )
    dashboard: Optional[Dashboard] = Field(
        default=None, description="Dashboard content with tiles and quick actions"
    )
    widget: Optional[
        Union[
            Widget,
            LightWidget,
            ClimateWidget,
            FootballWidget,
            MusicWidget,
            DocumentsWidget,
        ]
    ] = Field(default=None, description="Standalone widget content")
