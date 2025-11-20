from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone as dt_timezone
from ..ui.models import Content

class InputTokensDetails(BaseModel):
    """Details about input token usage"""
    cached_tokens: int = Field(default=0, description="Number of cached tokens used")


class OutputTokensDetails(BaseModel):
    """Details about output token usage"""
    reasoning_tokens: int = Field(default=0, description="Number of reasoning tokens generated")


class LllmTrace(BaseModel):
    """Complete LLM usage trace for cost tracking and analytics"""  
    model: str = Field(description="Name of the LLM model used")
    input_tokens: int = Field(description="Number of input tokens processed")
    input_tokens_details: InputTokensDetails = Field(default_factory=InputTokensDetails, description="Details about input token usage")
    output_tokens: int = Field(description="Number of output tokens generated")
    output_tokens_details: OutputTokensDetails = Field(default_factory=OutputTokensDetails, description="Details about output token usage")
    total_tokens: int = Field(description="Total number of tokens used")
    total_cost: float = Field(default=0.0, description="Total cost of the API call")


class ChatMessage(BaseModel):
    """Individual chat message in a conversation"""
    message_id: Optional[str] = Field(default=None, description="Unique identifier for the message")
    role: Literal["user", "assistant", "system"] = Field(description="Role of the message sender")
    content: Content = Field(description="Structured content of the message")
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc), description="Timestamp when the message was created")
    conversation_id: Optional[str] = Field(default=None, description="ID of the conversation this message belongs to")
    previous_message_id: Optional[str] = Field(default=None, description="ID of the previous message for threading")
    model: Optional[str] = Field(default=None, description="LLM model used to generate this message")
    llm_trace: Optional[LllmTrace] = Field(default=None, description="LLM usage trace for this message")


class Conversation(BaseModel):
    """Complete conversation with messages and metadata"""
    conversation_id: str = Field(description="Unique identifier for the conversation")
    title: str = Field(default="New Conversation", description="Title of the conversation")
    messages: Optional[List[ChatMessage]] = Field(default=None, description="List of messages in the conversation")
    created_at: datetime = Field(default_factory=lambda: datetime.now(dt_timezone.utc), description="Timestamp when the conversation was created")
    llm_trace: Optional[LllmTrace] = Field(default=None, description="Aggregated LLM usage trace for the conversation")
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(dt_timezone.utc),
        description="Timestamp when the conversation was last updated"
    )
    total_input_tokens: int = Field(
        default=0, description="Total input tokens used in this conversation"
    )
    total_output_tokens: int = Field(
        default=0, description="Total output tokens generated in this conversation" 
    )
    total_tokens: int = Field(
        default=0, description="Total tokens used in this conversation"
    )
    total_cost: float = Field(
        default=0.0, description="Total cost of this conversation"
    )
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.messages:
            # Calculate aggregated LLM trace using utils
            from .utils import calculate_conversation_llm_trace
            self.llm_trace = calculate_conversation_llm_trace(self.messages)


class ChatRequest(BaseModel):
    """Request to send a chat message"""
    user_name: Optional[str] = Field(description="Name of the user sending the request")
    response_format: Literal[
        "plain", "markdown", "html", "ssml", 
        "json", "csv", "xml", "yaml", "prompt",
        "python", "bash", "sql", "regex", 
        "dockerfile", "makefile", "ui_answer",
        "dashboard", "widget"
    ] = Field(default="plain", description="Format of response expected from the agent")
    input: str = Field(description="Text content of the request")
    conversation_id: Optional[str] = Field(default=None, description="ID of the conversation")
    previous_message_id: Optional[str] = Field(default=None, description="ID of the previous message for threading")
    model: Optional[str] = Field(default=None, description="LLM model to use for the request")


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
    content: Content = Field(description="Structured content of the message")

class ChatHistoryResponse(BaseModel):
    """Response model for chat history endpoint"""
    
    messages: List[ChatHistoryMessage] = Field(
        description="List of messages in the conversation"
    )



# Update forward references
ChatMessage.model_rebuild()
Conversation.model_rebuild()
