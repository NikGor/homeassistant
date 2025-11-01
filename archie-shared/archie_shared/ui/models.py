from typing import Optional, List, Union
from typing_extensions import Literal
from pydantic import BaseModel, Field, field_validator

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

class Card(BaseModel):
    """Generic card component for displaying structured content"""
    title: Optional[str] = Field(default=None, description="Main title of the card")
    subtitle: Optional[str] = Field(default=None, description="Subtitle or secondary heading")
    text: Optional[str] = Field(default=None, description="Main content text of the card")
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="List of interactive buttons on the card")

class NavigationCard(BaseModel):
    """Card for navigation and routing"""
    title: str = Field(description="Title of the navigation card")
    description: Optional[str] = Field(default=None, description="Optional description of the navigation destination")
    open_map_url: Optional[str] = Field(default=None, description="Google-format URL to open map location")
    navigate_to_url: Optional[str] = Field(default=None, description="Google-format URL to start navigation")

class ContactCard(BaseModel):
    """Card for displaying contact information"""
    name: str = Field(description="Full name of the contact person")
    email: Optional[str] = Field(default=None, description="Email address of the contact")
    phone: Optional[str] = Field(default=None, description="Phone number of the contact")

class ToolCard(BaseModel):
    """Card for displaying available tools/functions"""
    name: str = Field(description="Name of the tool or function")
    description: Optional[str] = Field(default=None, description="Description of what the tool does")

class TableCell(BaseModel):
    """Single cell in a table"""
    content: str = Field(description="Content of the table cell")

class Table(BaseModel):
    """Table with structured data"""
    headers: List[str] = Field(description="List of column headers")
    rows: List[List[TableCell]] = Field(description="List of table rows, each row is a list of cell values")

class TextAnswer(BaseModel):
    """Text answer content"""
    type: Literal["plain", "markdown", "html", "voice"] = Field(description="Format type of the text answer")
    text: str = Field(description="Text content of the message")

class WidgetAnswer(BaseModel):
    """Widget answer content"""
    widget_type: Literal["weather_widget", "football_widget"] = Field(description="Type of the widget")
    data: dict = Field(description="Data required to render the widget")

class AdvancedAnswerItem(BaseModel):
    """Single item in generative UI answer"""
    order: int = Field(description="Order of the item in the UI")
    content: Union[TextAnswer, Card, Table, NavigationCard, ContactCard, ToolCard] = Field(description="Content of the UI item")

class QuickActionButtons(BaseModel):
    """Quick action buttons for generative UI"""
    buttons: List[ButtonOption] = Field(description="List of quick action buttons")
    
class AdvancedAnswer(BaseModel):
    """Generative UI answer content"""
    items: List[AdvancedAnswerItem] = Field(description="List of items in the generative UI answer")
    quick_action_buttons: Optional[QuickActionButtons] = Field(default=None, description="Quick action buttons for the UI")
    
class Content(BaseModel):
    """Content of a chat message, can be text or structured data"""
    type: Literal["text_answer", "widget_answer", "advanced_answer"] = Field(description="Type of content")
    text_answer: Optional[TextAnswer] = Field(default=None, description="Text answer content")
    widget_answer: Optional[WidgetAnswer] = Field(default=None, description="Widget answer content")
    generative_ui_answer: Optional[AdvancedAnswer] = Field(default=None, description="Generative UI answer content")
