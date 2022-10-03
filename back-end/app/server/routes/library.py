from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from server.models.song import SongSchema

from server.database.library import (
    retrieve_libraries,
    add_song_library,
    delete_song_library,
    retrieve_library,
)

from server.models.library import (
    ErrorResponseModel,
    ResponseModel,
)

LibraryRouter = APIRouter()


# Get a library with a matching ID
@LibraryRouter.get("/{id}", response_description="Library retrieved")
async def get_library_data(id):
    library = await retrieve_library(id)
    if library:
        return ResponseModel(library, "Library retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "Library doesn't exist.")


# Get all libraries
@LibraryRouter.get("/", response_description="All libraries retrieved")
async def get_libraries():
    libraries = await retrieve_libraries()
    if libraries:
        return ResponseModel(libraries, "All libraries retrieved successfully")
    return ResponseModel(libraries, "Empty list returned")


# Add song to a library with a matching ID
@LibraryRouter.put("/{id}/songs", response_description="Song added into the library")
async def add_song_library_data(id: str, song: SongSchema = Body(...)):
    updated_library = await add_song_library(id, song)
    if updated_library:
        return ResponseModel(
            "Library with ID: {0} song added successfuly".format(id),
            "Library updated successfully",
        )
    return ErrorResponseModel(
        "An error occurred",
        404,
        "There was an error while adding song to the library.",
    )


# Delete song from a library with a matching ID
@LibraryRouter.delete(
    "/{library_id}/songs/{song_id}",
    response_description="Song deleted from the library",
)
async def delete_song_library_data(library_id: str, song_id: str):
    deleted_song = await delete_song(id)
    if deleted_song:
        return ResponseModel(
            "Song with ID: {0} removed".format(id), "Song deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "Song with id {0} doesn't exist".format(id)
    )
