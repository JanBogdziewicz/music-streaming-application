from server.database.playlist import retreive_users_playlists
from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from server.database.library import retrieve_library

from server.database.user import (
    add_user,
    delete_user,
    retrieve_user,
    retrieve_users,
    update_user,
    append_library,
    pull_library,
    append_queue,
    prepend_queue,
    pull_queue,
    clear_queue,
)

from server.models.user import (
    ResponseModel,
    UserSchema,
    UpdateUserModel,
    UpdateLibraryModel,
)

UserRouter = APIRouter()

# Add a new user
@UserRouter.post("/", response_description="User added into the database")
async def add_user_data(user: UserSchema = Body(...)):
    user = jsonable_encoder(user)
    new_user = await add_user(user)
    return ResponseModel(new_user, "User added successfully.")


# Get all users
@UserRouter.get("/", response_description="All users retrieved")
async def get_users():
    users = await retrieve_users()
    if users:
        return ResponseModel(users, "All users retrieved successfully")
    return ResponseModel(users, "Empty list returned")


# Get a user with a matching ID
@UserRouter.get("/{username}", response_description="User retrieved")
async def get_user_data(username: str):
    user = await retrieve_user(username)
    if user:
        return ResponseModel(user, "User retrieved successfully")
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Update a user with a matching ID
@UserRouter.put("/{username}")
async def update_user_data(username: str, req: UpdateUserModel = Body(...)):
    req = jsonable_encoder(req)
    updated_user = await update_user(username, req)
    if updated_user:
        return ResponseModel(
            "User {0} update is successful".format(username),
            "User updated successfully",
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Delete a user with a matching ID
@UserRouter.delete("/{username}", response_description="User deleted from the database")
async def delete_user_data(username: str):
    deleted_user = await delete_user(id)
    if deleted_user:
        return ResponseModel(
            "User {0} removed".format(username), "User deleted successfully"
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Append new item/s to user's library
@UserRouter.put(
    "/{username}/append_library",
    response_description="Item/s appended to the user's library",
)
async def append_library_data(username: str, req: UpdateLibraryModel = Body(...)):
    req = req.dict()
    collection = req["collection_name"]
    ids = req["item_ids"]
    await append_library(username, collection, ids)
    return ResponseModel(
        "{0} with IDs: {1} added to library of user {2}".format(
            collection, ids, username
        ),
        "{0} added succesfully to user's library".format(collection),
    )


# Pull item/s from user's library
@UserRouter.put(
    "/{username}/pull_library",
    response_description="Item/s pulled from user's library",
)
async def pull_library_data(username: str, req: UpdateLibraryModel = Body(...)):
    req = req.dict()
    collection = req["collection_name"]
    ids = req["item_ids"]
    updated_user = await pull_library(username, collection, ids)
    if updated_user:
        return ResponseModel(
            "{0} with IDs: {1} deleted from library of user {2}".format(
                collection, ids, username
            ),
            "{0} deleted succesfully from user's library".format(collection),
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Get a library of a user
@UserRouter.get("/{username}/library", response_description="Library retrieved")
async def get_library_data(username: str):
    user = await retrieve_user(username)
    if user:
        library = await retrieve_library(user["library"])
        return ResponseModel(library, "Library of the user retrieved successfully")
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Append song/s to user's queue
@UserRouter.post(
    "/{username}/append_queue",
    response_description="Song/s appended to the user's queue",
)
async def append_queue_data(username: str, req: list[str] = Body(...)):
    updated_user = await append_queue(username, req)
    if updated_user:
        return ResponseModel(
            "Song/s with IDs: {0} appeneded to queue of user {1}".format(req, username),
            "Song/s added succesfully to user's queue",
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Prepend song/s to user's queue
@UserRouter.post(
    "/{username}/prepend_queue",
    response_description="Song/s prepended to the user's queue",
)
async def prepend_queue_data(username: str, req: list[str] = Body(...)):
    updated_user = await prepend_queue(username, req)
    if updated_user:
        return ResponseModel(
            "Song/s with IDs: {0} prepended to queue of user {1}".format(req, username),
            "Song/s added succesfully to user's queue",
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Pull song/s from user's queue
@UserRouter.post(
    "/{username}/pull_queue",
    response_description="Song/s pulled from user's queue",
)
async def pull_queue_data(username: str, req: list[str] = Body(...)):
    updated_user = await pull_queue(username, req)
    if updated_user:
        return ResponseModel(
            "Song/s with IDs: {0} deleted from queue of user {1}".format(req, username),
            "Song/s deleted succesfully from user's queue",
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Clear queue of the user
@UserRouter.delete(
    "/{username}/clear_queue", response_description="User's queue cleared"
)
async def clear_queue_data(username: str):
    updated_user = await clear_queue(username)
    if updated_user:
        return ResponseModel(
            "Queue of the user {0} cleared".format(username),
            "Queue cleared successfully",
        )
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Get a queue of a user
@UserRouter.get("/{username}/queue", response_description="Queue retrieved")
async def get_queue_data(username: str):
    user = await retrieve_user(username)
    if user:
        queue = user["queue"]
        return ResponseModel(queue, "Queue of the user retrieved successfully")
    raise HTTPException(
        status_code=404, detail="User {0} doesn't exist".format(username)
    )


# Get all user's playlists
@UserRouter.get(
    "/{username}/playlists", response_description="User's playlists retreived"
)
async def get_users_playlists(username):
    playlists = await retreive_users_playlists(username)
    return ResponseModel(playlists, "Playlists retreived successfully")
