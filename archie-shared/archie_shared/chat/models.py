"""
Chat models for AI Assistant conversations
"""

from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone as dt_timezone


class InputTokensDetails(BaseModel):
    """Details about input token usage"""
    cached_tokens: int = 0


class OutputTokensDetails(BaseModel):
    """Details about output token usage"""
    reasoning_tokens: int = 0


class LllmTrace(BaseModel):
    """Complete LLM usage trace for cost tracking and analytics"""
    
    model: str
    input_tokens: int
    input_tokens_details: InputTokensDetails = InputTokensDetails()
    output_tokens: int
    output_tokens_details: OutputTokensDetails = OutputTokensDetails()
    total_tokens: int
    total_cost: float = 0.0


class ChatMessage(BaseModel):
    """Individual chat message in a conversation"""
    
    message_id: Optional[str] = None
    role: Literal["user", "assistant", "system"]
    text_format: Literal["plain", "markdown", "html", "voice"] = "plain"
    text: str
    metadata: Optional["Metadata"] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc))
    conversation_id: Optional[str] = None
    previous_message_id: Optional[str] = None
    model: Optional[str] = None
    llm_trace: Optional[LllmTrace] = None


class ConversationModel(BaseModel):
    """Complete conversation with messages and metadata"""
    
    conversation_id: str
    title: str = "New Conversation"
    messages: Optional[List[ChatMessage]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc))
    llm_trace: Optional[LllmTrace] = None
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.messages:
            # Calculate aggregated LLM trace using utils
            from .utils import calculate_conversation_llm_trace
            self.llm_trace = calculate_conversation_llm_trace(self.messages)


class ChatRequest(BaseModel):
    """Request to send a chat message"""
    
    role: Literal["user", "assistant", "system"]
    text: str
    text_format: Literal["plain", "markdown", "html", "voice"] = "plain"
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    previous_message_id: Optional[str] = None
    model: Optional[str] = None


class ConversationRequest(BaseModel):
    """Request model for creating a new conversation"""
    
    conversation_id: Optional[str] = Field(
        None,
        description="Optional custom conversation ID. If not provided, will be auto-generated",
    )
    title: Optional[str] = Field(
        "New Conversation", description="Title of the conversation"
    )

class ConversationResponse(BaseModel):
    """Response model for conversation creation"""
    
    conversation_id: str = Field(description="ID of the created conversation")
    title: str = Field(description="Title of the conversation")
    created_at: datetime = Field(
        description="Timestamp when the conversation was created"
    )
    message: str = Field(
        "Conversation created successfully", description="Success message"
    )

class MessageResponse(BaseModel):
    """Response model for message creation"""
    
    message_id: str = Field(description="ID of the created message")
    conversation_id: str = Field(description="ID of the conversation")
    created_at: datetime = Field(description="Timestamp when the message was created")
    message: str = Field("Message created successfully", description="Success message")

class ChatHistoryMessage(BaseModel):
    """Simplified message model for chat history"""
    
    role: Literal["user", "assistant", "system"] = Field(
        description="Role of the message sender"
    )
    text: str = Field(description="Content of the message (cleaned to plain text)")
    metadata: Optional[dict] = Field(  # Изменил с metadata_json на metadata
        None, description="Additional metadata for the message"
    )

class ChatHistoryResponse(BaseModel):
    """Response model for chat history endpoint"""
    
    messages: List[ChatHistoryMessage] = Field(
        description="List of messages in the conversation"
    )

# Forward references
from ..ui.models import Metadata

# Update forward references
ChatMessage.model_rebuild()
ConversationModel.model_rebuild()
