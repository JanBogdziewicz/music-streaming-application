from bson.objectid import ObjectId
from server.models.listening import ListeningSchema
from server.config import database
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pymongo.collection import Collection
from server.database.song import song_helper

listenings_collection: Collection = database.get_collection("listenings")

# helper
def listening_helper(listening) -> dict:
    return {
        "id": str(listening["_id"]),
        "song": song_helper(listening["song"]),
        "time": listening["time"],
        "user": listening["user"],
    }


# Retrieve all listenings present in the database
async def retrieve_listenings():
    listenings = []
    async for listening in listenings_collection.find():
        listenings.append(listening_helper(listening))
    return listenings


# Add a new listening to the database
async def add_listening(listening_data: ListeningSchema) -> dict:
    new_listening = jsonable_encoder(listening_data)
    listening = await listenings_collection.insert_one(new_listening)
    new_listening = await listenings_collection.find_one({"_id": listening.inserted_id})
    return listening_helper(new_listening)


# Retrieve a listening with a matching ID
async def retrieve_listening(id: str):
    listening = await listenings_collection.find_one({"_id": ObjectId(id)})
    if listening:
        return listening_helper(listening)
    else:
        raise HTTPException(status_code=404, detail="Listening not found")


# Delete a listening from the database
async def delete_listening(id: str):
    deleted = await listenings_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="Listening not found")


# Retrieve all user's listenings
async def retrieve_user_listenings(username: str):
    listenings = []
    async for listening in listenings_collection.find({"user": username}):
        listenings.append(listening_helper(listening))
    return listenings
