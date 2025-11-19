from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        'conversation_id',
        'title',
        'created_at',
        'updated_at',
        'total_tokens',
        'total_cost'
    )
    list_filter = ('created_at', 'updated_at')
    search_fields = ('conversation_id', 'title')
    readonly_fields = (
        'conversation_id',
        'created_at',
        'updated_at',
        'total_input_tokens',
        'total_input_cached_tokens',
        'total_output_tokens',
        'total_output_reasoning_tokens',
        'total_tokens',
        'total_cost'
    )
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('conversation_id', 'title', 'created_at', 'updated_at')
        }),
        ('LLM Trace', {
            'fields': (
                'total_input_tokens',
                'total_input_cached_tokens',
                'total_output_tokens',
                'total_output_reasoning_tokens',
                'total_tokens',
                'total_cost'
            )
        })
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        'message_id',
        'conversation',
        'role',
        'created_at',
        'total_tokens',
        'total_cost'
    )
    list_filter = ('role', 'created_at', 'llm_model')
    search_fields = ('message_id', 'conversation__conversation_id', 'conversation__title')
    readonly_fields = (
        'message_id',
        'created_at',
        'input_tokens',
        'input_cached_tokens',
        'output_tokens',
        'output_reasoning_tokens',
        'total_tokens',
        'total_cost'
    )
    ordering = ('-created_at',)
    raw_id_fields = ('conversation',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('message_id', 'conversation', 'role', 'created_at', 'previous_message_id', 'model')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('LLM Trace', {
            'fields': (
                'llm_model',
                'input_tokens',
                'input_cached_tokens',
                'output_tokens',
                'output_reasoning_tokens',
                'total_tokens',
                'total_cost',
                'llm_trace'
            )
        })
    )
