from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from pydantic import BaseModel, Field, validator


class PlaylistSchema(BaseModel):
    name: str = Field(...)
    creation_date: date = Field(None)
    songs: list[str] = []
    length: int = 0
    user: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "name": "My Own Playlist",
                "user": "joe17"
            }
        }


class UpdatePlaylistModel(BaseModel):
    name: Optional[str]


class AddSongToPlaylistModel(BaseModel):
    song_id: str


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
