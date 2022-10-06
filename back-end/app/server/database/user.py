from bson.objectid import ObjectId
from server.database.library import (
    add_library,
    delete_library,
    pull_items_library,
    append_items_library,
)
from server.config import database

users_collection = database.get_collection("users")

# helper
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "birth_date": user["birth_date"],
        "join_date": user["join_date"],
        "country": user["country"],
        "listenings": user["listenings"],
        "playlists": user["playlists"],
        "queue": user["queue"],
        "library": user["library"],
        "settings": user["settings"],
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
    user_data["library"] = library["id"]
    user = await users_collection.insert_one(user_data)
    new_user = await users_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)


# Retrieve a user with a matching ID
async def retrieve_user(id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if user:
        return user_helper(user)
    else:
        return False


# Update a user with a matching ID
async def update_user(id: str, data: dict):
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if user:
        updated_user = await users_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if updated_user:
            return True
        return False
    else:
        return False


# Delete a user from the database
async def delete_user(id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if user:
        await delete_library(user["library"])
        await users_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False


# Append item/s to user's library
async def append_library(id: str, collection: str, ids: list[str]):
    # Return false if an empty request body is sent.
    if len(ids) < 1:
        return False
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if user:
        updated_user = await append_items_library(user["library"], collection, ids)
        if updated_user:
            return True
        return False
    else:
        return False


# Pull item/s from user's library collection
async def pull_library(id: str, collection: str, ids: list[str]):
    # Return false if an empty request body is sent.
    if len(ids) < 1:
        return False
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if user:
        updated_user = await pull_items_library(user["library"], collection, ids)
        if updated_user:
            return True
        return False
    else:
        return False
