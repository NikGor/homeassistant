from django.db import models
from django.utils import timezone
import uuid
import sys
import os
from archie_shared.chat.models import (
    ConversationModel, 
    LllmTrace, 
    ChatMessage, 
    InputTokensDetails, 
    OutputTokensDetails
)
from archie_shared.ui.models import Metadata

class Conversation(models.Model):
    """Django model for storing conversations in PostgreSQL"""
    
    conversation_id = models.CharField(
        max_length=255,
        primary_key=True, 
        db_index=True
    )
    title = models.TextField(default="New Conversation")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # LLM Trace fields - expanded set
    total_input_tokens = models.IntegerField(default=0)
    total_input_cached_tokens = models.IntegerField(default=0)
    total_output_tokens = models.IntegerField(default=0)
    total_output_reasoning_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    total_cost = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'ai_assistant_conversation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['conversation_id']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.conversation_id})"
    
    def to_conversation_model(self):
        """Convert Django model to Pydantic model"""
        
        
        messages = [msg.to_chat_message() for msg in self.messages.all()]
        
        return ConversationModel(
            conversation_id=str(self.conversation_id),
            title=self.title,
            messages=messages,
            created_at=self.created_at,
            llm_trace=LllmTrace(
                model="aggregate",
                input_tokens=self.total_input_tokens,
                output_tokens=self.total_output_tokens,
                total_tokens=self.total_tokens,
                total_cost=float(self.total_cost)
            ) if self.total_tokens > 0 else None
        )


class Message(models.Model):
    """Django model for storing chat messages in PostgreSQL"""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    TEXT_FORMAT_CHOICES = [
        ('plain', 'Plain'),
        ('markdown', 'Markdown'),
        ('html', 'HTML'),
        ('voice', 'Voice'),
    ]
    
    message_id = models.CharField(max_length=255, primary_key=True, db_index=True)
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages',
        db_index=True,
        to_field='conversation_id'
    )
    role = models.TextField()
    text_format = models.TextField(default='plain')
    text = models.TextField()
    metadata_json = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    previous_message_id = models.CharField(max_length=255, null=True, blank=True)
    model = models.TextField(null=True, blank=True)
    
    # LLM Trace fields - expanded set
    llm_model = models.TextField(null=True, blank=True)
    llm_trace = models.JSONField(null=True, blank=True)
    input_tokens = models.IntegerField(null=True, blank=True)
    input_cached_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(null=True, blank=True)
    output_reasoning_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(null=True, blank=True)
    total_cost = models.FloatField(null=True, blank=True)
    
    class Meta:
        db_table = 'ai_assistant_message'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['message_id']),
            models.Index(fields=['role']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.role}: {self.text[:50]}..." if len(self.text) > 50 else f"{self.role}: {self.text}"
    
    def to_chat_message(self):
        """Convert Django model to Pydantic model"""
        metadata = None
        if self.metadata_json:
            try:
                metadata = Metadata(**self.metadata_json)
            except Exception:
                metadata = None
        
        llm_trace = None
        if self.input_tokens is not None and self.output_tokens is not None:
            llm_trace = LllmTrace(
                model=self.llm_model or "",
                input_tokens=self.input_tokens,
                input_tokens_details=InputTokensDetails(cached_tokens=self.input_cached_tokens),
                output_tokens=self.output_tokens,
                output_tokens_details=OutputTokensDetails(reasoning_tokens=self.output_reasoning_tokens),
                total_tokens=self.total_tokens or (self.input_tokens + self.output_tokens),
                total_cost=float(self.total_cost) if self.total_cost else 0.0
            )
        
        return ChatMessage(
            message_id=str(self.message_id),
            role=self.role,
            text_format=self.text_format,
            text=self.text,
            metadata=metadata,
            created_at=self.created_at,
            conversation_id=str(self.conversation.conversation_id),
            previous_message_id=str(self.previous_message_id) if self.previous_message_id else None,
            model=self.model,
            llm_trace=llm_trace
        )
