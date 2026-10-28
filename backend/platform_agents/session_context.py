from dataclasses import dataclass

from platform_agents.outputschema import QuizAgentOutput


@dataclass
class SessionContext:
    quiz: QuizAgentOutput | None = None
