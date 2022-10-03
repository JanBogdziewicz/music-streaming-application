from typing import List
from server.models.song import SongSchema

from pydantic import BaseModel, Field


class LibrarySchema(BaseModel):
    songs: List[SongSchema] = Field(...)


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
