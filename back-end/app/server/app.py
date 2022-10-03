from re import S
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routes.song import SongRouter
from server.database.init import initialize_db_schema
import logging

logging.config.fileConfig('logging.conf', disable_existing_loggers=False)

logger = logging.getLogger(__name__)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(SongRouter, tags=["Song"], prefix="/songs")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to this fantastic app!"}

@app.on_event('startup')
async def startup():
    await initialize_db_schema()