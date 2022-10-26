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


# Get a artist with a matching name
@ArtistRouter.get("/{artist_name}", response_description="artist retrieved")
async def get_artist_data(artist_name):
    artist = await retrieve_artist(artist_name)
    return ResponseModel(artist, "artist retrieved successfully")


# Update a artist with a matching name
@ArtistRouter.put("/{artist_name}")
async def update_artist_data(artist_name: str, req: UpdateArtistModel = Body(...)):
    req = jsonable_encoder(req)
    updated_artist = await update_artist(artist_name, req)
    return ResponseModel(
        updated_artist, "Artist with name: {0} update is successful".format(artist_name)
    )


# Delete a artist with a matching name
@ArtistRouter.delete(
    "/{artist_name}", response_description="artist deleted from the database"
)
async def delete_artist_data(artist_name: str):
    await delete_artist(artist_name)
    return ResponseModel(
        "artist with name: {0} removed".format(artist_name),
        "artist deleted successfully",
    )


# Get all albums of an artist
@ArtistRouter.get(
    "/{artist_name}/albums", response_description="artist albums retrieved sucessfully"
)
async def get_album_songs(artist_name: str):
    albums = await retrieve_artist_albums(artist_name)
    if albums:
        return ResponseModel(albums, "All artist albums retrieved successfully")
    return ResponseModel(albums, "Empty list returned")
