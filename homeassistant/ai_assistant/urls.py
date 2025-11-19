from django.urls import path
from . import views

urlpatterns = [
    path('api/conversations/', views.proxy_conversations, name='proxy_conversations'),
    path('api/conversations/<str:conversation_id>/', views.proxy_conversation_detail, name='proxy_conversation_detail'),
    path('api/conversations/<str:conversation_id>/messages/', views.proxy_conversation_messages, name='proxy_conversation_messages'),
    path('api/messages/', views.proxy_send_message, name='proxy_send_message'),
    path('api/chat/', views.proxy_chat, name='proxy_chat'),
]
