import json
from datetime import timedelta
from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from homeassistant.ai_assistant.models import Conversation, Message
from homeassistant.chat_monitoring import services
from homeassistant.chat_monitoring.models import MonitorRun, TurnEvaluation
from homeassistant.prompt_evals import views as eval_views

TOKEN = "test-token"
NOW = "2026-10-16T12:00:00+00:00"


def make_conversation(conversation_id: str, turns: int, start_minutes_ago: int = 60):
    conversation = Conversation.objects.create(
        conversation_id=conversation_id, title=f"Chat {conversation_id}"
    )
    start = timezone.now() - timedelta(minutes=start_minutes_ago)
    for turn in range(turns):
        Message.objects.create(
            message_id=f"{conversation_id}-u{turn}",
            conversation=conversation,
            role="user",
            content={"content_format": "plain", "text": f"question {turn}"},
            created_at=start + timedelta(minutes=2 * turn),
        )
        Message.objects.create(
            message_id=f"{conversation_id}-a{turn}",
            conversation=conversation,
            role="assistant",
            content={"content_format": "plain", "text": f"answer {turn}"},
            created_at=start + timedelta(minutes=2 * turn + 1),
        )
    return conversation


def make_evaluation(message_id: str, grade: str = "green", run_id: str = "run1") -> dict:
    return {
        "run_id": run_id,
        "conversation_id": message_id.rsplit("-", 1)[0],
        "message_id": message_id,
        "grade": grade,
        "summary": "Answer is fine",
        "criteria": [
            {"criterion": "helpfulness", "grade": grade, "comment": "ok"},
            {"criterion": "tool_choice", "grade": None, "comment": "no trace"},
        ],
        "trace_found": False,
        "judge_model": "typesafe/jev-router",
        "judge_cost": 0.0001,
        "evaluated_at": NOW,
    }


def make_run(run_id: str = "run1", status: str = "running") -> dict:
    return {
        "run_id": run_id,
        "status": status,
        "request": {"max_conversations": 20, "triggered_by": "ui"},
        "judge_model": "typesafe/jev-router",
        "conversations": 1,
        "total_turns": 2,
        "done_turns": 1,
        "red": 1,
        "created_at": NOW,
    }


@mock.patch.object(eval_views, "EVAL_API_TOKEN", TOKEN)
class AgentApiTest(TestCase):
    auth = {"HTTP_AUTHORIZATION": f"Bearer {TOKEN}"}

    def post(self, name: str, payload: dict):
        return self.client.post(
            reverse(name), data=json.dumps(payload), content_type="application/json", **self.auth
        )

    def test_pending_lists_only_unjudged_turns_oldest_first(self):
        make_conversation("new", turns=1, start_minutes_ago=10)
        make_conversation("old", turns=2, start_minutes_ago=100)
        self.post("chat_monitoring_ingest_evaluation", make_evaluation("old-a0"))

        response = self.client.get(reverse("chat_monitoring_pending"), **self.auth)

        conversations = response.json()["conversations"]
        self.assertEqual([c["conversation_id"] for c in conversations], ["old", "new"])
        self.assertEqual(conversations[0]["pending_message_ids"], ["old-a1"])
        self.assertEqual(len(conversations[0]["messages"]), 4)
        self.assertEqual(
            json.loads(conversations[0]["messages"][0]["content_json"])["text"], "question 0"
        )

    def test_pending_decodes_content_stored_as_json_string(self):
        conversation = make_conversation("legacy", turns=1)
        Message.objects.filter(conversation=conversation).update(
            content=json.dumps({"content_format": "plain", "text": "old"})
        )
        response = self.client.get(reverse("chat_monitoring_pending"), **self.auth)
        message = response.json()["conversations"][0]["messages"][1]
        self.assertEqual(json.loads(message["content_json"])["text"], "old")

    def test_pending_respects_limit_and_filter(self):
        make_conversation("a", turns=1, start_minutes_ago=30)
        make_conversation("b", turns=1, start_minutes_ago=20)
        url = reverse("chat_monitoring_pending")

        limited = self.client.get(url, {"limit": 1}, **self.auth).json()
        filtered = self.client.get(url, {"conversation_id": "b"}, **self.auth).json()

        self.assertEqual([c["conversation_id"] for c in limited["conversations"]], ["a"])
        self.assertEqual([c["conversation_id"] for c in filtered["conversations"]], ["b"])

    def test_evaluation_ingest_is_idempotent(self):
        make_conversation("c", turns=1)
        self.post("chat_monitoring_ingest_run", make_run())
        self.post("chat_monitoring_ingest_evaluation", make_evaluation("c-a0", "red"))
        response = self.post("chat_monitoring_ingest_evaluation", make_evaluation("c-a0", "orange"))

        self.assertEqual(response.status_code, 200)
        evaluation = TurnEvaluation.objects.get()
        self.assertEqual(evaluation.grade, "orange")
        self.assertEqual(evaluation.run.run_id, "run1")
        self.assertEqual(evaluation.criteria[1]["grade"], None)

    def test_evaluation_for_missing_message_is_404(self):
        response = self.post("chat_monitoring_ingest_evaluation", make_evaluation("x-a0"))
        self.assertEqual(response.status_code, 404)

    def test_bad_evaluation_is_422(self):
        make_conversation("c", turns=1)
        payload = {**make_evaluation("c-a0"), "grade": "yellow"}
        response = self.post("chat_monitoring_ingest_evaluation", payload)
        self.assertEqual(response.status_code, 422)

    def test_run_ingest_upserts(self):
        self.post("chat_monitoring_ingest_run", make_run())
        self.post("chat_monitoring_ingest_run", {**make_run(), "status": "completed", "done_turns": 2})
        run = MonitorRun.objects.get()
        self.assertEqual((run.status, run.done_turns), ("completed", 2))

    def test_agent_api_needs_token(self):
        response = self.client.get(reverse("chat_monitoring_pending"))
        self.assertEqual(response.status_code, 403)


class UiApiTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("niko")
        self.client.force_login(self.user)
        make_conversation("red", turns=2)
        make_conversation("green", turns=1)
        make_conversation("pending", turns=1)
        for message_id, grade in [("red-a0", "green"), ("red-a1", "red"), ("green-a0", "green")]:
            services.store_evaluation(
                services.MonitorTurnEvaluation.model_validate(make_evaluation(message_id, grade))
            )

    def test_summary_counts_worst_grade_per_conversation(self):
        summary = self.client.get(reverse("chat_monitoring_summary")).json()
        self.assertEqual(summary["conversations"], {"red": 1, "orange": 0, "green": 1})
        self.assertEqual(summary["turns"], {"green": 2, "red": 1})
        self.assertEqual(summary["pending_turns"], 1)
        self.assertEqual(summary["pending_conversations"], 1)

    def test_conversation_list_filters_by_grade(self):
        url = reverse("chat_monitoring_conversations")
        red = self.client.get(url, {"grade": "red"}).json()["conversations"]
        everything = self.client.get(url).json()["conversations"]
        self.assertEqual([c["conversation_id"] for c in red], ["red"])
        self.assertEqual(red[0]["unreviewed"], 1)
        self.assertEqual({c["conversation_id"] for c in everything}, {"red", "green"})

    def test_review_marks_only_problem_turns(self):
        url = reverse("chat_monitoring_review", args=["red"])
        response = self.client.post(url)
        self.assertEqual(response.json(), {"reviewed": 1})
        unreviewed = self.client.get(
            reverse("chat_monitoring_conversations"), {"unreviewed": "1"}
        ).json()["conversations"]
        self.assertEqual(unreviewed, [])

    def test_conversation_detail_has_text_and_evaluations(self):
        detail = self.client.get(reverse("chat_monitoring_conversation", args=["red"])).json()
        messages = detail["messages"]
        self.assertEqual([m["role"] for m in messages], ["user", "assistant"] * 2)
        self.assertEqual(messages[3]["text"], "answer 1")
        self.assertEqual(messages[3]["evaluation"]["grade"], "red")
        self.assertIsNone(messages[0]["evaluation"])

    @mock.patch.object(services, "call_agent", return_value={"run_id": "r1", "status": "running"})
    def test_start_run_marks_ui_trigger(self, call_agent):
        response = self.client.post(
            reverse("chat_monitoring_start"),
            data=json.dumps({"max_conversations": 5, "triggered_by": "schedule"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 202)
        method, path, payload = call_agent.call_args.args
        self.assertEqual((method, path), ("POST", "/monitoring/runs"))
        self.assertEqual(payload["triggered_by"], "ui")
        self.assertEqual(payload["max_conversations"], 5)

    def test_stale_running_run_is_not_active(self):
        services.store_run(services.MonitorRunInfo.model_validate(make_run()))
        self.assertIsNotNone(self.client.get(reverse("chat_monitoring_active")).json()["run"])
        MonitorRun.objects.update(updated_at=timezone.now() - timedelta(hours=1))
        self.assertIsNone(self.client.get(reverse("chat_monitoring_active")).json()["run"])
