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
    return ResponseModel(artist, "artist retrieved successfully")


# Update a artist with a matching ID
@ArtistRouter.put("/{id}")
async def update_artist_data(id: str, req: UpdateArtistModel = Body(...)):
    req = jsonable_encoder(req)
    updated_artist = await update_artist(id, req)
    return ResponseModel(
        updated_artist, "Artist with ID: {0} update is successful".format(id)
    )


# Delete a artist with a matching ID
@ArtistRouter.delete("/{id}", response_description="artist deleted from the database")
async def delete_artist_data(id: str):
    await delete_artist(id)
    return ResponseModel(
        "artist with ID: {0} removed".format(id), "artist deleted successfully"
    )


# Get all albums of an artist
@ArtistRouter.get(
    "/{id}/albums", response_description="artist albums retrieved sucessfully"
)
async def get_album_songs(id: str):
    albums = await retrieve_artist_albums(id)
    if albums:
        return ResponseModel(albums, "All artist albums retrieved successfully")
    return ResponseModel(albums, "Empty list returned")
