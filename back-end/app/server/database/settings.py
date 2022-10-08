from bson.objectid import ObjectId
from server.config import database
from pymongo.collection import Collection

settings_collection: Collection = database.get_collection("settings")

# helper
def settings_helper(settings) -> dict:
    return {
        "id": str(settings["_id"]),
        "content": settings["content"],
        "time": settings["time"],
    }


# Add new settings to the database
async def add_settings(settings_data: dict) -> dict:
    settings = await settings_collection.insert_one(settings_data)
    new_settings = await settings_collection.find_one({"_id": settings.inserted_id})
    return settings_helper(new_settings)


# Retrieve a settings request with a matching ID
async def retrieve_settings(id: str):
    if ObjectId.is_valid(id):
        settings = await settings_collection.find_one({"_id": ObjectId(id)})
        if settings:
            return settings_helper(settings)
    return False


# Delete a settings request from the database
async def delete_settings(id: str):
    if ObjectId.is_valid(id):
        settings = await settings_collection.find_one({"_id": ObjectId(id)})
        if settings:
            deleted_settings = await settings_collection.delete_one(
                {"_id": ObjectId(id)}
            )
            if deleted_settings:
                return True
    return False
