from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder

from server.database.user import (
    add_user,
    delete_user,
    retrieve_user,
    retrieve_users,
    update_user,
    append_library,
    pull_library,
    append_queue,
    pull_queue,
    clear_queue,
)

from server.models.user import (
    ErrorResponseModel,
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
@UserRouter.get("/{id}", response_description="User retrieved")
async def get_user_data(id):
    user = await retrieve_user(id)
    if user:
        return ResponseModel(user, "User retrieved successfully")
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Update a user with a matching ID
@UserRouter.put("/{id}")
async def update_user_data(id: str, req: UpdateUserModel = Body(...)):
    req = jsonable_encoder(req)
    updated_user = await update_user(id, req)
    if updated_user:
        return ResponseModel(
            "User with ID: {0} update is successful".format(id),
            "User updated successfully",
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Delete a user with a matching ID
@UserRouter.delete("/{id}", response_description="User deleted from the database")
async def delete_user_data(id: str):
    deleted_user = await delete_user(id)
    if deleted_user:
        return ResponseModel(
            "User with ID: {0} removed".format(id), "User deleted successfully"
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Append new item/s to user's library
@UserRouter.put(
    "/{id}/append_library",
    response_description="Item/s appended to the user's library",
)
async def append_library_data(id: str, req: UpdateLibraryModel = Body(...)):
    req = req.dict()
    collection = req["collection_name"]
    ids = req["item_ids"]
    updated_user = await append_library(id, collection, ids)
    if updated_user:
        return ResponseModel(
            "{0} with IDs: {1} added to library of user with ID: {2}".format(
                collection, ids, id
            ),
            "{0} added succesfully to user's library".format(collection),
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Pull item/s from user's library
@UserRouter.put(
    "/{id}/pull_library",
    response_description="Item/s pulled from user's library",
)
async def pull_library_data(id: str, req: UpdateLibraryModel = Body(...)):
    req = req.dict()
    collection = req["collection_name"]
    ids = req["item_ids"]
    updated_user = await pull_library(id, collection, ids)
    if updated_user:
        return ResponseModel(
            "{0} with IDs: {1} deleted from library of user with ID: {2}".format(
                collection, ids, id
            ),
            "{0} deleted succesfully from user's library".format(collection),
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Append new song/s to user's queue
@UserRouter.post(
    "/{id}/append_queue",
    response_description="Song/s appended to the user's queue",
)
async def append_queue_data(id: str, req: list[str] = Body(...)):
    updated_user = await append_queue(id, req)
    if updated_user:
        return ResponseModel(
            "Song/s with IDs: {0} added to queue of user with ID: {1}".format(req, id),
            "Song/s added succesfully to user's queue",
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Pull song/s from user's queue
@UserRouter.post(
    "/{id}/pull_queue",
    response_description="Song/s pulled from user's queue",
)
async def pull_queue_data(id: str, req: list[str] = Body(...)):
    updated_user = await pull_queue(id, req)
    if updated_user:
        return ResponseModel(
            "Song/s with IDs: {0} deleted from queue of user with ID: {1}".format(
                req, id
            ),
            "Song/s deleted succesfully from user's queue",
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Clear queue of the user
@UserRouter.delete("/{id}/clear_queue", response_description="User's queue cleared")
async def clear_queue_data(id: str):
    updated_user = await clear_queue(id)
    if updated_user:
        return ResponseModel(
            "Queue of the user with ID: {0} cleared".format(id),
            "Queue cleared successfully",
        )
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )


# Get a queue of a user
@UserRouter.get("/{id}/queue", response_description="Queue retrieved")
async def get_queue_data(id):
    user = await retrieve_user(id)
    if user:
        queue = user["queue"]
        return ResponseModel(queue, "Queue of the user retrieved successfully")
    raise HTTPException(
        status_code=404, detail="User with id {0} doesn't exist".format(id)
    )
