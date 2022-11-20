from fastapi import (
    APIRouter,
    Body,
    FastAPI,
    status,
    HTTPException,
    Depends,
    UploadFile,
    File,
)
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response
from fastapi.responses import RedirectResponse
from server.models.user import UserOut, UserAuth, UserSchemaNoPass
from server.utils import *
from uuid import uuid4
from fastapi.security import OAuth2PasswordRequestForm
from server.models.user import TokenSchema, SystemUser
from server.deps import get_current_user
from server.database.images import upload_user_avatar


from server.database.images import download_user_avatar

from server.database.library import retrieve_library

from server.database.search import retrieve_user_searches
from server.database.playlist import retrieve_users_playlists
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
    retrieve_user_no_pass,
    retrieve_users,
    update_user,
    append_library,
    pull_library,
    append_queue,
    prepend_queue,
    pull_queue,
    clear_queue,
    retrieve_queue_songs,
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


# Login user
@UserRouter.post(
    "/login", summary="Create access token for user", response_model=TokenSchema
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await retrieve_user(form_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    hashed_pass = user["password"]
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    return {
        "access_token": create_access_token(user["username"]),
    }


# Get all users
@UserRouter.get("/", response_description="All users retrieved")
async def get_users():
    users = await retrieve_users()
    if users:
        return ResponseModel(users, "All users retrieved successfully")
    return ResponseModel(users, "Empty list returned")


# Get a user with a matching username
@UserRouter.get("/{username}", response_description="User retrieved")
async def get_user_data(username: str):
    user = await retrieve_user_no_pass(username)
    return ResponseModel(user, "User retrieved successfully")


# Update a user with a matching username
@UserRouter.put("/{username}")
async def update_user_data(username: str, req: UpdateUserModel = Body(...)):
    req = jsonable_encoder(req)
    await update_user(username, req)
    return ResponseModel(
        "User {0} update is successful".format(username),
        "User updated successfully",
    )


# Delete a user with a matching username
@UserRouter.delete("/{username}", response_description="User deleted from the database")
async def delete_user_data(username: str):
    await delete_user(username)
    return ResponseModel(
        "User {0} removed".format(username), "User deleted successfully"
    )


# Append new item/s to user's library
@UserRouter.put(
    "/{username}/library/append",
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
    "/{username}/library/pull",
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
    "/{username}/queue/append",
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
    "/{username}/queue/prepend",
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
    "/{username}/queue/pull",
    response_description="Song/s pulled from user's queue",
)
async def pull_queue_data(username: str, req: list[int] = Body(...)):
    await pull_queue(username, req)
    return ResponseModel(
        "Song/s with indexes: {0} pulled from queue of user {1}".format(req, username),
        "Song/s pulled succesfully from user's queue",
    )


# Clear queue of the user
@UserRouter.delete(
    "/{username}/queue/clear", response_description="User's queue cleared"
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


# Get all songs from user's queue
@UserRouter.get("/{username}/queue/songs", response_description="Queue songs retrieved")
async def get_users_queue_songs(username: str):
    songs = await retrieve_queue_songs(username)
    if songs:
        songs_with_index = []
        index = 0
        for song in songs:
            song = {"index": index, **song}
            index += 1
            songs_with_index.append(song)
        return ResponseModel(songs_with_index, "All queue songs retrieved successfully")
    return ResponseModel(songs, "Empty list returned")


# Get all user's playlists
@UserRouter.get(
    "/{username}/playlists", response_description="User's playlists retrieved"
)
async def get_users_playlists(username: str):
    playlists = await retrieve_users_playlists(username)
    if playlists:
        return ResponseModel(playlists, "Playlists retrieved successfully")
    return ResponseModel(playlists, "Empty list returned")


# Get all user's search requests
@UserRouter.get(
    "/{username}/searches", response_description="User's search requests retrieved"
)
async def get_users_searches(username: str):
    searches = await retrieve_user_searches(username)
    if searches:
        return ResponseModel(searches, "Search requests retrieved successfully")
    return ResponseModel(searches, "Empty list returned")


# Get all user's listenings
@UserRouter.get(
    "/{username}/listenings", response_description="User's listenings retrieved"
)
async def get_users_listenings(username: str):
    listenings = await retrieve_user_listenings(username)
    if listenings:
        return ResponseModel(listenings, "Listenings retrieved successfully")
    return ResponseModel(listenings, "Empty list returned")


# Get all user's library playlists
@UserRouter.get(
    "/{username}/library/playlists",
    response_description="User's library playlists retrieved",
)
async def get_users_library_playlists(username: str):
    user = await retrieve_user(username)
    playlists = await retrieve_library_playlists(user["library"])
    if playlists:
        return ResponseModel(playlists, "Library playlists retrieved successfully")
    return ResponseModel(playlists, "Empty list returned")


# Get all user's library albums
@UserRouter.get(
    "/{username}/library/albums",
    response_description="User's library albums retrieved",
)
async def get_users_library_albums(username: str):
    user = await retrieve_user(username)
    albums = await retrieve_library_albums(user["library"])
    if albums:
        return ResponseModel(albums, "Library albums retrieved successfully")
    return ResponseModel(albums, "Empty list returned")


# Get all user's library artists
@UserRouter.get(
    "/{username}/library/artists",
    response_description="User's library artists retrieved",
)
async def get_users_library_artists(username: str):
    user = await retrieve_user(username)
    artists = await retrieve_library_artists(user["library"])
    if artists:
        return ResponseModel(artists, "Library artists retrieved successfully")
    return ResponseModel(artists, "Empty list returned")


# Get all user's library songs
@UserRouter.get(
    "/{username}/library/songs",
    response_description="User's library songs retrieved",
)
async def get_users_library_songs(username: str):
    user = await retrieve_user(username)
    songs = await retrieve_library_songs(user["library"])
    if songs:
        return ResponseModel(songs, "Library playlists retrieved successfully")
    return ResponseModel(songs, "Empty list returned")


# Get avatar of a user
@UserRouter.get(
    "/{username}/avatar", response_description="user avatar retrieved sucessfully"
)
async def get_user_avatar(username: str):
    user = await retrieve_user(username)
    avatar = await download_user_avatar(user["avatar"])
    return Response(avatar)


# Get current user
@UserRouter.get("/auth/me", summary="Get details of currently logged in user")
async def get_me(user: UserSchemaNoPass = Depends(get_current_user)):
    return ResponseModel(user, "User logged in")


# Update avatar of a user
@UserRouter.put("/{id}/avatar", response_description="user avatar updated sucessfully")
async def update_user_avatar(username: str, file: UploadFile = File(...)):
    user = await retrieve_user(username)
    updated_cover_id = await upload_user_avatar(user["avatar"], file.file)
    user["avatar"] = updated_cover_id
    await update_user(username, user)
    return ResponseModel(
        updated_cover_id, "user {0} update is successful".format(username)
    )
