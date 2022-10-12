from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from server.database.search import (
    add_search,
    delete_search,
    retrieve_search,
    retrieve_searches,
)

from server.models.search import (
    ResponseModel,
    SearchSchema,
)

SearchRouter = APIRouter()

# Create a new search request
@SearchRouter.post("/", response_description="Search request created")
async def add_search_data(search: SearchSchema = Body(...)):
    search = jsonable_encoder(search)
    new_search = await add_search(search)
    return ResponseModel(new_search, "Search request created successfully.")


# Get all search requests
@SearchRouter.get("/", response_description="All search requests retrieved")
async def get_searches():
    searches = await retrieve_searches()
    if searches:
        return ResponseModel(searches, "All search requests retrieved successfully")
    return ResponseModel(searches, "Empty list returned")


# Get a search request with a matching ID
@SearchRouter.get("/{id}", response_description="Search request retrieved")
async def get_search_data(id: str):
    search = await retrieve_search(id)
    return ResponseModel(search, "Search request retrieved successfully")


# Delete a search request with a matching ID
@SearchRouter.delete(
    "/{id}", response_description="Search request deleted from the database"
)
async def delete_search_data(id: str):
    await delete_search(id)
    return ResponseModel(
        "Search request with ID: {0} removed".format(id),
        "Search request deleted successfully",
    )
