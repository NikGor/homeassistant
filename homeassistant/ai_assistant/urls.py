from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='ai_assistant_index'),
    path('api/conversations/', views.proxy_conversations, name='proxy_conversations'),
    path('api/conversations/create/', views.proxy_create_conversation, name='proxy_create_conversation'),
    path('api/conversations/<str:conversation_id>/', views.proxy_conversation_detail, name='proxy_conversation_detail'),
    path('api/chat/', views.proxy_chat, name='proxy_chat'),
]
