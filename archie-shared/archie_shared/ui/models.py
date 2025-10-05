"""
UI component models for rich chat interfaces
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class ButtonOption(BaseModel):
    """Interactive button in chat interface"""
    text: str = Field(description="Display text shown on the button")
    command: str = Field(description="Command to execute when button is clicked")
    assistant_response: str = Field(description="Response back to assistant when button is clicked")


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
    dropdown: Optional[List[DropdownOption]] = Field(default=None, description="List of dropdown menu options")
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="List of interactive buttons")
    checklist: Optional[List[ChecklistOption]] = Field(default=None, description="List of checklist items")


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

class Metadata(BaseModel):
    """Rich metadata for chat messages with UI components"""
    cards: Optional[List[Card]] = Field(default=None, description="List of generic cards to display")
    options: Optional[UIElements] = Field(default=None, description="Interactive UI elements")
    tool_cards: Optional[List[ToolCard]] = Field(default=None, description="List of available tools/functions")
    navigation_card: List[NavigationCard] = Field(default_factory=list, description="List of navigation cards")
    contact_card: List[ContactCard] = Field(default_factory=list, description="List of contact information cards")
    table: Optional[Table] = Field(default=None, description="Table data structure")
    elements: List[ElementsItem] = Field(default_factory=list, description="List of key-value pairs for additional info")
