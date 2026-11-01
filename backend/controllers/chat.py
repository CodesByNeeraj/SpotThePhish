from dataclasses import dataclass, field

from agents import InputGuardrailTripwireTriggered, Runner, TResponseInputItem
from fastapi import APIRouter
from pydantic import BaseModel, model_validator

from platform_agents.orchestrator_agent import orchestrator_agent
from platform_agents.session_context import SessionContext

router = APIRouter()

CATEGORIES = [
    "Invoice or payment request",
    "Password reset",
    "Package delivery",
    "Account suspension",
    "Executive impersonation",
    "Prize or gift card",
]

BLOCKED_REPLY = "I can only help with phishing awareness. Let's get back to the session."


@dataclass
class Session:
    #SessionContext object in session_context.py
    context: SessionContext = field(default_factory=SessionContext)
    #what the LLM sees - every user message, assistant reply and tool call so far.
    history: list[TResponseInputItem] = field(default_factory=list)


sessions: dict[str, Session] = {}


class ChatRequest(BaseModel):
    session_id: str
    category: str | None = None
    message: str | None = None

    @model_validator(mode="after")
    def check_category_or_message(self):
        if (self.category is None) == (self.message is None):
            raise ValueError("send either category or message")
        if self.category is not None and self.category not in CATEGORIES:
            raise ValueError("unknown category")
        return self


def email_for_ui(session: Session) -> dict | None:
    """The email shown in the side panel. Red flags and search details stay on the server."""
    if session.context.email is None:
        return None
    return session.context.email.model_dump(
        include={"email_from", "email_subject", "email_body", "email_sign_off"}
    )


def quiz_for_ui(session: Session) -> dict | None:
    """The quiz shown to the user. Correct answers and explanations stay on the server."""
    if session.context.quiz is None:
        return None
    return session.context.quiz.model_dump(
        exclude={"questions": {"__all__": {"correct_answer", "explanation"}}}
    )


@router.get("/categories")
async def categories():
    return CATEGORIES


@router.post("/chat")
async def chat(req: ChatRequest):
    if req.category:
        # a new email starts a fresh session
        sessions[req.session_id] = Session()
    session = sessions.setdefault(req.session_id, Session())
    user_text = (
        f"Generate a phishing email. Category: {req.category}"
        if req.category
        else req.message
    )
    try:
        result = await Runner.run(
            orchestrator_agent,
            session.history + [{"role": "user", "content": user_text}],
            context=session.context,
        )
    except InputGuardrailTripwireTriggered:
        return {"reply": BLOCKED_REPLY, "email": email_for_ui(session), "quiz": quiz_for_ui(session)}
    session.history = result.to_input_list()
    return {
        "reply": result.final_output.response_to_user,
        "email": email_for_ui(session),
        "quiz": quiz_for_ui(session),
    }
