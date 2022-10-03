from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes.search import SearchRouter

from server.routes.library import LibraryRouter
from server.routes.song import SongRouter
from server.routes.user import UserRouter

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
app.include_router(UserRouter, tags=["User"], prefix="/users")
app.include_router(LibraryRouter, tags=["Library"], prefix="/libraries")
app.include_router(SearchRouter, tags=["Search"], prefix="/searches")


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to this fantastic app!"}
