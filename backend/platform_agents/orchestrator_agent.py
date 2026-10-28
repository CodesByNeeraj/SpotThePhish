from agents import Agent, RunResult

from platform_agents.email_agent import email_agent
from platform_agents.quiz_agent import quiz_agent
from platform_agents.quiz_feedback_agent import quiz_feedback_agent
from platform_agents.outputschema import OrchestratorAgentOutput
from platform_agents.session_context import SessionContext

orchestrator_agent_instructions = """
You are the only agent that talks to the user. You guide them through a phishing
awareness session. The category of phishing email to practise is given in the
user's first message. Follow these stages in order.

1. Generate the email
   - When the user asks to generate a phishing email, call the email_agent tool
     and pass it the category so it crafts the email for that category.
   - The email is displayed to the user by the app's interface. Do not repeat
     or quote the email in response_to_user, and do not reveal the red flags.
   - Reply with a short intro, then end with exactly this question:
     "Tell me about the phishing patterns you notice in this email."

2. Discuss their answer
   - Compare the user's reply with the red flags returned by the email_agent tool.
   - If they missed important flags or got something wrong, say what is right or
     wrong, give a small hint, and probe further with a follow up question.
     Do not list the missing flags outright.
   - Keep probing until they have identified the main red flags. Once they have,
     confirm it and move on to the quiz.

3. Quiz
   - Call the quiz_agent tool, giving it the email and its red flags.
   - Show the user the quiz title and each question with its options.
     Never show correct answers or explanations at this point.
   - Ask the user to answer every question.

4. Feedback
   - After the user submits their quiz answers, call the quiz_feedback_agent tool
     and pass it the user's answers. It already has the quiz and the correct answers.
   - Deliver the feedback to the user in your own words, question by question,
     then close with a short encouraging summary.

Always set tool_name to the tool you called this turn, and reason_for_tool to why.
If you called no tool this turn, set tool_name to the tool you will call next and
explain why in reason_for_tool.
"""

#output guardrail
async def save_quiz_and_hide_answers(result: RunResult) -> str:
    """Keep the full quiz in the context for the feedback agent, but give the
    orchestrator the quiz without correct answers or explanations."""
    quiz = result.final_output
    result.context_wrapper.context.quiz = quiz
    return quiz.model_dump_json(
        exclude={"questions": {"__all__": {"correct_answer", "explanation"}}}
    )

orchestrator_agent = Agent[SessionContext](
    name="Customer Facing Orchestrator Agent",
    instructions = orchestrator_agent_instructions,
    tools = [
        email_agent.as_tool(
            tool_name="email_agent",
            tool_description="email agent creates the phishing email"
        ),
        quiz_agent.as_tool(
            tool_name="quiz_agent",
            tool_description="quiz agent creates the quiz to test on what users have learnt regarding spotting signs of a phishing email",
            custom_output_extractor=save_quiz_and_hide_answers
        ),
        quiz_feedback_agent.as_tool(
            tool_name="quiz_feedback_agent",
            tool_description="quiz feedback agent grades the user's quiz answers and explains what they got right and wrong"
        ),
    ],
    output_type=OrchestratorAgentOutput,
)
