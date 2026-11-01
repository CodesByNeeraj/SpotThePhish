from typing import Literal 
from pydantic import BaseModel

class OrchestratorAgentOutput(BaseModel):
    tool_name:Literal["email_agent","quiz_agent","quiz_feedback_agent"] | None
    #logged
    reason_for_tool:str
    response_to_user:str

class EmailAgentOutput(BaseModel):
    #logged
    tool_name:Literal["web_search"]
    #logged
    category:str
    #logged
    web_search_url:str
    #logged
    reason_for_picking_website:str
    #logged
    web_search_summary:str
    email_from:str
    email_subject:str
    email_body:str
    email_sign_off:str
    red_flags:list[str]
    
class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str
    explanation: str

class QuizAgentOutput(BaseModel):
    quiz_title: str
    questions: list[QuizQuestion]

class QuestionFeedback(BaseModel):
    question: str
    user_answer: str
    is_correct: bool
    feedback: str

class QuizFeedbackAgentOutput(BaseModel):
    feedback: list[QuestionFeedback]
    
class OffTopicGuardRailAgentOutput(BaseModel):
    classification:bool
    reason:str
    

    
    
    
    
    

    
    