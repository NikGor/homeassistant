from django.urls import path

from . import views

urlpatterns = [
    path("api/conversations/", views.proxy_conversations, name="proxy_conversations"),
    path(
        "api/conversations/<str:conversation_id>/",
        views.proxy_conversation_detail,
        name="proxy_conversation_detail",
    ),
    path(
        "api/conversations/<str:conversation_id>/messages/",
        views.proxy_conversation_messages,
        name="proxy_conversation_messages",
    ),
    path(
        "api/conversations/<str:conversation_id>/regenerate-title/",
        views.regenerate_title,
        name="regenerate_title",
    ),
    path("api/messages/", views.proxy_send_message, name="proxy_send_message"),
    path("api/chat/", views.proxy_chat, name="proxy_chat"),
    path("api/generate-title/", views.generate_title, name="generate_title"),
    path("api/process-images/", views.process_images, name="process_images"),
    path("api/save-message/", views.save_message, name="save_message"),
]
