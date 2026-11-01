from agents import Agent, RunContextWrapper

from platform_agents.outputschema import QuizAgentOutput
from platform_agents.session_context import SessionContext

quiz_agent_instructions = """
You create a multiple choice quiz for a phishing awareness training session.
Here is the phishing email the user saw, with the red flags that were planted in it:

{email}

- Write 5 questions that test whether the user can spot signs of phishing,
  based on this email and its red flags.
- Each question has 4 options and exactly one correct answer.
- correct_answer must be written exactly as it appears in the options.
- Make the wrong options plausible, but clearly wrong once the user knows the red flags.
- explanation says in one or two sentences why the correct answer is right.
- Give the quiz a short, clear quiz_title.
"""

def build_quiz_instructions(
    ctx: RunContextWrapper[SessionContext], agent: Agent[SessionContext]
) -> str:
    #agent only sees values of those in include retrived from SessionContext
    return quiz_agent_instructions.format(
        email=ctx.context.email.model_dump_json(
            indent=2,
            include={"email_from", "email_subject", "email_body", "email_sign_off", "red_flags"},
        )
    )

quiz_agent = Agent[SessionContext](
    name="Quiz Agent",
    model="gpt-5.6-terra",
    instructions=build_quiz_instructions,
    output_type=QuizAgentOutput,
)
