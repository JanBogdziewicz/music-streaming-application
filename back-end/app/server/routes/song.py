from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response, FileResponse

from server.database.images import download_album_cover

from server.database.album import retrieve_song_album

from server.database.song import (
    add_song,
    delete_song,
    retrieve_song,
    retrieve_songs,
    update_song,
    retrieve_song_path,
)

from server.models.song import (
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


# Get a song file with a matching ID
@SongRouter.get("/{id}/file", response_description="Song retrieved")
async def get_song_data(id):
    song_path = await retrieve_song_path(id)
    return FileResponse(
        song_path,
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes", "Connection": "keep-alive"},
    )


# Update a song with a matching ID
@SongRouter.put("/{id}")
async def update_song_data(id: str, req: UpdateSongModel = Body(...)):
    req = jsonable_encoder(req)
    updated_song = await update_song(id, req)
    return ResponseModel(
        updated_song, "Song with ID: {0} update is successful".format(id)
    )


# Delete a song with a matching ID
@SongRouter.delete("/{id}", response_description="Song deleted from the database")
async def delete_song_data(id: str):
    await delete_song(id)
    return ResponseModel(
        "Song with ID: {0} removed".format(id), "Song deleted successfully"
    )


# Retrieve album of the song
@SongRouter.get("/{id}/album", response_description="Album of the song retrieved")
async def get_song_album_data(id):
    album = await retrieve_song_album(id)
    return ResponseModel(album, "Album of the song retrieved successfully")


# Get cover of a song
@SongRouter.get("/{id}/cover", response_description="song cover retrieved sucessfully")
async def get_song_cover(id: str):
    song = await retrieve_song(id)
    cover = await download_album_cover(song["cover"])
    return Response(cover)
