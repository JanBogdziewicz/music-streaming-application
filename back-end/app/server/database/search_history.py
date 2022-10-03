from bson.objectid import ObjectId
from server.database.database import database

search_histories_collection = database.get_collection("search_histories")

# helper
def search_history_helper(search_history) -> dict:
    return {
        "id": str(search_history["_id"]),
        "searches": search_history["searches"],
    }


# Retrieve all search histories present in the database
async def retrieve_search_histories():
    search_histories = []
    async for search_history in search_histories_collection.find():
        search_histories.append(search_history_helper(search_history))
    return search_histories


# Add a new search history to the database
async def add_search_history(search_history_data: dict) -> dict:
    search_history = await search_histories_collection.insert_one({"searches": []})
    new_search_history = await search_histories_collection.find_one(
        {"_id": search_history.inserted_id}
    )
    return search_history_helper(new_search_history)


# Retrieve a search history with a matching ID
async def retrieve_search_history(id: str):
    search_history = await search_histories_collection.find_one({"_id": ObjectId(id)})
    if search_history:
        return search_history_helper(search_history)
    else:
        return False


# Delete a search history from the database
async def delete_search_history(id: str):
    search_history = await search_histories_collection.find_one({"_id": ObjectId(id)})
    if search_history:
        await search_histories_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False
