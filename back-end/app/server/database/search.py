from bson.objectid import ObjectId
from server.config import searches_collection
from fastapi import HTTPException


# helper
def search_helper(search) -> dict:
    return {
        "id": str(search["_id"]),
        "content": search["content"],
        "time": search["time"],
        "user": search["user"],
    }


# Retrieve all search requests present in the database
async def retrieve_searches():
    searches = []
    async for search in searches_collection.find():
        searches.append(search_helper(search))
    return searches


# Add a new search request to the database
async def add_search(search_data: dict) -> dict:
    search = await searches_collection.insert_one(search_data)
    new_search = await searches_collection.find_one({"_id": search.inserted_id})
    return search_helper(new_search)


# Retrieve a search request with a matching ID
async def retrieve_search(id: str):
    search = await searches_collection.find_one({"_id": ObjectId(id)})
    if search:
        return search_helper(search)
    else:
        raise HTTPException(status_code=404, detail="Search request not found")


# Delete a search request from the database
async def delete_search(id: str):
    deleted = await searches_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="Search request not found")


# Retrieve all user's search requests
async def retrieve_user_searches(username: str):
    searches = []
    async for search in searches_collection.find({"user": username}):
        searches.append(search_helper(search))
    return searches
