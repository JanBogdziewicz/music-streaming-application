from server.models.PydanticObjectId import PydanticObjectId
from pydantic import BaseModel, Field
from bson.objectid import ObjectId


class LibrarySchema(BaseModel):
    playlists: list[PydanticObjectId] = Field([])
    artists: list[PydanticObjectId] = Field([])
    albums: list[PydanticObjectId] = Field([])
    songs: list[PydanticObjectId] = Field([])


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
