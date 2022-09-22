from typing import Union
from bson.objectid import ObjectId
import motor.motor_asyncio

MONGO_DETAILS = "test-mongo:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.music

songs_collection = database.get_collection("songs")

# helpers


def song_helper(song) -> dict:
    return {
        "id": str(song["_id"]),
        "name": song["name"],
        "genre": song["genre"],
        "artist": song["artist"],
        "album": song["album"],
        "length": song["length"],
        "release_date": song["release_date"],
    }


# Retrieve all songs present in the database


async def retrieve_songs():
    songs = []
    async for song in songs_collection.find():
        songs.append(song_helper(song))
    return songs


# Add a new song to the database
async def add_song(song_data: dict) -> dict:
    song = await songs_collection.insert_one(song_data)
    new_song = await songs_collection.find_one({"_id": song.inserted_id})
    return song_helper(new_song)


# Retrieve a song with a matching ID
async def retrieve_song(id: str) -> Union[dict, bool]:
    song = await songs_collection.find_one({"_id": ObjectId(id)})
    if song:
        return song_helper(song)
    else:
        return False


# Update a song with a matching ID
async def update_song(id: str, data: dict):
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False
    song = await songs_collection.find_one({"_id": ObjectId(id)})
    if song:
        updated_song = await songs_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if updated_song:
            return True
        return False
    else:
        return False


# Delete a song from the database
async def delete_song(id: str):
    song = await songs_collection.find_one({"_id": ObjectId(id)})
    if song:
        await songs_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False
