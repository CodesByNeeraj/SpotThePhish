from agents import Agent, RunContextWrapper

from platform_agents.outputschema import QuizFeedbackAgentOutput
from platform_agents.session_context import SessionContext

quiz_feedback_agent_instructions = """
You grade a user's phishing awareness quiz. Your input contains the user's answers.
Here is the quiz with the correct answers and explanations:

{quiz}

For every question, say whether the user's answer is correct and give short,
encouraging feedback that uses the explanation.
"""

def build_quiz_feedback_instructions(
    ctx: RunContextWrapper[SessionContext], agent: Agent[SessionContext]
) -> str:
    return quiz_feedback_agent_instructions.format(
        #the instance of QuizAgentOutput is turned into a json here as an input for the quiz feedback agent
        quiz=ctx.context.quiz.model_dump_json(indent=2)
    )

quiz_feedback_agent = Agent[SessionContext](
    name="Quiz Feedback Agent",
    instructions=build_quiz_feedback_instructions,
    output_type=QuizFeedbackAgentOutput,
)
