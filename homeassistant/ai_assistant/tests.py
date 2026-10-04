import base64
import json

from django.test import TestCase
from django.urls import reverse

from .models import Conversation, Message, MessageImage

PNG_B64 = base64.b64encode(b"\x89PNG\r\n\x1a\nfake").decode()


class MessageImageApiTests(TestCase):
    def setUp(self):
        self.conversation = Conversation.objects.create(
            conversation_id="conv-1", title="t"
        )
        self.message = Message.objects.create(
            message_id="msg-1",
            conversation=self.conversation,
            role="user",
            content={"content_format": "plain", "text": "hi"},
        )

    def _post(self, images, message_id="msg-1"):
        return self.client.post(
            reverse("message_images", args=[message_id]),
            data=json.dumps({"images": images}),
            content_type="application/json",
        )

    def test_store_and_serve_images_in_order(self):
        resp = self._post(
            [
                {"media_type": "image/png", "data": PNG_B64},
                {"media_type": "image/jpeg", "data": PNG_B64},
            ]
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["count"], 2)
        first = self.client.get(reverse("message_image", args=["msg-1", 0]))
        second = self.client.get(reverse("message_image", args=["msg-1", 1]))
        self.assertEqual(first["Content-Type"], "image/png")
        self.assertEqual(second["Content-Type"], "image/jpeg")
        self.assertEqual(first.content, base64.b64decode(PNG_B64))

    def test_resave_replaces_previous_images(self):
        self._post([{"media_type": "image/png", "data": PNG_B64}] * 3)
        self._post([{"media_type": "image/png", "data": PNG_B64}])
        self.assertEqual(MessageImage.objects.filter(message=self.message).count(), 1)

    def test_rejects_bad_input(self):
        ok = {"media_type": "image/png", "data": PNG_B64}
        self.assertEqual(self._post([]).status_code, 400)
        self.assertEqual(self._post([ok] * 5).status_code, 413)
        self.assertEqual(
            self._post([{"media_type": "image/svg+xml", "data": PNG_B64}]).status_code,
            400,
        )
        self.assertEqual(
            self._post([{"media_type": "image/png", "data": "!!notbase64"}]).status_code,
            400,
        )
        self.assertEqual(self._post([ok], message_id="nope").status_code, 404)

    def test_missing_image_is_404(self):
        resp = self.client.get(reverse("message_image", args=["msg-1", 0]))
        self.assertEqual(resp.status_code, 404)

    def test_conversation_messages_report_image_count(self):
        self._post([{"media_type": "image/png", "data": PNG_B64}] * 2)
        resp = self.client.get(
            reverse("proxy_conversation_messages", args=["conv-1"])
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        messages = body if isinstance(body, list) else body.get("messages", body)
        self.assertEqual(messages[0]["image_count"], 2)
