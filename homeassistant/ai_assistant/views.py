from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import requests
import json


def index(request):
    """AI Assistant main page view."""
    return render(request, 'ai_assistant/index.html')


@csrf_exempt
@require_http_methods(["GET"])
def proxy_conversations(request):
    """Proxy for getting conversations from API."""
    try:
        response = requests.get('http://localhost:8002/conversations')
        return JsonResponse(response.json(), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt 
@require_http_methods(["GET"])
def proxy_conversation_detail(request, conversation_id):
    """Proxy for getting conversation messages from API."""
    try:
        response = requests.get(f'http://localhost:8002/conversations/{conversation_id}')
        return JsonResponse(response.json(), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"]) 
def proxy_chat(request):
    """Proxy for sending chat messages to API."""
    try:
        data = json.loads(request.body)
        response = requests.post('http://localhost:8002/chat', json=data)
        return JsonResponse(response.json(), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def proxy_create_conversation(request):
    """Proxy for creating new conversation via API."""
    try:
        response = requests.post('http://localhost:8002/conversations/create', json={})
        return JsonResponse(response.json(), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
