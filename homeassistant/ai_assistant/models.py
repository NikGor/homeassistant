from django.db import models
from django.utils import timezone
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone as dt_timezone


class ButtonOption(BaseModel):
    """Button option for user interface"""
    text: str = Field(description="Text displayed on the button")
    command: Optional[str] = Field(None, description="Command to execute when clicked")
    # url: Optional[str] = Field(None, description="URL to navigate to when clicked")


class DropdownOption(BaseModel):
    """Option for dropdown menu"""
    label: str = Field(description="Display text for the option")
    value: str = Field(description="Value of the option")
    command: Optional[str] = Field(None, description="Command to execute when selected")
    # url: Optional[str] = Field(None, description="URL to navigate to when selected")
    

class ChecklistOption(BaseModel):
    """Checkbox option in a task list"""
    label: str = Field(description="Task text")
    value: str = Field(description="Task value")
    checked: bool = Field(False, description="Checkbox state (checked/unchecked)")
    command: Optional[str] = Field(None, description="Command to execute when state changes")
    # url: Optional[str] = Field(None, description="URL to navigate to when clicked")


class UIElements(BaseModel):
    """Collection of user interface elements"""
    dropdown: Optional[List[DropdownOption]] = Field(None, description="List of dropdown menu options")
    buttons: Optional[List[ButtonOption]] = Field(None, description="List of buttons")
    checklist: Optional[List[ChecklistOption]] = Field(None, description="List of checkbox tasks")


class Card(BaseModel):
    """Card with information and interactive elements"""
    title: Optional[str] = Field(None, description="Card title")
    subtitle: Optional[str] = Field(None, description="Card subtitle")
    # image_url: Optional[str] = Field(None, description="URL of the card image")
    options: Optional[UIElements] = Field(None, description="Interactive elements of the card")


class NavigationCard(BaseModel):
    """Navigation card for section transitions"""
    title: str = Field(description="Section name")
    description: str = Field(None, description="Section description")
    url: str = Field(None, description="google maps URL to start navigation")
    buttons: Optional[List[ButtonOption]] = Field(None, description="Navigation action buttons")


class ContactCard(BaseModel):
    """Contact information card"""
    name: str = Field(description="Contact name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    buttons: Optional[List[ButtonOption]] = Field(None, description="Contact action buttons")
    

class ToolCard(BaseModel):
    """Tool or function card"""
    name: str = Field(description="Tool name")
    description: Optional[str] = Field(None, description="Tool functionality description")
    # icon_url: Optional[str] = Field(None, description="URL of the tool icon")


class Metadata(BaseModel):
    """Metadata for enriching response with additional information"""
    # url: Optional[str] = Field(None, description="Main topic link")
    # image_url: Optional[str] = Field(None, description="URL of the main image")
    cards: Optional[List[Card]] = Field(None, description="List of information cards")
    options: Optional[UIElements] = Field(None, description="Interactive interface elements")
    tool_cards: Optional[List[ToolCard]] = Field(None, description="List of available tools")
    navigation_card: Optional[NavigationCard] = Field(None, description="Navigation card")


class LllmTrace(BaseModel):
    """LLM usage tracking information"""
    model: str = Field(description="Name of the LLM model used")
    input_tokens: int = Field(description="Number of input tokens consumed")
    output_tokens: int = Field(description="Number of output tokens generated")
    total_tokens: int = Field(description="Total number of tokens used")
    total_cost: float = Field(description="Total cost of the request")
    

class ChatMessage(BaseModel):
    """Chat message model for all communications"""
    message_id: Optional[str] = Field(None, description="Unique identifier for the message")
    role: Literal["user", "assistant", "system"] = Field(description="Role of the message sender")
    text_format: Literal["plain", "markdown", "html", "voice"] = Field("plain", description="Format of the message text")
    text: str = Field(description="Content of the message")
    metadata: Optional[Metadata] = Field(None, description="Additional metadata for the message")
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc), description="Timestamp when the message was created")
    conversation_id: Optional[str] = Field(None, description="ID of the conversation this message belongs to")
    llm_trace: Optional[LllmTrace] = Field(None, description="LLM usage tracking information")


class ConversationModel(BaseModel):
    """Conversation model containing multiple messages"""
    conversation_id: str = Field(description="Unique identifier for the conversation")
    messages: List[ChatMessage] = Field(description="List of messages in the conversation")
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc), description="Timestamp when the conversation was created")
    llm_trace: Optional[LllmTrace] = Field(None, description="Aggregated LLM usage tracking for the conversation")


class ChatRequest(BaseModel):
    """Chat request model for incoming messages"""
    role: Literal["user", "assistant", "system"] = Field(description="Role of the message sender")
    text: str = Field(description="Content of the message")
    text_format: Literal["plain", "markdown", "html", "voice"] = Field("plain", description="Format of the message text")
    conversation_id: Optional[str] = Field(None, description="ID of the conversation this message belongs to")


# Django models for database storage
class Conversation(models.Model):
    """Database model for chat conversations"""
    id = models.CharField(max_length=255, primary_key=True)
    title = models.CharField(max_length=255, default="Новый чат")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']


class Message(models.Model):
    """Database model for chat messages"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    TEXT_FORMAT_CHOICES = [
        ('plain', 'Plain Text'),
        ('markdown', 'Markdown'),
        ('html', 'HTML'),
        ('voice', 'Voice'),
    ]
    
    message_id = models.CharField(max_length=255, unique=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    text_format = models.CharField(max_length=20, choices=TEXT_FORMAT_CHOICES, default='plain')
    text = models.TextField()
    metadata = models.JSONField(null=True, blank=True)
    llm_trace = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['created_at']
        
    def to_chat_message(self) -> ChatMessage:
        """Convert Django model to Pydantic ChatMessage"""
        return ChatMessage(
            message_id=self.message_id,
            role=self.role,
            text_format=self.text_format,
            text=self.text,
            metadata=Metadata(**self.metadata) if self.metadata else None,
            created_at=self.created_at,
            conversation_id=self.conversation.id,
            llm_trace=LllmTrace(**self.llm_trace) if self.llm_trace else None
        )
