from bson.objectid import ObjectId
from server.database.database import database

libraries_collection = database.get_collection("libraries")

# helper
def library_helper(library) -> dict:
    return {
        "id": str(library["_id"]),
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
    library = await libraries_collection.insert_one({"songs": []})
    new_library = await libraries_collection.find_one({"_id": library.inserted_id})
    return library_helper(new_library)


# Retrieve a library with a matching ID
async def retrieve_library(id: str):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        return library_helper(library)
    else:
        return False


# Add a song to the library
async def add_song_library(id: str, song_data: dict):
    # Return false if an empty request body is sent.
    if len(song_data) < 1:
        return False
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        updated_library = await libraries_collection.update_one(
            {"_id": ObjectId(id)}, {"$push": {"songs": song_data}}
        )
        if updated_library:
            return True
        return False
    else:
        return False


# Delete a song from library
async def delete_song_library(id: str, song_data: dict):
    library = await libraries_collection.find_one({"_id": ObjectId(id)})
    if library:
        updated_library = await libraries_collection.update_one(
            {"_id": ObjectId(id)}, {"$pull": {"songs": song_data}}
        )
        if updated_library:
            return True
        return False
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
