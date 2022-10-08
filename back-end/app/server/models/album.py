from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from pydantic import BaseModel, Field, validator
from enum import Enum


class AlbumType(Enum):
    SINGLE = 1
    EXTENDED_PLAY = 2
    LONGPLAY = 3
    

class AlbumSchema(BaseModel):
    name: str = Field(...)
    release_date: date = Field(...)
    songs: list[str] = []
    publisher: str = Field(...)
    album_type: AlbumType = Field(...)
    genres: list[str] = []
    artist: str = Field(...)

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v


class UpdateAlbumModel(BaseModel):
    bio: Optional[str]


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
