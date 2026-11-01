from string import ascii_uppercase

from agents import Agent, RunContextWrapper

from platform_agents.outputschema import QuizAgentOutput, QuizFeedbackAgentOutput
from platform_agents.session_context import SessionContext

quiz_feedback_agent_instructions = """
You grade a user's phishing awareness quiz. Your input contains the user's answers.
Here is the quiz, with the options labelled A, B, C, D, and the correct options:

{quiz}

For every question:
- state the correct option, as its letter and text
- say whether the user's answer is correct
- give short, encouraging feedback that uses the explanation
"""

def format_quiz(quiz: QuizAgentOutput) -> str:
    lines = []
    for number, question in enumerate(quiz.questions, start=1):
        lines.append(f"{number}. {question.question}")
        for letter, option in zip(ascii_uppercase, question.options):
            lines.append(f"   {letter}. {option}")
        correct_letter = ascii_uppercase[question.options.index(question.correct_answer)]
        lines.append(f"   Correct option: {correct_letter}. {question.correct_answer}")
        lines.append(f"   Explanation: {question.explanation}")
    return "\n".join(lines)

def build_quiz_feedback_instructions(
    ctx: RunContextWrapper[SessionContext], agent: Agent[SessionContext]
) -> str:
    return quiz_feedback_agent_instructions.format(quiz=format_quiz(ctx.context.quiz))

quiz_feedback_agent = Agent[SessionContext](
    name="Quiz Feedback Agent",
    model="gpt-5.6-terra",
    instructions=build_quiz_feedback_instructions,
    output_type=QuizFeedbackAgentOutput,
)
