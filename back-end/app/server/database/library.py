from bson.objectid import ObjectId
from server.models.library import LibrarySchema
from server.config import (
    playlists_collection,
    artists_collection,
    albums_collection,
    songs_collection,
    libraries_collection,
)
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException
from pymongo.collection import Collection

from server.database.playlist import playlist_helper
from server.database.artist import artist_helper
from server.database.album import album_helper
from server.database.song import song_helper


# helper
def library_helper(library) -> dict:
    return {
        "id": str(library["_id"]),
        "playlists": list(map(lambda x: str(x), library["playlists"])),
        "artists": list(map(lambda x: str(x), library["artists"])),
        "albums": list(map(lambda x: str(x), library["albums"])),
        "songs": list(map(lambda x: str(x), library["songs"])),
    }


# Retrieve all libraries present in the database
async def retrieve_libraries():
    libraries = []
    async for library in libraries_collection.find():
        libraries.append(library_helper(library))
    return libraries


# Add a new library to the database
async def add_library() -> dict:
    new_library = jsonable_encoder(LibrarySchema())
    library = await libraries_collection.insert_one(new_library)
    new_library = await libraries_collection.find_one({"_id": library.inserted_id})
    return library_helper(new_library)


# Retrieve a library with a matching ID
async def retrieve_library(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        return library_helper(library)
    else:
        raise HTTPException(status_code=404, detail="Library not found")


# Delete a library from the database
async def delete_library(id: str):
    deleted = await libraries_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="Library not found")


# Pull item/s from library collection
async def pull_items_library(id: str, collection: str, ids: list[str]):
    updated = await libraries_collection.update_one(
        {"_id": ObjectId(id)},
        {"$pull": {collection: {"$in": list(map(lambda x: ObjectId(x), ids))}}},
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User library not found")


# Append item/s to library collection
async def append_items_library(id: str, collection: str, ids: list[str]):
    updated = await libraries_collection.update_one(
        {"_id": ObjectId(id)},
        {"$addToSet": {collection: {"$each": list(map(lambda x: ObjectId(x), ids))}}},
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User library not found")


# Retrieve all library playlists
async def retrieve_library_playlists(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    playlists = []
    async for playlist in playlists_collection.find(
        {"_id": {"$in": library["playlists"]}}
    ):
        playlists.append(playlist_helper(playlist))
    return playlists


# Retrieve all library artists
async def retrieve_library_artists(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    artists = []
    async for artist in artists_collection.find({"_id": {"$in": library["artists"]}}):
        artists.append(artist_helper(artist))
    return artists


# Retrieve all library albums
async def retrieve_library_albums(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    albums = []
    async for album in albums_collection.find({"_id": {"$in": library["albums"]}}):
        albums.append(album_helper(album))
    return albums


# Retrieve all library songs
async def retrieve_library_songs(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    songs = []
    async for song in songs_collection.find({"_id": {"$in": library["songs"]}}):
        songs.append(song_helper(song))
    return songs
