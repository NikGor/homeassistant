from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import requests
import json
import os
import uuid
import logging
from .models import Conversation, Message

# AI Agent URL - keep for AI functionality
AI_AGENT_URL = os.getenv('AI_AGENT_URL', 'http://archie-ai-agent:8005')

# Setup logging
logger = logging.getLogger(__name__)


def add_cors_headers(response):
    """Add CORS headers to response."""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def proxy_conversations(request):
    """Get conversations from Django DB or create new one (lazy)."""
    logger.info("ai_assistant_001: Processing conversations request")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
    
    try:
        if request.method == 'GET':
            logger.info("ai_assistant_002: Fetching conversations from Django DB")
            # Get all conversations from Django models
            conversations = Conversation.objects.all().order_by('-created_at')
            
            # Convert to Pydantic models for API compatibility
            conversation_data = []
            for conv in conversations:
                pydantic_conv = conv.to_conversation_model()
                conversation_data.append(pydantic_conv.model_dump())
            
            logger.info(f"ai_assistant_003: Found {len(conversation_data)} conversations")
            json_response = JsonResponse(conversation_data, safe=False)
            
        else:  # POST - create new conversation (LAZY)
            logger.info("ai_assistant_004: Generating new conversation ID (lazy creation)")
            
            # Parse request data
            data = json.loads(request.body) if request.body else {}
            title = data.get('title', 'New Conversation')
            
            # Generate ID but DO NOT save to DB yet
            # The conversation will be saved only when the first message is sent
            conversation_id = str(uuid.uuid4())
            
            # Return structure as if it exists
            response_data = {
                "conversation_id": conversation_id,
                "title": title,
                "messages": [],
                "created_at": timezone.now().isoformat(),
                "updated_at": timezone.now().isoformat(),
                "total_tokens": 0,
                "total_cost": 0.0,
                "llm_trace": None
            }
            
            logger.info(f"ai_assistant_005: Generated lazy conversation ID {conversation_id}")
            json_response = JsonResponse(response_data)
            
        return add_cors_headers(json_response)
        
    except Exception as e:
        logger.error(f"ai_assistant_error_001: Failed to process conversations: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt 
@require_http_methods(["GET", "DELETE", "OPTIONS"])
def proxy_conversation_detail(request, conversation_id):
    """Get or delete conversation details from Django DB."""
    logger.info(f"ai_assistant_006: Processing conversation {conversation_id} detail request")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
    
    try:
        if request.method == 'GET':
            logger.info(f"ai_assistant_007: Getting conversation {conversation_id} from Django DB")
            
            # Get conversation from Django models
            conversation = Conversation.objects.get(conversation_id=conversation_id)
            
            # Convert to Pydantic model for API compatibility
            pydantic_conv = conversation.to_conversation_model()
            json_response = JsonResponse(pydantic_conv.model_dump())
            
        else:  # DELETE
            logger.info(f"ai_assistant_008: Deleting conversation {conversation_id} from Django DB")
            
            # Delete conversation and all related messages
            conversation = Conversation.objects.get(conversation_id=conversation_id)
            conversation.delete()
            
            json_response = JsonResponse({'success': True, 'message': f'Conversation {conversation_id} deleted'})
            
        return add_cors_headers(json_response)
        
    except Conversation.DoesNotExist:
        logger.error(f"ai_assistant_error_002: Conversation {conversation_id} not found")
        error_response = JsonResponse({'error': 'Conversation not found'}, status=404)
        return add_cors_headers(error_response)
        
    except Exception as e:
        logger.error(f"ai_assistant_error_003: Failed to process conversation detail: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def proxy_conversation_messages(request, conversation_id):
    """Get messages for a specific conversation from Django DB."""
    logger.info(f"ai_assistant_009: Processing messages request for conversation {conversation_id}")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
    
    try:
        logger.info(f"ai_assistant_010: Fetching messages for conversation {conversation_id} from Django DB")
        
        # Get messages from Django models
        messages = Message.objects.filter(conversation__conversation_id=conversation_id).order_by('created_at')
        
        # Convert to Pydantic models for API compatibility
        message_data = []
        for msg in messages:
            pydantic_msg = msg.to_chat_message()
            msg_dict = pydantic_msg.model_dump()
            logger.info(f"ai_assistant_011a: Message {msg.message_id} dict keys: {msg_dict.keys()}")
            logger.info(f"ai_assistant_011b: Message content keys: {msg_dict.get('content', {}).keys() if isinstance(msg_dict.get('content'), dict) else 'NOT A DICT'}")
            if msg_dict.get('content', {}).get('ui_answer'):
                logger.info(f"ai_assistant_011c: Message has ui_answer with {len(msg_dict['content']['ui_answer'].get('items', []))} items")
            message_data.append(msg_dict)
        
        logger.info(f"ai_assistant_011: Found {len(message_data)} messages for conversation {conversation_id}")
        json_response = JsonResponse(message_data, safe=False)
        return add_cors_headers(json_response)
        
    except Exception as e:
        logger.error(f"ai_assistant_error_004: Failed to get conversation messages: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def proxy_send_message(request):
    """Send message to AI Agent and save to Django DB."""
    logger.info("ai_assistant_012: Processing send message request")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        data = json.loads(request.body)
        conversation_id = data.get('conversation_id')
        user_input = data.get('input')
        
        if not conversation_id:
            raise ValueError("conversation_id is required")
            
        # 1. Check/Create Conversation
        try:
            conversation = Conversation.objects.get(conversation_id=conversation_id)
        except Conversation.DoesNotExist:
            logger.info(f"ai_assistant_013: Creating new conversation {conversation_id} on first message")
            conversation = Conversation.objects.create(
                conversation_id=conversation_id,
                title=f"Chat {timezone.now().strftime('%Y-%m-%d %H:%M')}"
            )
            
        # 2. Save User Message
        user_message_id = str(uuid.uuid4())
        user_content = {
            "content_format": "plain",
            "text": user_input
        }
        
        Message.objects.create(
            message_id=user_message_id,
            conversation=conversation,
            role="user",
            content=user_content,
            created_at=timezone.now()
        )
        logger.info(f"ai_assistant_014: Saved user message {user_message_id}")
        
        # 3. Call AI Agent
        logger.info("ai_assistant_015: Calling AI Agent")
        ai_response = requests.post(f'{AI_AGENT_URL}/chat', json=data)
        ai_response.raise_for_status()
        ai_data = ai_response.json()
        
        # 4. Save Assistant Message
        # AI Agent returns a Message object structure
        assistant_message_id = ai_data.get('message_id', str(uuid.uuid4()))
        assistant_content = ai_data.get('content', {})
        assistant_llm_trace = ai_data.get('llm_trace', {})
        
        # Extract token usage if available
        input_tokens = None
        output_tokens = None
        total_tokens = None
        total_cost = None
        
        if assistant_llm_trace:
            input_tokens = assistant_llm_trace.get('input_tokens')
            output_tokens = assistant_llm_trace.get('output_tokens')
            total_tokens = assistant_llm_trace.get('total_tokens')
            total_cost = assistant_llm_trace.get('total_cost')
            
            # Update conversation stats
            if total_tokens:
                conversation.total_tokens += total_tokens
                conversation.total_input_tokens += input_tokens or 0
                conversation.total_output_tokens += output_tokens or 0
                conversation.total_cost += total_cost or 0.0
                conversation.save()
        
        Message.objects.create(
            message_id=assistant_message_id,
            conversation=conversation,
            role="assistant",
            content=assistant_content,
            created_at=timezone.now(),
            llm_trace=assistant_llm_trace,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            total_cost=total_cost
        )
        logger.info(f"ai_assistant_016: Saved assistant message {assistant_message_id}")
        
        json_response = JsonResponse(ai_data, safe=False)
        return add_cors_headers(json_response)
        
    except Exception as e:
        logger.error(f"ai_assistant_error_005: Failed to send message: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"]) 
def proxy_chat(request):
    """Proxy for sending chat messages to API."""
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        data = json.loads(request.body)
        response = requests.post(f'{AI_AGENT_URL}/chat', json=data)
        json_response = JsonResponse(response.json(), safe=False)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)



