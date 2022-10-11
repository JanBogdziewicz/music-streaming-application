from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.routes.song import SongRouter
from server.routes.user import UserRouter
from server.routes.library import LibraryRouter
from server.routes.search import SearchRouter
from server.routes.artist import ArtistRouter
from server.routes.album import AlbumRouter
from server.routes.playlist import PlaylistRouter

from server.database.init import initialize_db_schema

import logging

logging.config.fileConfig("logging.conf", disable_existing_loggers=False)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.exception_handler(Exception)
async def catch_exceptions_middleware(request, err):
    return JSONResponse(status_code=500, content={"message": str(err)})
        

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
app.include_router(ArtistRouter, tags=["Artist"], prefix="/artists")
app.include_router(AlbumRouter, tags=["Album"], prefix="/albums")
app.include_router(PlaylistRouter, tags=["Playlist"], prefix="/playlists")


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to this fantastic app!"}


@app.on_event("startup")
async def startup():
    await initialize_db_schema()
