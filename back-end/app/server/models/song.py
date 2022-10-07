from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, validator


class SongSchema(BaseModel):
    name: str = Field(...)
    genres: list[str] = Field(...)
    artist: str = Field(...)
    album: str = Field(...)
    length: int = Field(..., gt=0)
    release_date: date = Field(...)
    listenings: int = 0

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Paint It, Black",
                "genres": ["rock"],
                "artist": "The Rolling Stones",
                "album": "Aftermath",
                "length": 225,
                "release_date": date(1966, 5, 6),
                "listenings": 23
            }
        }


class UpdateSongModel(BaseModel):
    name: Optional[str]
    genre: Optional[str]
    artist: Optional[str]
    album: Optional[str]
    length: Optional[int]
    release_date: Optional[date]

    class Config:
        schema_extra = {
            "example": {
                "name": "Paint It, Pink",
                "genre": "disco",
                "artist": "The Rolling Stones",
                "album": "Aftermath",
                "length": 225,
                "release_date": date(1966, 5, 6),
            }
        }


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {
        "error": error, 
        "code": code, 
        "message": message
    }
