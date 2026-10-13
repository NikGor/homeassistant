"""Swarm chat protocol: messages agents post to the shared swarm chat and WS events."""

from typing import List, Literal, Optional, Union

from pydantic import BaseModel, Field

SWARM_TEXT_MAX_LENGTH = 280

SwarmMessageKind = Literal[
    "user", "report", "action", "proposal", "alert", "system"
]
SwarmAgentRole = Literal["state", "action"]


class SwarmUsage(BaseModel):
    """LLM usage spent to produce one swarm message"""

    model: str = Field(description="LLM model that produced the message")
    input_tokens: int = Field(default=0, description="Input tokens used")
    output_tokens: int = Field(default=0, description="Output tokens used")
    total_cost: float = Field(default=0.0, description="Cost in USD")


class SwarmActionInfo(BaseModel):
    """A tool call an action agent executed or wants to execute"""

    tool_name: str = Field(description="Name of the Archie tool")
    arguments_json: str = Field(
        default="{}", description="Tool arguments as a JSON object string"
    )
    status: Literal["success", "error", "blocked"] = Field(
        description="Outcome of the tool call; blocked means the policy denied it"
    )
    summary: Optional[str] = Field(
        default=None, description="Short human-readable result of the call"
    )


class SwarmProposal(BaseModel):
    """An action that needs user approval before it runs"""

    proposal_id: str = Field(description="Unique proposal ID")
    action: SwarmActionInfo = Field(description="The proposed tool call")
    status: Literal["pending", "approved", "rejected", "executed", "failed"] = Field(
        default="pending", description="Approval state of the proposal"
    )


class SwarmMessage(BaseModel):
    """One message in the shared swarm chat"""

    message_id: str = Field(description="Unique message ID (Redis stream entry ID)")
    created_at: str = Field(description="ISO 8601 UTC timestamp")
    sender: str = Field(
        description="Agent ID (e.g. 'light'), or 'user', 'system', 'ha'"
    )
    kind: SwarmMessageKind = Field(description="Message kind, drives rendering")
    text: str = Field(
        max_length=SWARM_TEXT_MAX_LENGTH,
        description="Short message text; may contain @agent mentions",
    )
    mentions: List[str] = Field(
        default_factory=list, description="Agent IDs mentioned in the text"
    )
    reply_to: Optional[str] = Field(
        default=None, description="Message ID this message reacts to"
    )
    depth: int = Field(
        default=0,
        description="Number of agent hops since the last user/system trigger",
    )
    actions: List[SwarmActionInfo] = Field(
        default_factory=list, description="Tool calls executed for this message"
    )
    proposal: Optional[SwarmProposal] = Field(
        default=None, description="Action waiting for user approval"
    )
    usage: Optional[SwarmUsage] = Field(
        default=None, description="LLM usage for this message"
    )


class SwarmAgentInfo(BaseModel):
    """Public description of a swarm agent for the roster UI"""

    agent_id: str = Field(description="Agent ID used in @mentions")
    display_name: str = Field(description="Human-readable agent name")
    role: SwarmAgentRole = Field(
        description="state agents only observe and report; action agents may act"
    )
    description: str = Field(description="One-line description of the agent")
    icon: str = Field(description="Lucide icon name")
    color: str = Field(description="Accent color as CSS hex, e.g. '#f5b301'")
    enabled: bool = Field(default=True, description="Whether the agent is awake")


# --- WebSocket events, server -> client ---


class SwarmHistoryEvent(BaseModel):
    """Recent messages and the agent roster, sent once on connect"""

    type: Literal["history"] = Field("history", description="Event type")
    messages: List[SwarmMessage] = Field(description="Recent messages, oldest first")
    agents: List[SwarmAgentInfo] = Field(description="Agent roster")


class SwarmMessageEvent(BaseModel):
    """A new message was posted to the swarm chat"""

    type: Literal["message"] = Field("message", description="Event type")
    message: SwarmMessage = Field(description="The new message")


class SwarmTypingEvent(BaseModel):
    """An agent started or stopped working on a reply"""

    type: Literal["typing"] = Field("typing", description="Event type")
    agent_id: str = Field(description="Agent ID")
    active: bool = Field(description="True while the agent is working")


class SwarmAgentsEvent(BaseModel):
    """The agent roster changed"""

    type: Literal["agents"] = Field("agents", description="Event type")
    agents: List[SwarmAgentInfo] = Field(description="Agent roster")


SwarmServerEvent = Union[
    SwarmHistoryEvent, SwarmMessageEvent, SwarmTypingEvent, SwarmAgentsEvent
]


# --- WebSocket events, client -> server ---


class SwarmUserMessageCommand(BaseModel):
    """User posts a message to the swarm chat"""

    type: Literal["user_message"] = Field("user_message", description="Command type")
    text: str = Field(
        max_length=SWARM_TEXT_MAX_LENGTH, description="Message text with @mentions"
    )


class SwarmToggleAgentCommand(BaseModel):
    """User wakes up or puts an agent to sleep"""

    type: Literal["toggle_agent"] = Field("toggle_agent", description="Command type")
    agent_id: str = Field(description="Agent ID")
    enabled: bool = Field(description="New enabled state")


class SwarmProposalDecisionCommand(BaseModel):
    """User approves or rejects a proposal"""

    type: Literal["approve", "reject"] = Field(description="Decision")
    proposal_id: str = Field(description="Proposal ID")


SwarmClientCommand = Union[
    SwarmUserMessageCommand, SwarmToggleAgentCommand, SwarmProposalDecisionCommand
]
