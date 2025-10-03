"""
UI component models for rich chat interfaces
"""

from typing import Optional, List
from pydantic import BaseModel


class ButtonOption(BaseModel):
    """Interactive button in chat interface"""
    text: str
    command: Optional[str] = None


class DropdownOption(BaseModel):
    """Option in a dropdown menu"""
    label: str
    value: str
    command: Optional[str] = None


class ChecklistOption(BaseModel):
    """Item in a checklist"""
    label: str
    value: str
    checked: bool = False
    command: Optional[str] = None


class UIElements(BaseModel):
    """Collection of UI elements for rich chat interfaces"""
    dropdown: Optional[List[DropdownOption]] = None
    buttons: Optional[List[ButtonOption]] = None
    checklist: Optional[List[ChecklistOption]] = None


class Card(BaseModel):
    """Generic card component for displaying structured content"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    text: Optional[str] = None
    options: Optional[UIElements] = None


class NavigationCard(BaseModel):
    """Card for navigation and routing"""
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    buttons: Optional[List[ButtonOption]] = None


class ContactCard(BaseModel):
    """Card for displaying contact information"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    buttons: Optional[List[ButtonOption]] = None


class ToolCard(BaseModel):
    """Card for displaying available tools/functions"""
    name: str
    description: Optional[str] = None


class Metadata(BaseModel):
    """Rich metadata for chat messages with UI components"""
    cards: Optional[List[Card]] = None
    options: Optional[UIElements] = None
    tool_cards: Optional[List[ToolCard]] = None
    navigation_card: Optional[NavigationCard] = None
    contact_card: Optional[ContactCard] = None
    table: Optional[dict] = None
    elements: Optional[dict] = None
