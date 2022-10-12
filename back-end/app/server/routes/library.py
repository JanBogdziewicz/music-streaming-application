from fastapi import APIRouter

from server.database.library import (
    retrieve_library,
    retrieve_libraries,
)

from server.models.library import (
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
async def get_library_data(id: str):
    library = await retrieve_library(id)
    return ResponseModel(library, "Library retrieved successfully")
