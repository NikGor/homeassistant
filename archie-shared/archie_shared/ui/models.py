"""
UI component models for rich chat interfaces
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class ButtonOption(BaseModel):
    """Interactive button in chat interface"""
    text: str = Field(description="Display text shown on the button")
    command: Optional[str] = Field(default=None, description="Command to execute when button is clicked")


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
    url: Optional[str] = Field(default=None, description="URL to navigate to when card is clicked")
    buttons: Optional[List[ButtonOption]] = Field(default=None, description="Action buttons within the navigation card")


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


class Metadata(BaseModel):
    """Rich metadata for chat messages with UI components"""
    cards: Optional[List[Card]] = Field(default=None, description="List of generic cards to display")
    options: Optional[UIElements] = Field(default=None, description="Interactive UI elements")
    tool_cards: Optional[List[ToolCard]] = Field(default=None, description="List of available tools/functions")
    navigation_card: Optional[NavigationCard] = Field(default=None, description="Navigation card for routing")
    contact_card: Optional[ContactCard] = Field(default=None, description="Contact information card")
    table: Optional[dict] = Field(default=None, description="Table data structure")
    elements: Optional[dict] = Field(default=None, description="Additional UI elements")
