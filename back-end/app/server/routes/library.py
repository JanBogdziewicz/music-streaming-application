from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from server.database.library import (
    retrieve_library,
    retrieve_libraries,
)

from server.models.library import (
    ErrorResponseModel,
    ResponseModel,
)

LibraryRouter = APIRouter()

# Get all libraries
@LibraryRouter.get("/", response_description="All libraries retrieved")
async def get_libraries():
    libraries = await retrieve_libraries()
    if libraries:
        return ResponseModel(libraries, "All libraries retrieved successfully")
    return ResponseModel(libraries, "Empty list returned")


# Get a library with a matching ID
@LibraryRouter.get("/{id}", response_description="Library retrieved")
async def get_library_data(id):
    library = await retrieve_library(id)
    if library:
        return ResponseModel(library, "Library retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "Library doesn't exist.")