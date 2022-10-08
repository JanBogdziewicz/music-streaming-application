from dbm.ndbm import library
from readline import append_history_file
from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from server.database.album import *

from server.models.album import *

AlbumRouter = APIRouter()

# Add a new album
@AlbumRouter.post("/", response_description="album added into the database")
async def add_album_data(album: AlbumSchema = Body(...)):
    album = jsonable_encoder(album)
    new_album = await add_album(album)
    return ResponseModel(new_album, "album added successfully.")


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
    if album:
        return ResponseModel(album, "album retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "album doesn't exist.")


# Update a album with a matching ID
@AlbumRouter.put("/{id}")
async def update_album_data(id: str, req: UpdateAlbumModel = Body(...)):
    req = {k: v for k, v in req.dict().items() if v is not None}
    updated_album = await update_album(id, req)
    if updated_album:
        return ResponseModel(
            "album with ID: {0} update is successful".format(id),
            "album updated successfully",
        )
    return ErrorResponseModel(
        "An error occurred",
        404,
        "There was an error while updating the album.",
    )


# Delete a album with a matching ID
@AlbumRouter.delete("/{id}", response_description="album deleted from the database")
async def delete_album_data(id: str):
    deleted_album = await delete_album(id)
    if deleted_album:
        return ResponseModel(
            "album with ID: {0} removed".format(id), "album deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "album with id {0} doesn't exist".format(id)
    )

@AlbumRouter.get("/{id}/songs", response_description="album songs retrieved sucessfully")
async def get_album_songs(id: str):
    songs = await retreive_album_songs(id)
    if songs:
        return ResponseModel(songs, "All album songs retrieved successfully")
    return ResponseModel(songs, "Empty list returned")