from dbm.ndbm import library
from readline import append_history_file
from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from server.database.artist import *

from server.models.artist import *

ArtistRouter = APIRouter()

# Add a new artist
@ArtistRouter.post("/", response_description="artist added into the database")
async def add_artist_data(artist: ArtistSchema = Body(...)):
    artist = jsonable_encoder(artist)
    new_artist = await add_artist(artist)
    return ResponseModel(new_artist, "artist added successfully.")


# Get all artists
@ArtistRouter.get("/", response_description="All artists retrieved")
async def get_artists():
    artists = await retrieve_artists()
    if artists:
        return ResponseModel(artists, "All artists retrieved successfully")
    return ResponseModel(artists, "Empty list returned")


# Get a artist with a matching ID
@ArtistRouter.get("/{id}", response_description="artist retrieved")
async def get_artist_data(id):
    artist = await retrieve_artist(id)
    if artist:
        return ResponseModel(artist, "artist retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "artist doesn't exist.")


# Update a artist with a matching ID
@ArtistRouter.put("/{id}")
async def update_artist_data(id: str, req: UpdateArtistModel = Body(...)):
    req = {k: v for k, v in req.dict().items() if v is not None}
    updated_artist = await update_artist(id, req)
    if updated_artist:
        return ResponseModel(
            "artist with ID: {0} update is successful".format(id),
            "artist updated successfully",
        )
    return ErrorResponseModel(
        "An error occurred",
        404,
        "There was an error while updating the artist.",
    )


# Delete a artist with a matching ID
@ArtistRouter.delete("/{id}", response_description="artist deleted from the database")
async def delete_artist_data(id: str):
    deleted_artist = await delete_artist(id)
    if deleted_artist:
        return ResponseModel(
            "artist with ID: {0} removed".format(id), "artist deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "artist with id {0} doesn't exist".format(id)
    )
