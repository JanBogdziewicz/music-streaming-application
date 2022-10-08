from bson.objectid import ObjectId
from pymongo.collection import Collection
from server.database.library import (
    add_library,
    delete_library,
    pull_items_library,
    append_items_library,
)
from server.config import database

users_collection: Collection = database.get_collection("users")

# helper
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "birth_date": user["birth_date"],
        "join_date": user["join_date"],
        "country": user["country"],
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
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            return user_helper(user)
    return False


# Update a user with a matching ID
async def update_user(id: str, data: dict):
    # Return false if an empty request body is sent.
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await users_collection.update_one(
                {"_id": ObjectId(id)}, {"$set": data}
            )
            if updated_user:
                return True
    return False


# Delete a user from the database
async def delete_user(id: str):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            deleted_library = await delete_library(user["library"])
            deleted_user = await users_collection.delete_one({"_id": ObjectId(id)})
            if deleted_library and deleted_user:
                return True
    return False


# Append item/s to user's library
async def append_library(id: str, collection: str, ids: list[str]):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await append_items_library(user["library"], collection, ids)
            if updated_user:
                return True
    return False


# Pull item/s from user's library collection
async def pull_library(id: str, collection: str, ids: list[str]):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await pull_items_library(user["library"], collection, ids)
            if updated_user:
                return True
    return False


# Append song/s to user's queue
async def append_queue(id: str, ids: list[str]):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await users_collection.update_one(
                {"_id": ObjectId(id)},
                {"$push": {"queue": {"$each": ids}}},
            )
            if updated_user:
                return True
    return False


# Pull song/s from user's queue collection
async def pull_queue(id: str, ids: list[str]):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await users_collection.update_one(
                {"_id": ObjectId(id)},
                {"$pull": {"queue": {"$in": ids}}},
            )
            if updated_user:
                return True
    return False


# Clear a queue of the user
async def clear_queue(id: str):
    if ObjectId.is_valid(id):
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if user:
            updated_user = await users_collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"queue": []}},
            )
            if updated_user:
                return True
    return False