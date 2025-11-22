from typing import Literal, List, Optional, Union, Dict
from pydantic import BaseModel, Field

class Button(BaseModel):
    """Interactive action button with clear visual hierarchy and purpose"""
    text: str = Field(
        description="Concise action-oriented button label (2-4 words max). Use verbs."
    )
    style: Optional[Literal["primary", "secondary", "success", "warning", "danger"]] = Field(
        default="secondary",
        description="Visual prominence: 'primary' for main action, 'secondary' for alternatives, etc. Use all styles consistently within the context."
    )
    icon: Optional[str] = Field(
        default=None,
        description="Icon identifier for visual representation. Use Lucide icon names or emoji as fallback."
    )

class FrontendButton(Button):
    """Frontend-specific button with additional properties for UI/UX"""
    type: Literal["frontend_button"] = Field("frontend_button", description="Button type for frontend discrimination")
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
        "check_amazon"
        ] = Field(
        description="Predefined command for frontend routing: for general actions"
    )

class AssistantButton(Button):
    """Assistant-specific button with tailored behavior and context"""
    type: Literal["assistant_button"] = Field("assistant_button", description="Button type for frontend discrimination")
    assistant_request: str = Field(
        description="Natural language request that will be processed by assistant when clicked. Be specific and contextual."
    )

class Card(BaseModel):
    """Versatile content card with clear information hierarchy and actionability"""
    type: Literal["card"] = Field("card", description="Type of the card for frontend rendering")
    title: Optional[str] = Field(
        default=None, 
        description="Clear, descriptive headline (3-6 words). Use title case. Focus on user benefit or key information."
    )
    subtitle: Optional[str] = Field(
        default=None, 
        description="Supporting context or category label. Keep under 10 words. Use for dates, locations, or types."
    )
    text: Optional[str] = Field(
        default=None, 
        description="Concise body content (1-3 sentences max). Focus on essential information user needs to act."
    )
    image: Optional[str] = Field(
        default=None,
        description="An image to improve the visual appeal. Base64-encoded image string (with data:image format prefix). 1:1 aspect ratio."
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None, 
        description="Action buttons ordered by importance. Always include at least 1 primary action. Max 3 buttons per card."
    )

class LocationCard(BaseModel):
    """Location-focused card for places with optional navigation capabilities"""
    type: Literal["location_card"] = Field("location_card", description="Type of the card for frontend rendering")
    title: str = Field(
        description="Clear location name or destination"
    )
    description: Optional[str] = Field(
        default=None, 
        description="Brief context: distance, travel time, or key details"
    )
    address: Optional[str] = Field(
        default=None,
        description="Full address for precise navigation and user clarity"
    )
    open_map_url: Optional[str] = Field(
        default=None, 
        description="Direct link to map view - use platform-specific URLs (Google Maps)"
    )
    buttons: List[Union[FrontendButton, AssistantButton]] = Field(
        default=None,
        description="""
        Action buttons specific to the location
        Use the frontend button "open_map"
        Add 1-2 assistant buttons for another relevant quick action
        Maximum 3 buttons per location
        """
    )

class ProductCard(BaseModel):
    """Product-focused card for items with specifications and purchase options"""
    type: Literal["product_card"] = Field("product_card", description="Type of the card for frontend rendering")
    
    # Main info
    title: str = Field(
        description="Product name and model"
    )
    brand: Optional[str] = Field(
        default=None,
        description="Product brand or manufacturer"
    )
    
    # Commercial info
    price: Optional[str] = Field(
        default=None,
        description="Current price with currency"
    )
    rating: Optional[str] = Field(
        default=None,
        description="User rating and review count"
    )
    
    # Technical details
    specifications: Optional[List[str]] = Field(
        default=None,
        description="3-5 key specifications or features"
    )
    
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the product
        Always include: frontend button "check_amazon" for product details
        Add assistant button for finding other stores/retailers
        Add assistant button for price comparison or similar products
        Maximum 3 buttons per product
        """
    )

class MovieCard(BaseModel):
    """Movie-focused informational card with key details"""
    type: Literal["movie_card"] = Field("movie_card", description="Type of the card for frontend rendering")
    
    # Main info
    title: str = Field(
        description="Movie title"
    )
    year: int = Field(
        description="Release year"
    )
    
    # Production details
    director: Optional[str] = Field(
        default=None,
        description="Director name"
    )
    cast: Optional[List[str]] = Field(
        default=None,
        description="Top 3 main actors/actresses"
    )
    studio: Optional[str] = Field(
        default=None,
        description="Production studio or company"
    )
    
    # Classification & metrics
    genre: Optional[str] = Field(
        default=None,
        description="Primary genre or genres"
    )
    rating: Optional[str] = Field(
        default=None,
        description="Rating with source"
    )
    duration: Optional[str] = Field(
        default=None,
        description="Runtime"
    )
    
    # Content
    description: Optional[str] = Field(
        default=None,
        description="Brief plot summary (2-3 sentences max)"
    )
    
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the movie
        Include frontend button "open_on_youtube_video" for trailers
        Add assistant buttons for recommendations or streaming info
        Maximum 3 buttons per movie
        """
    )

class SeriesCard(BaseModel):
    """TV series-focused informational card with show details"""
    type: Literal["series_card"] = Field("series_card", description="Type of the card for frontend rendering")
    
    # Main info
    title: str = Field(
        description="Series title"
    )
    years: str = Field(
        description="Years aired"
    )
    status: Optional[str] = Field(
        default=None,
        description="Current status"
    )
    
    # Production details
    network: Optional[str] = Field(
        default=None,
        description="Network, streaming platform, or original broadcaster"
    )
    creators: Optional[List[str]] = Field(
        default=None,
        description="Show creators or showrunners"
    )
    
    # Series metrics
    seasons: Optional[int] = Field(
        default=None,
        description="Number of seasons"
    )
    episodes: Optional[int] = Field(
        default=None,
        description="Total number of episodes"
    )
    genre: Optional[str] = Field(
        default=None,
        description="Primary genre"
    )
    rating: Optional[str] = Field(
        default=None,
        description="Rating with source"
    )
    
    # Content
    description: Optional[str] = Field(
        default=None,
        description="Brief show summary (2-3 sentences max)"
    )
    
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the series
        Include frontend button "open_on_youtube_video" for trailers/clips
        Add assistant buttons for episode guides or streaming info
        Maximum 3 buttons per series
        """
    )

class MusicCard(BaseModel):
    """Music-focused card with track, album, and artist information"""
    type: Literal["music_card"] = Field("music_card", description="Type of the card for frontend rendering")
    
    # Main info
    track_title: str = Field(
        description="Song title"
    )
    artist: str = Field(
        description="Artist or band name"
    )
    
    # Album info
    album_title: Optional[str] = Field(
        default=None,
        description="Album name"
    )
    album_year: Optional[int] = Field(
        default=None,
        description="Album release year"
    )
    
    # Track details
    duration: Optional[str] = Field(
        default=None,
        description="Track length"
    )
    track_year: Optional[int] = Field(
        default=None,
        description="Track release year"
    )
    genre: Optional[str] = Field(
        default=None,
        description="Music genre"
    )
    country: Optional[str] = Field(
        default=None,
        description="Artist's country of origin"
    )
    
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the music
        Include frontend button "open_on_youtube_music" for listening
        Add assistant buttons for similar music or artist info
        Maximum 3 buttons per music card
        """
    )

class ArticleCard(BaseModel):
    """Article-focused card for news and blog content"""
    type: Literal["article_card"] = Field("article_card", description="Type of the card for frontend rendering")
    title: str = Field(
        description="Article headline"
    )
    source: str = Field(
        description="Publication or website name"
    )
    published_date: Optional[str] = Field(
        default=None,
        description="Publication date"
    )
    summary: Optional[str] = Field(
        default=None,
        description="Brief article summary (2-3 sentences highlighting key points)"
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the article
        Always include: frontend button "export_to_notes" for saving
        Add assistant button for summarizing or sharing
        Maximum 3 buttons per article
        """
    )

class ShoppingListCard(BaseModel):
    """Shopping list card with items organized by store departments"""
    type: Literal["shopping_list_card"] = Field("shopping_list_card", description="Type of the card for frontend rendering")
    title: str = Field(
        description="List title"
    )
    items_by_department: Optional[Dict[str, List[str]]] = Field(
        default=None,
        description="""
        Dictionary organized by German store departments.
        Don't use recipe units like: '90g pancetta', '3 large eggs', '50g pecorino cheese'
        Round up quantities to nearest store unit: kg, g, L, ml, pieces, packs, bottles, cans
        """
    )
    total_cost: int = Field(
        default=0,
        description="Total estimated cost of all items in the list"
    )
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="""
        Action buttons specific to the shopping list
        Always include: frontend button "export_to_notes" for saving
        Add assistant button for modifying or optimizing the list
        Maximum 2 buttons per shopping list
        """
    )

class WeatherCard(BaseModel):
    """Weather-focused card with current conditions and forecast"""
    type: Literal["weather_card"] = Field("weather_card", description="Type of the card for frontend rendering")
    # Location
    location: str = Field(
        description="Location name"
    )
    # Current conditions
    current_temp: str = Field(
        description="Current temperature with unit"
    )
    feels_like: Optional[str] = Field(
        default=None,
        description="Feels like temperature"
    )
    condition: str = Field(
        description="Weather condition"
    )
    condition_icon: Optional[str] = Field(
        default=None,
        description="Lucide icon representing current weather condition"
    )
    # Additional metrics
    humidity: Optional[str] = Field(
        default=None,
        description="Humidity percentage"
    )
    wind: Optional[str] = Field(
        default=None,
        description="Wind speed and direction"
    )
    wind_direction_icon: Optional[Literal["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"]] = Field(
        default=None,
        description="Lucide icon representing wind direction"
    )
    # Forecast & advice
    daily_forecast: Optional[str] = Field(
        default=None,
        description="Today's high/low"
    )
    clothing_advice: Optional[str] = Field(
        default=None,
        description="Clothing recommendation"
    )
    # Actions
    buttons: Optional[List[Union[FrontendButton, AssistantButton]]] = Field(
        default=None,
        description="Action buttons: '7-Day Forecast', 'Weather Alerts', 'Hourly Forecast'. Maximum 3 buttons."
    )

class ContactCard(BaseModel):
    """People-focused card optimized for immediate communication actions"""
    type: Literal["contact_card"] = Field("contact_card", description="Type of the card for frontend rendering")
    name: str = Field(
        description="Person's full name or professional title + name"
    )
    role: Optional[str] = Field(
        default=None,
        description="Professional context or relationship"
    )
    company: Optional[str] = Field(
        default=None,
        description="Organization or company name for professional contacts"
    )
    email: Optional[str] = Field(
        default=None, 
        description="Primary email address - ensure it's actionable (clickable mailto: link)"
    )
    phone: Optional[str] = Field(
        default=None, 
        description="Phone number in international format for universal compatibility (+1-555-123-4567)"
    )
    availability: Optional[str] = Field(
        default=None,
        description="When they're available or best time to contact (e.g., 'Available 9-5 EST', 'Weekends preferred')"
    )
    preferred_contact: Optional[Literal["phone", "email", "message"]] = Field(
        default=None,
        description="Suggested primary contact method to prioritize in UI"
    )
    buttons: List[Union[FrontendButton, AssistantButton]] = Field(
        default=None,
        description="""
        Action buttons specific to contacting the person
        If the contact has a phone number — add a frontend button 'call' (and an assistant button for clarifying the best time to call)
        If the contact has an email — add a frontend button 'email' (and an assistant button for sending a template email)
        If the contact has a messenger — add a frontend button 'message'
        For each contact, add 1 assistant button for a quick action (e.g., 'Book an appointment', 'Request details')
        Maximum 3 buttons per contact
    """
    )
    
class CardGrid(BaseModel):
    """Grid layout for multiple cards to enhance visual scanning and comparison"""
    grid_dimensions: Literal["1_column", "2_columns"] = Field(
        description="Grid layout choice: '1 column' for a single card, '2_columns' for 2 or more cards"
    )
    cards: List[Union[Card, LocationCard, ContactCard, ProductCard, MovieCard, SeriesCard, MusicCard, ArticleCard, ShoppingListCard, WeatherCard]] = Field(
        description="List of cards to display in the grid. Keep individual card content concise for quick scanning."
    )

class Table(BaseModel):
    """Structured data table optimized for comparison and scanning"""
    title: Optional[str] = Field(
        default=None,
        description="Table caption explaining what user is comparing (e.g., 'Price Comparison', 'Weekly Schedule')"
    )
    headers: List[str] = Field(
        description="Clear, concise column headers (1-2 words each). Use nouns or questions users are comparing."
    )
    rows: List[List[str]] = Field(
        description="Data rows with consistent formatting. Keep cell content scannable - use abbreviations, symbols, colors for quick reading."
    )
    sortable: Optional[bool] = Field(
        default=False,
        description="Whether user can sort columns - useful for price, date, or ranking comparisons"
    )
    highlight_column: Optional[int] = Field(
        default=None,
        description="Zero-based index of column to emphasize (usually the comparison point or recommended option)"
    )

class TextAnswer(BaseModel):
    """Rich text content with appropriate formatting for optimal readability"""
    type: Literal["plain", "markdown", "html", "voice"] = Field(
        description="Content format: 'markdown' for structured text, 'plain' for simple responses, 'html' for rich formatting"
    )
    text: str = Field(
        description="Well-structured content with clear paragraphs. With markdown and html use bold, cursive, headers, bullet points for lists, and conversational tone."
    )

class Chart(BaseModel):
    """Chart.js compatible chart configuration for data visualization"""
    chart_type: Literal["bar", "line", "pie", "doughnut", "area", "scatter"] = Field(
        description="Chart.js chart type: 'pie'/'doughnut' for parts-of-whole, 'bar' for comparisons, 'line'/'area' for trends"
    )
    chart_config: str = Field(
        description=(
            "Complete Chart.js configuration as JSON string ready for frontend parsing. "
            "Must include 'type', 'data' with labels and datasets, and mobile-optimized 'options'. "
            "Use proper Chart.js format with backgroundColor, responsive: true, maintainAspectRatio: false"
        )
    )
    title: Optional[str] = Field(
        default=None,
        description="Human-readable chart title for accessibility and context (e.g., 'Sales Distribution', 'Temperature Trend')"
    )
    description: Optional[str] = Field(
        default=None,
        description="Brief explanation of what the chart shows and key insights (e.g., 'Revenue peaked in Q4', 'Most users prefer mobile')"
    )
    height: Optional[int] = Field(
        default=300,
        description="Chart height in pixels, optimized for mobile viewing (200-400px recommended)"
    )

class Image(BaseModel):
    """Standalone image component for visual content display"""
    image: Optional[str] = Field(
        description="Base64-encoded image string (with data:image format prefix). Optimal size: 2k, 16:9 aspect ratio."
    )
    alt: Optional[str] = Field(
        default=None,
        description="Alternative text for accessibility and SEO. Describe the image content clearly."
    )
    caption: Optional[str] = Field(
        default=None,
        description="Optional caption displayed below the image (1-2 sentences max)"
    )
    width: Optional[Literal["full", "half", "third"]] = Field(
        default="full",
        description="Image width: 'full' for full-width, 'half' for 50%, 'third' for 33%"
    )

class AdvancedAnswerItem(BaseModel):
    """Strategic UI component with clear hierarchy and user flow optimization"""
    order: int = Field(
        description="Visual sequence (1-based). Lower numbers appear first. Use 10, 20, 30 for easy reordering."
    )
    type: Literal["text_answer", "card_grid", "table", "chart", "image"] = Field(
        description="Component type - choose based on user intent: 'card' for actions, 'table' for comparison, 'text_answer' for explanation, 'chart' for data visualization, 'image' for visual content"
    )
    content: Union[TextAnswer, CardGrid, Table, Chart, Image] = Field(
        description="Component payload - ensure content matches type and supports user's immediate next action"
    )
    layout_hint: Optional[Literal["full_width", "half_width", "inline", "emphasis"]] = Field(
        default="full_width",
        description="Visual layout guidance: 'emphasis' for critical items, 'inline' for quick actions, 'half_width' for comparisons"
    )
    spacing: Optional[Literal["tight", "normal", "loose"]] = Field(
        default="normal",
        description="Vertical spacing around component: 'tight' for related items, 'loose' for section breaks"
    )

class QuickActionButtons(BaseModel):
    """Persistent action bar for immediate user needs and conversation flow"""
    buttons: List[AssistantButton] = Field(
        description="2-3 action buttons representing most likely next steps. Order by user priority, include 1 primary action."
    )

class UIAnswer(BaseModel):
    """Generative UI answer content"""
    intro_text: TextAnswer = Field(default=None, description="Introductory paragraph")
    items: List[AdvancedAnswerItem] = Field(description="List of items in the generative UI answer")
    quick_action_buttons: Optional[QuickActionButtons] = Field(default=None, description="Quick action buttons for the UI")

class DeviceIcon(BaseModel):
    """Smart device icon representation within dashboard tiles"""
    name: str = Field(description="Device name for tooltip display")
    icon: str = Field(description="Lucide icon name representing the device")
    color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        description="Icon color representing device state"
    )
    variant: Literal["solid", "outline"] = Field(
        description="Icon style: 'solid' for active/on devices, 'outline' for inactive/off devices"
    )
    tooltip: str = Field(description="Device status details for hover display")

class DashboardTile(BaseModel):
    """Dashboard tile representing a smart home category or app"""
    category: str = Field(description="Category identifier for routing (e.g., 'light', 'climate')")
    title: str = Field(description="Tile title (e.g., 'Свет', 'Климат')")
    subtitle: str = Field(description="Status summary (e.g., '2 из 3 включены', 'средняя 21.8°C')")
    icon: str = Field(description="Lucide icon name for the tile")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        description="Color indicating overall tile status"
    )
    quick_actions: Optional[List[str]] = Field(
        default=None,
        description="Quick action button labels"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="List of device icons to display within the tile"
    )

class LightTile(BaseModel):
    """Light control dashboard tile"""
    type: Literal["light"] = Field("light", description="Tile type identifier")
    title: str = Field(default="Light", description="Tile title")
    subtitle: str = Field(description="Status summary (e.g., '2 of 3 on')")
    icon: str = Field(default="lightbulb", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        description="Color indicating overall status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for immediate light control"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="List of light device icons"
    )

class ClimateTile(BaseModel):
    """Climate control dashboard tile"""
    type: Literal["climate"] = Field("climate", description="Tile type identifier")
    title: str = Field(default="Climate", description="Tile title")
    subtitle: str = Field(description="Status summary (e.g., 'average home 21.8°C')")
    icon: str = Field(default="thermometer", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        description="Color indicating overall status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for immediate climate control"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="List of climate device icons"
    )

class MusicTile(BaseModel):
    """Music player dashboard tile"""
    type: Literal["music"] = Field("music", description="Tile type identifier")
    title: str = Field(default="Music", description="Tile title")
    subtitle: str = Field(description="Currently playing track and artist")
    icon: str = Field(default="music", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        default="purple",
        description="Color indicating player status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for music control"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="Playback controls as device icons"
    )

class DocumentsTile(BaseModel):
    """Documents dashboard tile"""
    type: Literal["documents"] = Field("documents", description="Tile type identifier")
    title: str = Field(default="Documents", description="Tile title")
    subtitle: str = Field(description="Document status (e.g., 'new today: 2, source: Gmail')")
    icon: str = Field(default="file-text", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        default="blue",
        description="Color indicating document status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for document management"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="Optional document source icons"
    )

class AppsTile(BaseModel):
    """AI-powered apps dashboard tile"""
    type: Literal["apps"] = Field("apps", description="Tile type identifier")
    title: str = Field(default="Apps", description="Tile title")
    subtitle: str = Field(description="Apps description (e.g., 'AI-generated utilities')")
    icon: str = Field(default="grid-3x3", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        default="green",
        description="Color indicating apps status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for launching apps"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="Optional app icons"
    )

class SettingsTile(BaseModel):
    """Settings dashboard tile"""
    type: Literal["settings"] = Field("settings", description="Tile type identifier")
    title: str = Field(default="Settings", description="Tile title")
    subtitle: str = Field(description="Settings summary (e.g., 'Configuration')")
    icon: str = Field(default="settings", description="Lucide icon name")
    status_color: Literal["orange", "green", "blue", "red", "purple", "yellow", "gray"] = Field(
        default="gray",
        description="Color indicating settings status"
    )
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="2 quick action buttons for settings access"
    )
    devices: Optional[List[DeviceIcon]] = Field(
        default=None,
        description="Optional settings icons"
    )

class Dashboard(BaseModel):
    """
    Smart home dashboard - a button-driven AI interface without text input.
    User interacts with AI by clicking AssistantButton elements within tiles or global quick_actions.
    Each button triggers AI agent processing, which returns updated Dashboard state that replaces the entire UI.
    """
    type: Literal["dashboard"] = Field("dashboard", description="Type identifier for frontend rendering")
    light: LightTile = Field(description="Light control tile with device states and quick actions")
    climate: ClimateTile = Field(description="Climate control tile with temperature states and quick actions")
    music: MusicTile = Field(description="Music player tile with playback state and quick actions")
    documents: DocumentsTile = Field(description="Documents tile with sync status and quick actions")
    apps: AppsTile = Field(description="AI apps tile with available utilities and quick actions")
    settings: SettingsTile = Field(description="Settings tile with configuration access and quick actions")
    quick_actions: Optional[List[AssistantButton]] = Field(
        default=None,
        description="3 Global quick action buttons below tiles for common tasks"
    )

class Widget(BaseModel):
    """Generic widget container for future extensions"""
    widget_type: str = Field(description="Widget type identifier")
    title: Optional[str] = Field(default=None, description="Widget title")
    data: Optional[str] = Field(default=None, description="Widget-specific data")

class Content(BaseModel):
    """Content of a chat message, can be text or structured data"""
    content_format: Literal[
        "plain", "markdown", "html", "ssml", 
        "json", "csv", "xml", "yaml", "prompt",
        "python", "bash", "sql", "regex", 
        "dockerfile", "makefile", "ui_answer",
        "dashboard", "widget"
    ] = Field(default="plain", description="Format of the content")
    text: Optional[str] = Field(default=None, description="Text content")
    ui_answer: Optional[UIAnswer] = Field(default=None, description="UI elements content")
    dashboard: Optional[Dashboard] = Field(default=None, description="Dashboard content with tiles and quick actions")
    widget: Optional[Widget] = Field(default=None, description="Generic widget content")
