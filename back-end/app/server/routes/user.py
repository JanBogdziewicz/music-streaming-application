from dbm.ndbm import library
from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from server.database.library import retrieve_library
from server.database.library import delete_library

from server.database.library import add_library

from server.database.user import (
    add_user,
    delete_user,
    retrieve_user,
    retrieve_users,
    update_user,
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
    user_library = await add_library()
    user.library = user_library["id"]
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


# Get a library of the user with a matching ID
@UserRouter.get("/{id}/library", response_description="User library retrieved")
async def get_user_library(id):
    user = await retrieve_user(id)
    if user:
        library = await retrieve_library(user["library"])
        if library:
            return ResponseModel(library, "Library retrieved successfully")
        else:
            return ErrorResponseModel(
                "An error occurred.", 404, "Library doesn't exist."
            )
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
    user = await retrieve_user(id)
    await delete_library(user["id"])
    deleted_user = await delete_user(id)
    if deleted_user:
        return ResponseModel(
            "User with ID: {0} removed".format(id), "User deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "User with id {0} doesn't exist".format(id)
    )
