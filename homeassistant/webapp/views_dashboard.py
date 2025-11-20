from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging

logger = logging.getLogger(__name__)


def add_cors_headers(response):
    """Add CORS headers to response"""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def dashboard_action(request):
    """
    Handle dashboard button clicks by transforming to ChatRequest.
    
    Frontend sends:
    {
        "user_name": "Niko",
        "assistant_request": "Turn off all home lights."
    }
    
    Backend transforms and proxies to ai_assistant.views.proxy_chat
    """
    logger.info("dashboard_001: Processing dashboard action request")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
    
    try:
        data = json.loads(request.body)
        user_name = data.get('user_name', 'Niko')
        assistant_request = data.get('assistant_request')
        
        if not assistant_request:
            raise ValueError("assistant_request is required")
        
        logger.info(f"dashboard_002: User \033[36m{user_name}\033[0m requested: \033[33m{assistant_request}\033[0m")
        
        # Import here to avoid circular imports
        from homeassistant.ai_assistant.views import proxy_chat
        
        # Build ChatRequest for AI agent
        chat_request = {
            "user_name": user_name,
            "response_format": "dashboard",
            "input": assistant_request,
            "model": "gpt-4o",
            "conversation_id": None,
            "previous_message_id": None
        }
        
        # Create new request with ChatRequest body
        from django.test import RequestFactory
        factory = RequestFactory()
        chat_request_obj = factory.post(
            '/ai-assistant/api/chat/',
            data=json.dumps(chat_request),
            content_type='application/json'
        )
        
        logger.info("dashboard_003: Proxying to ai_assistant.proxy_chat")
        response = proxy_chat(chat_request_obj)
        
        # Extract dashboard from response
        response_data = json.loads(response.content)
        content = response_data.get('content', {})
        dashboard = content.get('dashboard')
        
        if not dashboard:
            logger.error("dashboard_error_001: No dashboard in AI response")
            raise ValueError("AI agent did not return dashboard")
        
        logger.info("dashboard_004: Returning updated dashboard to frontend")
        json_response = JsonResponse(dashboard)
        return add_cors_headers(json_response)
        
    except Exception as e:
        logger.error(f"dashboard_error_002: Failed to process dashboard action: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def dashboard_initial(request):
    """
    Get initial dashboard state.
    """
    logger.info("dashboard_005: Fetching initial dashboard state")
    
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
    
    try:
        user_name = request.GET.get('user_name', 'Niko')
        
        # Import here to avoid circular imports
        from homeassistant.ai_assistant.views import proxy_chat
        
        # Build ChatRequest for initial dashboard
        chat_request = {
            "user_name": user_name,
            "response_format": "dashboard",
            "input": "Show me my dashboard",
            "model": "gpt-4o",
            "conversation_id": None,
            "previous_message_id": None
        }
        
        # Create new request with ChatRequest body
        from django.test import RequestFactory
        factory = RequestFactory()
        chat_request_obj = factory.post(
            '/ai-assistant/api/chat/',
            data=json.dumps(chat_request),
            content_type='application/json'
        )
        
        logger.info(f"dashboard_006: Requesting initial dashboard for user \033[36m{user_name}\033[0m")
        response = proxy_chat(chat_request_obj)
        
        # Extract dashboard from response
        response_data = json.loads(response.content)
        content = response_data.get('content', {})
        dashboard = content.get('dashboard')
        
        if not dashboard:
            logger.error("dashboard_error_003: No dashboard in initial AI response")
            raise ValueError("AI agent did not return dashboard")
        
        logger.info("dashboard_007: Returning initial dashboard to frontend")
        json_response = JsonResponse(dashboard)
        return add_cors_headers(json_response)
        
    except Exception as e:
        logger.error(f"dashboard_error_004: Failed to get initial dashboard: {e}")
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)
