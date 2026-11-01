from dataclasses import dataclass

from platform_agents.outputschema import EmailAgentOutput, QuizAgentOutput

#SessionContext holds the email agent output that quiz agent needs to see and quiz agent output that quiz feedback agent needs to see
@dataclass
class SessionContext:
    email: EmailAgentOutput | None = None
    quiz: QuizAgentOutput | None = None
