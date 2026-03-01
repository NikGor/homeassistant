import asyncio
import json
import logging
import os
import uuid

import requests
from asgiref.sync import async_to_sync
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .image_processor import process_images_in_ui_answer
from .models import Conversation, Message

# AI Agent URL - keep for AI functionality
AI_AGENT_URL = os.getenv("AI_AGENT_URL", "http://archie-ai-agent:8005")

# Setup logging
logger = logging.getLogger(__name__)


def add_cors_headers(response):
    """Add CORS headers to response."""
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def proxy_conversations(request):
    """Get conversations from Django DB or create new one (lazy)."""
    logger.info("ai_assistant_001: Processing conversations request")

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        if request.method == "GET":
            logger.info("ai_assistant_002: Fetching conversations from Django DB")
            # Get all conversations from Django models (metadata only, no messages)
            conversations = Conversation.objects.all().order_by("-created_at")

            # Return lightweight data without messages
            conversation_data = []
            for conv in conversations:
                conversation_data.append(
                    {
                        "conversation_id": conv.conversation_id,
                        "title": conv.title,
                        "created_at": conv.created_at.isoformat(),
                        "updated_at": (
                            conv.updated_at.isoformat()
                            if conv.updated_at
                            else conv.created_at.isoformat()
                        ),
                        "total_tokens": conv.total_tokens,
                        "total_cost": (
                            float(conv.total_cost) if conv.total_cost else 0.0
                        ),
                    }
                )

            logger.info(
                f"ai_assistant_003: Found {len(conversation_data)} conversations"
            )
            json_response = JsonResponse(conversation_data, safe=False)

        else:  # POST - create new conversation (LAZY)
            logger.info(
                "ai_assistant_004: Generating new conversation ID (lazy creation)"
            )

            # Parse request data
            data = json.loads(request.body) if request.body else {}
            title = data.get("title", "New Conversation")

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
                "llm_trace": None,
            }

            logger.info(
                f"ai_assistant_005: Generated lazy conversation ID {conversation_id}"
            )
            json_response = JsonResponse(response_data)

        return add_cors_headers(json_response)

    except Exception as e:
        logger.error(f"ai_assistant_error_001: Failed to process conversations: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "DELETE", "PATCH", "OPTIONS"])
def proxy_conversation_detail(request, conversation_id):
    """Get, update or delete conversation details from Django DB."""
    logger.info(
        f"ai_assistant_006: Processing conversation {conversation_id} detail request"
    )

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        if request.method == "GET":
            logger.info(
                f"ai_assistant_007: Getting conversation {conversation_id} from Django DB"
            )

            # Get conversation from Django models
            conversation = Conversation.objects.get(conversation_id=conversation_id)

            # Convert to Pydantic model for API compatibility
            pydantic_conv = conversation.to_conversation_model()
            json_response = JsonResponse(pydantic_conv.model_dump())

        elif request.method == "PATCH":
            logger.info(f"ai_assistant_007b: Updating conversation {conversation_id}")

            data = json.loads(request.body)
            conversation = Conversation.objects.get(conversation_id=conversation_id)

            if "title" in data:
                conversation.title = data["title"]
                conversation.save()

            pydantic_conv = conversation.to_conversation_model()
            json_response = JsonResponse(pydantic_conv.model_dump())

        else:  # DELETE
            logger.info(
                f"ai_assistant_008: Deleting conversation {conversation_id} from Django DB"
            )

            # Delete conversation and all related messages
            conversation = Conversation.objects.get(conversation_id=conversation_id)
            conversation.delete()

            json_response = JsonResponse(
                {"success": True, "message": f"Conversation {conversation_id} deleted"}
            )

        return add_cors_headers(json_response)

    except Conversation.DoesNotExist:
        logger.error(
            f"ai_assistant_error_002: Conversation {conversation_id} not found"
        )
        error_response = JsonResponse({"error": "Conversation not found"}, status=404)
        return add_cors_headers(error_response)

    except Exception as e:
        logger.error(
            f"ai_assistant_error_003: Failed to process conversation detail: {e}"
        )
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def proxy_conversation_messages(request, conversation_id):
    """Get messages for a specific conversation from Django DB."""
    logger.info(
        f"ai_assistant_009: Processing messages request for conversation {conversation_id}"
    )

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        logger.info(
            f"ai_assistant_010: Fetching messages for conversation {conversation_id} from Django DB"
        )

        # Get messages from Django models
        messages = Message.objects.filter(
            conversation__conversation_id=conversation_id
        ).order_by("created_at")

        # Convert to Pydantic models for API compatibility
        message_data = []
        for msg in messages:
            pydantic_msg = msg.to_chat_message()
            msg_dict = pydantic_msg.model_dump()
            logger.info(
                f"ai_assistant_011a: Message {msg.message_id} dict keys: {msg_dict.keys()}"
            )
            logger.info(
                f"ai_assistant_011b: Message content keys: {msg_dict.get('content', {}).keys() if isinstance(msg_dict.get('content'), dict) else 'NOT A DICT'}"
            )
            if msg_dict.get("content", {}).get("ui_answer"):
                logger.info(
                    f"ai_assistant_011c: Message has ui_answer with {len(msg_dict['content']['ui_answer'].get('items', []))} items"
                )
            message_data.append(msg_dict)

        logger.info(
            f"ai_assistant_011: Found {len(message_data)} messages for conversation {conversation_id}"
        )
        json_response = JsonResponse(message_data, safe=False)
        return add_cors_headers(json_response)

    except Exception as e:
        logger.error(
            f"ai_assistant_error_004: Failed to get conversation messages: {e}"
        )
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def proxy_send_message(request):
    """Send message to AI Agent and save to Django DB."""
    logger.info("ai_assistant_012: Processing send message request")

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        data = json.loads(request.body)
        conversation_id = data.get("conversation_id")
        user_input = data.get("input")

        if not conversation_id:
            raise ValueError("conversation_id is required")

        # 1. Check/Create Conversation
        try:
            conversation = Conversation.objects.get(conversation_id=conversation_id)
        except Conversation.DoesNotExist:
            logger.info(
                f"ai_assistant_013: Creating new conversation {conversation_id} on first message"
            )
            conversation = Conversation.objects.create(
                conversation_id=conversation_id,
                title=f"Chat {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            )

        # 2. Save User Message
        user_message_id = str(uuid.uuid4())
        user_content = {"content_format": "plain", "text": user_input}

        Message.objects.create(
            message_id=user_message_id,
            conversation=conversation,
            role="user",
            content=user_content,
            created_at=timezone.now(),
        )
        logger.info(f"ai_assistant_014: Saved user message {user_message_id}")

        # 3. Call AI Agent
        logger.info("ai_assistant_015: Calling AI Agent")
        ai_response = requests.post(f"{AI_AGENT_URL}/chat", json=data)
        ai_response.raise_for_status()
        ai_data = ai_response.json()

        # 3.5 Process images if ui_answer exists
        assistant_content = ai_data.get("content", {})
        if assistant_content.get(
            "content_format"
        ) == "ui_answer" and assistant_content.get("ui_answer"):
            logger.info("ai_assistant_015a: Processing images in ui_answer")
            try:
                ui_answer = assistant_content["ui_answer"]
                processed_ui_answer = async_to_sync(process_images_in_ui_answer)(
                    ui_answer
                )
                assistant_content["ui_answer"] = processed_ui_answer
                ai_data["content"] = assistant_content
            except Exception as img_error:
                logger.error(
                    f"ai_assistant_error_006: Image processing failed: {img_error}"
                )

        # 4. Save Assistant Message
        # AI Agent returns a Message object structure
        assistant_message_id = ai_data.get("message_id", str(uuid.uuid4()))
        assistant_llm_trace = ai_data.get("llm_trace", {})

        # Extract token usage if available
        input_tokens = None
        output_tokens = None
        total_tokens = None
        total_cost = None

        if assistant_llm_trace:
            input_tokens = assistant_llm_trace.get("input_tokens")
            output_tokens = assistant_llm_trace.get("output_tokens")
            total_tokens = assistant_llm_trace.get("total_tokens")
            total_cost = assistant_llm_trace.get("total_cost")

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
            total_cost=total_cost,
        )
        logger.info(f"ai_assistant_016: Saved assistant message {assistant_message_id}")

        json_response = JsonResponse(ai_data, safe=False)
        return add_cors_headers(json_response)

    except Exception as e:
        logger.error(f"ai_assistant_error_005: Failed to send message: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def proxy_chat(request):
    """Proxy for sending chat messages to API."""
    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        data = json.loads(request.body)
        response = requests.post(f"{AI_AGENT_URL}/chat", json=data)
        json_response = JsonResponse(response.json(), safe=False)
        return add_cors_headers(json_response)
    except Exception as e:
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def generate_title(request):
    """Generate a short title for a conversation based on user message."""
    logger.info("ai_assistant_020: Processing generate title request")

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        data = json.loads(request.body)
        user_message = data.get("message", "")

        if not user_message:
            error_response = JsonResponse({"error": "Message is required"}, status=400)
            return add_cors_headers(error_response)

        # Call AI Agent to generate title
        ai_request = {
            "user_name": "system",
            "response_format": "plain",
            "input": f'Generate a short title (3-5 words, no quotes, no emoji) for a conversation that starts with: "{user_message}"',
        }

        response = requests.post(f"{AI_AGENT_URL}/chat", json=ai_request, timeout=30)

        if response.status_code == 200:
            ai_data = response.json()
            title = ai_data.get("content", {}).get("text", "").strip()
            # Clean up title
            title = title.strip("\"'")
            if len(title) > 50:
                title = title[:47] + "..."

            logger.info(f"ai_assistant_021: Generated title: {title}")
            json_response = JsonResponse({"title": title})
            return add_cors_headers(json_response)
        else:
            logger.error(
                f"ai_assistant_error_020: AI Agent returned {response.status_code}"
            )
            error_response = JsonResponse(
                {"error": "Failed to generate title"}, status=500
            )
            return add_cors_headers(error_response)

    except Exception as e:
        logger.error(f"ai_assistant_error_021: Failed to generate title: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def regenerate_title(request, conversation_id):
    """Regenerate title for existing conversation based on chat history."""
    logger.info(
        f"ai_assistant_030: Processing regenerate title request for {conversation_id}"
    )

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        conversation = Conversation.objects.get(conversation_id=conversation_id)
        chat_history = conversation.get_chat_history_yaml()
        if not chat_history:
            error_response = JsonResponse(
                {"error": "No chat history found"}, status=400
            )
            return add_cors_headers(error_response)
        history_preview = (
            chat_history[:1000] if len(chat_history) > 1000 else chat_history
        )
        ai_request = {
            "user_name": "system",
            "response_format": "plain",
            "input": f"Generate a short title (3-5 words, no quotes, no emoji) for this conversation:\n\n{history_preview}",
        }
        response = requests.post(f"{AI_AGENT_URL}/chat", json=ai_request, timeout=30)
        if response.status_code == 200:
            ai_data = response.json()
            title = ai_data.get("content", {}).get("text", "").strip()
            title = title.strip("\"'")
            if len(title) > 50:
                title = title[:47] + "..."
            conversation.title = title
            conversation.save()
            logger.info(f"ai_assistant_031: Regenerated title: {title}")
            json_response = JsonResponse(
                {"title": title, "conversation_id": conversation_id}
            )
            return add_cors_headers(json_response)
        logger.error(
            f"ai_assistant_error_030: AI Agent returned {response.status_code}"
        )
        error_response = JsonResponse(
            {"error": "Failed to regenerate title"}, status=500
        )
        return add_cors_headers(error_response)
    except Conversation.DoesNotExist:
        logger.error(
            f"ai_assistant_error_031: Conversation {conversation_id} not found"
        )
        error_response = JsonResponse({"error": "Conversation not found"}, status=404)
        return add_cors_headers(error_response)
    except Exception as e:
        logger.error(f"ai_assistant_error_032: Failed to regenerate title: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def process_images(request):
    """Process images in ui_answer - generate images from prompts."""
    logger.info("ai_assistant_040: Processing images request")
    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)
    try:
        data = json.loads(request.body)
        ui_answer = data.get("ui_answer")
        if not ui_answer:
            error_response = JsonResponse(
                {"error": "ui_answer is required"}, status=400
            )
            return add_cors_headers(error_response)
        logger.info("ai_assistant_041: Starting image processing")
        processed_ui_answer = async_to_sync(process_images_in_ui_answer)(ui_answer)
        logger.info("ai_assistant_042: Image processing completed")
        json_response = JsonResponse({"ui_answer": processed_ui_answer})
        return add_cors_headers(json_response)
    except Exception as e:
        logger.error(f"ai_assistant_error_040: Failed to process images: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def save_message(request):
    """Save a message to conversation after WebSocket response."""
    logger.info("ai_assistant_050: Saving message request")
    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)
    try:
        data = json.loads(request.body)
        conversation_id = data.get("conversation_id")
        message_data = data.get("message")
        if not conversation_id or not message_data:
            error_response = JsonResponse(
                {"error": "conversation_id and message are required"}, status=400
            )
            return add_cors_headers(error_response)
        try:
            conversation = Conversation.objects.get(conversation_id=conversation_id)
        except Conversation.DoesNotExist:
            logger.info(
                f"ai_assistant_051: Creating new conversation {conversation_id}"
            )
            conversation = Conversation.objects.create(
                conversation_id=conversation_id,
                title=f"Chat {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            )
        message_id = message_data.get("message_id", str(uuid.uuid4()))
        role = message_data.get("role", "user")
        content = message_data.get("content", {})
        llm_trace = message_data.get("llm_trace", {})
        Message.objects.create(
            message_id=message_id,
            conversation=conversation,
            role=role,
            content=content,
            created_at=timezone.now(),
            llm_trace=llm_trace,
            input_tokens=llm_trace.get("input_tokens"),
            output_tokens=llm_trace.get("output_tokens"),
            total_tokens=llm_trace.get("total_tokens"),
            total_cost=llm_trace.get("total_cost"),
        )
        if llm_trace.get("total_tokens"):
            conversation.total_tokens += llm_trace.get("total_tokens", 0)
            conversation.total_input_tokens += llm_trace.get("input_tokens", 0)
            conversation.total_output_tokens += llm_trace.get("output_tokens", 0)
            conversation.total_cost += llm_trace.get("total_cost", 0.0)
            conversation.save()
        logger.info(f"ai_assistant_052: Saved {role} message {message_id}")
        json_response = JsonResponse({"success": True, "message_id": message_id})
        return add_cors_headers(json_response)
    except Exception as e:
        logger.error(f"ai_assistant_error_050: Failed to save message: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)
