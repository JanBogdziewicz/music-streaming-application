from bson.objectid import ObjectId
from server.models.library import LibrarySchema
from server.config import database
from fastapi.encoders import jsonable_encoder

libraries_collection = database.get_collection("libraries")

# helper
def library_helper(library) -> dict:
    return {
        "id": str(library["_id"]),
        "playlists": library["playlists"],
        "artists": library["artists"],
        "albums": library["albums"],
        "songs": library["songs"],
    }


# Retrieve all libraries present in the database
async def retrieve_libraries():
    libraries = []
    async for library in libraries_collection.find():
        libraries.append(library_helper(library))
    return libraries


# Add a new library to the database
async def add_library() -> dict:
    new_library = jsonable_encoder(LibrarySchema())
    library = await libraries_collection.insert_one(new_library)
    new_library = await libraries_collection.find_one({"_id": library.inserted_id})
    return library_helper(new_library)


# Retrieve a library with a matching ID
async def retrieve_library(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        return library_helper(library)
    else:
        return False


# Delete a library from the database
async def delete_library(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        await libraries_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False


# Pull item/s from library collection
async def pull_items_library(id: str, collection: str, ids: list[str]):
    return libraries_collection.update_one(
        {"_id": ObjectId(id)},
        {"$pull": {collection: {"$in": ids}}},
    )


# Append item/s to library collection
async def append_items_library(id: str, collection: str, ids: list[str]):
    return libraries_collection.update_one(
        {"_id": ObjectId(id)},
        {"$addToSet": {collection: {"$each": ids}}},
    )
