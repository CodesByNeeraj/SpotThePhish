import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.chat import router

app = FastAPI(title="SpotThePhish")
# FRONTEND_ORIGIN is the deployed frontend's URL. Dev uses the Vite proxy, so it is not needed there.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ["FRONTEND_ORIGIN"]] if "FRONTEND_ORIGIN" in os.environ else [],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
