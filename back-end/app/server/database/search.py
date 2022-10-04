from bson.objectid import ObjectId
from server.config import database

searches_collection = database.get_collection("searches")

# helper
def search_helper(search) -> dict:
    return {
        "id": str(search["_id"]),
        "content": search["content"],
        "time": search["time"],
    }


# Retrieve all searches present in the database
async def retrieve_searches():
    searches = []
    async for search in searches_collection.find():
        searches.append(search_helper(search))
    return searches


# Add a new search to the database
async def add_search(search_data: dict) -> dict:
    search = await searches_collection.insert_one(search_data)
    new_search = await searches_collection.find_one({"_id": search.inserted_id})
    return search_helper(new_search)


# Retrieve a search with a matching ID
async def retrieve_search(id: str):
    search = await searches_collection.find_one({"_id": ObjectId(id)})
    if search:
        return search_helper(search)
    else:
        return False


# Delete a search from the database
async def delete_search(id: str):
    search = await searches_collection.find_one({"_id": ObjectId(id)})
    if search:
        await searches_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False
