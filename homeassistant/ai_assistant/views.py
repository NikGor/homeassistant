from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
import requests
import json
import os

# Backend API URLs from environment variables
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://archie-backend:8002')
AI_AGENT_URL = os.getenv('AI_AGENT_URL', 'http://archie-ai-agent:8005')


def add_cors_headers(response):
    """Add CORS headers to response."""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


def index(request):
    """AI Assistant main page view."""
    return render(request, 'ai_assistant/index.html')


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def proxy_conversations(request):
    """Proxy for getting conversations from API or creating new one."""
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        if request.method == 'GET':
            response = requests.get(f'{BACKEND_API_URL}/conversations')
        else:  # POST
            response = requests.post(f'{BACKEND_API_URL}/conversations', json={})
        json_response = JsonResponse(response.json(), safe=False)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt 
@require_http_methods(["GET", "DELETE", "OPTIONS"])
def proxy_conversation_detail(request, conversation_id):
    """Proxy for getting or deleting conversation details from API."""
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        if request.method == 'GET':
            response = requests.get(f'{BACKEND_API_URL}/conversations/{conversation_id}')
            json_response = JsonResponse(response.json(), safe=False)
        else:  # DELETE
            response = requests.delete(f'{BACKEND_API_URL}/conversations/{conversation_id}')
            json_response = JsonResponse({'success': True}, status=200)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def proxy_conversation_messages(request, conversation_id):
    """Proxy for getting messages for a specific conversation from API."""
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        response = requests.get(f'{BACKEND_API_URL}/messages?conversation_id={conversation_id}')
        json_response = JsonResponse(response.json(), safe=False)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def proxy_send_message(request):
    """Proxy for sending messages via AI Agent API."""
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


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def proxy_create_conversation(request):
    """Proxy for creating new conversation via API."""
    if request.method == 'OPTIONS':
        response = HttpResponse()
        return add_cors_headers(response)
        
    try:
        response = requests.post(f'{BACKEND_API_URL}/conversations', json={})
        json_response = JsonResponse(response.json(), safe=False)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({'error': str(e)}, status=500)
        return add_cors_headers(error_response)
