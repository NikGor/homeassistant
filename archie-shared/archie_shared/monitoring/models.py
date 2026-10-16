"""Chat monitoring protocol: an LLM judge grades assistant turns (ARCHIE-213).

Django keeps conversations and evaluations; the AI agent fetches turns that have
no evaluation yet, judges them and sends one MonitorTurnEvaluation per turn back.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

MonitorGrade = Literal["red", "orange", "green"]
MonitorCriterion = Literal[
    "helpfulness", "correctness", "tool_choice", "skill_usage", "format_fit"
]
MonitorRunStatus = Literal["running", "completed", "failed"]
MonitorTrigger = Literal["ui", "schedule", "claude", "cli"]

MONITOR_MAX_CONVERSATIONS = 200


class MonitorMessage(BaseModel):
    """One stored chat message"""

    message_id: str = Field(description="Message ID")
    role: Literal["user", "assistant"] = Field(description="Message author")
    content_json: str = Field(
        description="Stored Content as JSON; may be an older Content schema"
    )
    created_at: str = Field(description="ISO 8601 timestamp")


class MonitorConversation(BaseModel):
    """A conversation with at least one assistant turn that has no evaluation"""

    conversation_id: str = Field(description="Conversation ID")
    title: str = Field(description="Conversation title")
    messages: List[MonitorMessage] = Field(description="All messages, oldest first")
    pending_message_ids: List[str] = Field(
        description="Assistant message IDs to judge"
    )


class MonitorPendingBatch(BaseModel):
    """Conversations to judge, oldest first"""

    conversations: List[MonitorConversation] = Field(
        description="Conversations with pending turns"
    )


class MonitorToolCall(BaseModel):
    """One tool call of the turn, taken from the Langfuse trace"""

    name: str = Field(description="Tool name, e.g. google_search_tool")
    arguments: str = Field(description="Tool arguments as JSON")
    success: Optional[bool] = Field(
        default=None, description="Tool result success flag, if known"
    )


class MonitorCriterionScore(BaseModel):
    """Grade for one criterion"""

    criterion: MonitorCriterion = Field(description="Judged criterion")
    grade: Optional[MonitorGrade] = Field(
        default=None, description="Grade; None if the criterion does not apply"
    )
    comment: str = Field(description="Short reason for the grade")


class MonitorTurnEvaluation(BaseModel):
    """Judge result for one assistant turn"""

    run_id: str = Field(description="Monitor run ID")
    conversation_id: str = Field(description="Conversation ID")
    message_id: str = Field(description="Judged assistant message ID")
    grade: MonitorGrade = Field(description="Overall grade of the turn")
    summary: str = Field(description="One or two sentences on the main problem or why it is good")
    criteria: List[MonitorCriterionScore] = Field(description="Grade per criterion")
    trace_found: bool = Field(
        description="True if the Langfuse trace with tool calls was found"
    )
    trace_id: Optional[str] = Field(default=None, description="Langfuse trace ID")
    tool_calls: List[MonitorToolCall] = Field(
        default_factory=list, description="Tool calls of the turn (skill loads included)"
    )
    skills_loaded: List[str] = Field(
        default_factory=list, description="Skill names loaded with skill_loader_tool"
    )
    judge_model: str = Field(description="Judge model ID")
    judge_cost: Optional[float] = Field(default=None, description="Judge call cost in USD")
    evaluated_at: str = Field(description="ISO 8601 UTC timestamp")


class MonitorRunRequest(BaseModel):
    """Request to judge pending turns"""

    conversation_ids: List[str] = Field(
        default_factory=list,
        description="Judge only these conversations; empty = oldest pending ones",
    )
    max_conversations: int = Field(
        default=20,
        ge=1,
        le=MONITOR_MAX_CONVERSATIONS,
        description="Maximum number of conversations in one run",
    )
    judge_model: Optional[str] = Field(
        default=None, description="Judge model; None = agent default"
    )
    triggered_by: MonitorTrigger = Field(default="ui", description="Who started the run")


class MonitorRunInfo(BaseModel):
    """State and totals of one monitor run"""

    run_id: str = Field(description="Monitor run ID")
    status: MonitorRunStatus = Field(description="Run state")
    request: MonitorRunRequest = Field(description="Request the run was started with")
    judge_model: str = Field(description="Judge model ID")
    conversations: int = Field(default=0, description="Conversations in the run")
    total_turns: int = Field(default=0, description="Turns to judge")
    done_turns: int = Field(default=0, description="Judged turns")
    red: int = Field(default=0, description="Turns graded red")
    orange: int = Field(default=0, description="Turns graded orange")
    green: int = Field(default=0, description="Turns graded green")
    errors: int = Field(default=0, description="Turns the judge failed on")
    total_cost: float = Field(default=0.0, description="Judge cost in USD")
    error: Optional[str] = Field(default=None, description="Run-level error if failed")
    created_at: str = Field(description="ISO 8601 UTC timestamp")
    finished_at: Optional[str] = Field(default=None, description="ISO 8601 UTC timestamp")
