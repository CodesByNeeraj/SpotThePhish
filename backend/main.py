from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI

from controllers.chat import router

app = FastAPI(title="SpotThePhish")
app.include_router(router)
