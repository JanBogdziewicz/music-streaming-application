from server.database.images import download_album_cover
from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response

from server.database.album import *

from server.models.album import *

AlbumRouter = APIRouter()

# Add a new album
@AlbumRouter.post("/", response_description="album added into the database")
async def add_album_data(album: AlbumSchema = Body(...)):
    album = jsonable_encoder(album)
    new_album = await add_album(album)
    return ResponseModel(new_album, "Album added successfully.")


# Get all albums
@AlbumRouter.get("/", response_description="All albums retrieved")
async def get_albums():
    albums = await retrieve_albums()
    if albums:
        return ResponseModel(albums, "All albums retrieved successfully")
    return ResponseModel(albums, "Empty list returned")


# Get a album with a matching ID
@AlbumRouter.get("/{id}", response_description="album retrieved")
async def get_album_data(id):
    album = await retrieve_album(id)
    return ResponseModel(album, "Album retrieved successfully")


# Update a album with a matching ID
@AlbumRouter.put("/{id}")
async def update_album_data(id: str, req: UpdateAlbumModel = Body(...)):
    req = jsonable_encoder(req)
    updated_album = await update_album(id, req)
    return ResponseModel(
        updated_album, "Album with ID: {0} update is successful".format(id)
    )


# Delete a album with a matching ID
@AlbumRouter.delete("/{id}", response_description="album deleted from the database")
async def delete_album_data(id: str):
    await delete_album(id)
    return ResponseModel(
        "album with ID: {0} removed".format(id), "album deleted successfully"
    )


# Get all songs of an album
@AlbumRouter.get(
    "/{id}/songs", response_description="album songs retrieved sucessfully"
)
async def get_album_songs(id: str):
    songs = await retrieve_album_songs(id)
    if songs:
        return ResponseModel(songs, "All album songs retrieved successfully")
    return ResponseModel(songs, "Empty list returned")


# Get cover of an album
@AlbumRouter.get(
    "/{id}/cover", response_description="album cover retrieved sucessfully"
)
async def get_album_cover(id: str):
    album = await retrieve_album(id)
    cover = await download_album_cover(album["cover"])
    return Response(cover)
