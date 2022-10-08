from fastapi import APIRouter, HTTPException

from server.database.listening import (
    retrieve_listening,
    retrieve_listenings,
    delete_listening,
)

from server.models.listening import (
    ErrorResponseModel,
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
async def get_listening_data(id):
    listening = await retrieve_listening(id)
    if listening:
        return ResponseModel(listening, "Listening retrieved successfully")
    raise HTTPException(
        status_code=404, detail="Listening with id {0} doesn't exist".format(id)
    )


# Delete a listening with a matching ID
@ListeningRouter.delete(
    "/{id}", response_description="Listening deleted from the database"
)
async def delete_listening_data(id: str):
    deleted_listening = await delete_listening(id)
    if deleted_listening:
        return ResponseModel(
            "Listening with ID: {0} removed".format(id),
            "Listening deleted successfully",
        )
    raise HTTPException(
        status_code=404, detail="Listening with id {0} doesn't exist".format(id)
    )
