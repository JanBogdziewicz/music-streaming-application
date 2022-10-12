from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from server.database.library import retrieve_library

from server.database.search import retrieve_user_searches
from server.database.playlist import retreive_users_playlists
from server.database.listening import retrieve_user_listenings
from server.database.library import (
    retrieve_library_playlists,
    retrieve_library_albums,
    retrieve_library_artists,
    retrieve_library_songs,
)

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
    return ResponseModel(user, "User retrieved successfully")


# Update a user with a matching ID
@UserRouter.put("/{username}")
async def update_user_data(username: str, req: UpdateUserModel = Body(...)):
    req = jsonable_encoder(req)
    await update_user(username, req)
    return ResponseModel(
        "User {0} update is successful".format(username),
        "User updated successfully",
    )


# Delete a user with a matching ID
@UserRouter.delete("/{username}", response_description="User deleted from the database")
async def delete_user_data(username: str):
    await delete_user(id)
    return ResponseModel(
        "User {0} removed".format(username), "User deleted successfully"
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
    await pull_library(username, collection, ids)
    return ResponseModel(
        "{0} with IDs: {1} deleted from library of user {2}".format(
            collection, ids, username
        ),
        "{0} deleted succesfully from user's library".format(collection),
    )


# Get a library of a user
@UserRouter.get("/{username}/library", response_description="Library retrieved")
async def get_library_data(username: str):
    user = await retrieve_user(username)
    library = await retrieve_library(user["library"])
    return ResponseModel(library, "Library of the user retrieved successfully")


# Append song/s to user's queue
@UserRouter.post(
    "/{username}/append_queue",
    response_description="Song/s appended to the user's queue",
)
async def append_queue_data(username: str, req: list[str] = Body(...)):
    await append_queue(username, req)
    return ResponseModel(
        "Song/s with IDs: {0} appeneded to queue of user {1}".format(req, username),
        "Song/s added succesfully to user's queue",
    )


# Prepend song/s to user's queue
@UserRouter.post(
    "/{username}/prepend_queue",
    response_description="Song/s prepended to the user's queue",
)
async def prepend_queue_data(username: str, req: list[str] = Body(...)):
    await prepend_queue(username, req)
    return ResponseModel(
        "Song/s with IDs: {0} prepended to queue of user {1}".format(req, username),
        "Song/s added succesfully to user's queue",
    )


# Pull song/s from user's queue
@UserRouter.post(
    "/{username}/pull_queue",
    response_description="Song/s pulled from user's queue",
)
async def pull_queue_data(username: str, req: list[str] = Body(...)):
    await pull_queue(username, req)
    return ResponseModel(
        "Song/s with IDs: {0} deleted from queue of user {1}".format(req, username),
        "Song/s deleted succesfully from user's queue",
    )


# Clear queue of the user
@UserRouter.delete(
    "/{username}/clear_queue", response_description="User's queue cleared"
)
async def clear_queue_data(username: str):
    await clear_queue(username)
    return ResponseModel(
        "Queue of the user {0} cleared".format(username),
        "Queue cleared successfully",
    )


# Get a queue of a user
@UserRouter.get("/{username}/queue", response_description="Queue retrieved")
async def get_queue_data(username: str):
    user = await retrieve_user(username)
    queue = user["queue"]
    return ResponseModel(queue, "Queue of the user retrieved successfully")


# Get all user's playlists
@UserRouter.get(
    "/{username}/playlists", response_description="User's playlists retreived"
)
async def get_users_playlists(username: str):
    playlists = await retreive_users_playlists(username)
    return ResponseModel(playlists, "Playlists retreived successfully")


# Get all user's search requests
@UserRouter.get(
    "/{username}/searches", response_description="User's search requests retreived"
)
async def get_users_searches(username: str):
    searches = await retrieve_user_searches(username)
    return ResponseModel(searches, "Search requests retreived successfully")


# Get all user's listenings
@UserRouter.get(
    "/{username}/listenings", response_description="User's listenings retreived"
)
async def get_users_listenings(username: str):
    listenings = await retrieve_user_listenings(username)
    return ResponseModel(listenings, "Listenings retreived successfully")


# Get all user's library playlists
@UserRouter.get(
    "/{username}/library/playlists",
    response_description="User's library playlists retreived",
)
async def get_users_library_playlists(username: str):
    playlists = await retrieve_library_playlists(username)
    return ResponseModel(playlists, "Library playlists retreived successfully")


# Get all user's library albums
@UserRouter.get(
    "/{username}/library/albums",
    response_description="User's library albums retreived",
)
async def get_users_library_albums(username: str):
    albums = await retrieve_library_albums(username)
    return ResponseModel(albums, "Library albums retreived successfully")


# Get all user's library artists
@UserRouter.get(
    "/{username}/library/artists",
    response_description="User's library artists retreived",
)
async def get_users_library_artists(username: str):
    artists = await retrieve_library_artists(username)
    return ResponseModel(artists, "Library artists retreived successfully")


# Get all user's library songs
@UserRouter.get(
    "/{username}/library/songs",
    response_description="User's library songs retreived",
)
async def get_users_library_songs(username: str):
    songs = await retrieve_library_songs(username)
    return ResponseModel(songs, "Library playlists retreived successfully")
