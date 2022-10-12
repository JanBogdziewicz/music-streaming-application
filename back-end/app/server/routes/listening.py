from fastapi import APIRouter

from server.database.listening import (
    retrieve_listening,
    retrieve_listenings,
    delete_listening,
)

from server.models.listening import (
    ResponseModel,
)

ListeningRouter = APIRouter()

# Get all listenings
@ListeningRouter.get("/", response_description="All listenings retrieved")
async def get_listenings():
    listenings = await retrieve_listenings()
    if listenings:
        return ResponseModel(listenings, "All listenings retrieved successfully")
    return ResponseModel(listenings, "Empty list returned")


# Get a listening with a matching ID
@ListeningRouter.get("/{id}", response_description="Listening retrieved")
async def get_listening_data(id: str):
    listening = await retrieve_listening(id)
    return ResponseModel(listening, "Listening retrieved successfully")


# Delete a listening with a matching ID
@ListeningRouter.delete(
    "/{id}", response_description="Listening deleted from the database"
)
async def delete_listening_data(id: str):
    await delete_listening(id)
    return ResponseModel(
        "Listening with ID: {0} removed".format(id),
        "Listening deleted successfully",
    )
