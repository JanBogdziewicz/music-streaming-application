from server.models.object_id import PyObjectId
from pydantic import BaseModel, Field


class LibrarySchema(BaseModel):
    playlists: list[PyObjectId] = Field([])
    artists: list[PyObjectId] = Field([])
    albums: list[PyObjectId] = Field([])
    songs: list[PyObjectId] = Field([])

    class Config:
        arbitrary_types_allowed = True


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
