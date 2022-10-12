from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder

from server.database.song import (
    add_song,
    delete_song,
    retrieve_song,
    retrieve_songs,
    update_song,
)

from server.models.song import (
    ErrorResponseModel,
    ResponseModel,
    SongSchema,
    UpdateSongModel,
)

SongRouter = APIRouter()

# Add a new song
@SongRouter.post("/", response_description="Song added into the database")
async def add_song_data(song: SongSchema = Body(...)):
    song = jsonable_encoder(song)
    new_song = await add_song(song)
    return ResponseModel(new_song, "Song added successfully.")


# Get all songs
@SongRouter.get("/", response_description="All songs retrieved")
async def get_songs():
    songs = await retrieve_songs()
    if songs:
        return ResponseModel(songs, "All songs retrieved successfully")
    return ResponseModel(songs, "Empty list returned")


# Get a song with a matching ID
@SongRouter.get("/{id}", response_description="Song retrieved")
async def get_song_data(id):
    song = await retrieve_song(id)
    return ResponseModel(song, "Song retrieved successfully")


# Update a song with a matching ID
@SongRouter.put("/{id}")
async def update_song_data(id: str, req: UpdateSongModel = Body(...)):
    req = {k: v for k, v in req.dict().items() if v is not None}
    updated_song = await update_song(id, req)
    return ResponseModel(updated_song, "Song with ID: {0} update is successful".format(id))


# Delete a song with a matching ID
@SongRouter.delete("/{id}", response_description="Song deleted from the database")
async def delete_song_data(id: str):
    await delete_song(id)
    return ResponseModel(
        "Song with ID: {0} removed".format(id), "Song deleted successfully"
    )
