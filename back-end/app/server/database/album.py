from fastapi import HTTPException
from bson.objectid import ObjectId
from pymongo.collection import Collection
from server.config import database
from server.database.song import song_helper

albums_collection: Collection = database.get_collection("albums")
songs_collection: Collection = database.get_collection("songs")

# helper
def album_helper(album) -> dict:
    return {
        "id": str(album["_id"]),
        "name": album["name"],
        "relase_date": album["release_date"],
        "label": album["label"],
        "album_type": album["album_type"],
        "genres": album["genres"],
        "artist": album["artist"],
        "cover_path": album["cover_path"],
    }


# Retrieve all albums present in the database
async def retrieve_albums():
    albums = []
    async for album in albums_collection.find():
        albums.append(album_helper(album))
    return albums


# Add a new album to the database
async def add_album(album_data: dict) -> dict:
    album = await albums_collection.insert_one(album_data)
    new_album = await albums_collection.find_one({"_id": album.inserted_id})
    return album_helper(new_album)


# Retrieve a album with a matching ID
async def retrieve_album(id: str):
    album = await albums_collection.find_one({"_id": ObjectId(id)})
    if not album:
        raise HTTPException(status_code=404, detail="album not found")
    return album_helper(album)


# Update a album with a matching ID
async def update_album(id: str, data: dict):
    update_status = await albums_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": data}
    )
    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="album not found")
    return album_helper(await albums_collection.find_one({"_id": ObjectId(id)}))


# Delete a album from the database
async def delete_album(id: str):
    deleted = await albums_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="album not found")


# Retrieve all songs of an album
async def retrieve_album_songs(id: str):
    album = await albums_collection.find_one({"_id": ObjectId(id)})
    if not album:
        raise HTTPException(status_code=404, detail="album not found")
    songs = []
    async for song in songs_collection.find(
        {"artist": album["artist"], "album": album["name"]}
    ):
        songs.append(song_helper(song))
    return songs
