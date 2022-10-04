from dbm.ndbm import library
from readline import append_history_file
from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from server.database.user import (
    add_user,
    delete_user,
    retrieve_user,
    retrieve_users,
    update_user,
    append_list,
)

from server.models.user import (
    ErrorResponseModel,
    ResponseModel,
    UserSchema,
    UpdateUserModel,
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
    return ErrorResponseModel("An error occurred.", 404, "User doesn't exist.")


# Update a user with a matching ID
@UserRouter.put("/{id}")
async def update_user_data(id: str, req: UpdateUserModel = Body(...)):
    req = {k: v for k, v in req.dict().items() if v is not None}
    updated_user = await update_user(id, req)
    if updated_user:
        return ResponseModel(
            "User with ID: {0} update is successful".format(id),
            "User updated successfully",
        )
    return ErrorResponseModel(
        "An error occurred",
        404,
        "There was an error while updating the user.",
    )


# Delete a user with a matching ID
@UserRouter.delete("/{id}", response_description="User deleted from the database")
async def delete_user_data(id: str):
    deleted_user = await delete_user(id)
    if deleted_user:
        return ResponseModel(
            "User with ID: {0} removed".format(id), "User deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "User with id {0} doesn't exist".format(id)
    )


# Add a new song to user's library
@UserRouter.post(
    "/{user_id}/library", response_description="Song added to the user's library"
)
async def append_library_data(user_id: str, song_ids: list[str] = Body(...)):
    req = {"library": song_ids}
    updated_user = await append_list(user_id, req)
    if updated_user:
        return ResponseModel(
            "Songs with IDs: {0} added to library of user with ID: {1}".format(
                song_ids, user_id
            ),
            "Song added succesfully to user's library",
        )
    return ErrorResponseModel(
        "An error occurred.",
        404,
        "There was an error while adding the song to user's library",
    )


# Delete a song from user's library
@UserRouter.delete(
    "/{user_id}/library/{song_id}",
    response_description="Song deleted from user's library",
)
async def remove_library_data(user_id: str, song_id: str):
    user = await retrieve_user(user_id)
    if user:
        user["library"].remove(song_id)
        return ResponseModel(
            "Song with ID: {0} deleted from library of user with ID: {1}".format(
                song_id, user_id
            ),
            "Song deleted succesfully from user's library",
        )
    return ErrorResponseModel("An error occurred.", 404, "User doesn't exist.")
