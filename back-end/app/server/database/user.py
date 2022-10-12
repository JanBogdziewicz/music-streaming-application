from bson.objectid import ObjectId
from pymongo.collection import Collection
from fastapi import HTTPException
from server.database.library import (
    add_library,
    delete_library,
    pull_items_library,
    append_items_library,
)
from server.config import database
from server.database.song import song_helper, songs_collection


users_collection: Collection = database.get_collection("users")

# helper
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "birth_date": user["birth_date"],
        "join_date": user["join_date"],
        "country": user["country"],
        "queue": list(map(lambda x: str(x), user["queue"])),
        "library": str(user["library"]),
    }


# Retrieve all users present in the database
async def retrieve_users():
    users = []
    async for user in users_collection.find():
        users.append(user_helper(user))
    return users


# Add a new user to the database
async def add_user(user_data: dict) -> dict:
    library = await add_library()
    user_data["library"] = library["_id"]
    user = await users_collection.insert_one(user_data)
    new_user = await users_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)


# Retrieve a user with a matching ID
async def retrieve_user(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        return user_helper(user)
    else:
        raise HTTPException(status_code=404, detail="User not found")


# Update a user with a matching ID
async def update_user(username: str, data: dict):
    updated = await users_collection.update_one({"username": username}, {"$set": data})
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User not found")


# Delete a user from the database
async def delete_user(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        await delete_library(user["library"])
        await users_collection.delete_one({"username": username})
    else:
        raise HTTPException(status_code=404, detail="User not found")


# Append item/s to user's library
async def append_library(username: str, collection: str, ids: list[str]):
    user = await users_collection.find_one({"username": username})
    if user:
        append_items_library(user["library"], collection, ids)
    else:
        raise HTTPException(status_code=404, detail="User not found")


# Pull item/s from user's library collection
async def pull_library(username: str, collection: str, ids: list[str]):
    user = await users_collection.find_one({"username": username})
    if user:
        pull_items_library(user["library"], collection, ids)
    else:
        raise HTTPException(status_code=404, detail="User not found")


# Append song/s to user's queue
async def append_queue(username: str, ids: list[str]):
    updated = await users_collection.update_one(
        {"username": username},
        {"$push": {"queue": {"$each": list(map(lambda x: ObjectId(x), ids))}}},
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User not found")


# Prepend song/s to user's queue
async def prepend_queue(username: str, ids: list[str]):
    updated = await users_collection.update_one(
        {"username": username},
        {
            "$push": {
                "queue": {
                    "$each": list(map(lambda x: ObjectId(x), ids)),
                    "$position": 0,
                }
            }
        },
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User not found")


# Pull song/s from user's queue collection
async def pull_queue(username: str, ids: list[str]):
    updated = await users_collection.update_one(
        {"username": username},
        {"$pull": {"queue": {"$in": list(map(lambda x: ObjectId(x), ids))}}},
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User not found")


# Clear a queue of the user
async def clear_queue(username: str):
    updated = await users_collection.update_one(
        {"username": username},
        {"$set": {"queue": []}},
    )
    if updated.matched_count < 1:
        raise HTTPException(status_code=404, detail="User not found")


# Retrieve all queue songs
async def retrieve_queue_songs(username: str):
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    songs = []
    async for song in songs_collection.find({"_id": {"$in": user["queue"]}}):
        songs.append(song_helper(song))
    return songs
