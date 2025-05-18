from django.http import JsonResponse
from django.views import View
from django.shortcuts import render

# Create your views here.

class ChatView(View):
    def get(self, request):
        return JsonResponse({'message': 'GET method is available at /api/chat'})

    def post(self, request):
        return JsonResponse({'message': 'Hello from /chat endpoint!'})
