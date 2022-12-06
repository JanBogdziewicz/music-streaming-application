from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, validator


class AlbumSchema(BaseModel):
    name: str = Field(...)
    release_date: date = Field(...)
    label: str = Field(...)
    album_type: Literal["SINGLE", "EXTENDED_PLAY", "LONGPLAY"] = Field(...)
    genres: list[str] = Field([], unique_items=True)
    artist: str = Field(...)
    cover: str = Field(None)
    ngrams: list[str] = Field([])
    prefix_ngrams: list[str] = Field([])
    artist_ngrams: list[str] = Field([])

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Aftermath",
                "release_date": date(1966, 5, 6),
                "label": "Universal Music",
                "album_type": "LONGPLAY",
                "genres": ["rock"],
                "artist": "The Rolling Stones",
            }
        }


class UpdateAlbumModel(BaseModel):
    release_date: date = Field(...)
    label: str = Field(...)
    album_type: Literal["SINGLE", "EXTENDED_PLAY", "LONGPLAY"] = Field(...)
    genres: list[str] = Field([], unique_items=True)
    cover: str = Field(None)

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "release_date": date(1966, 5, 6),
                "label": "Not Universal Music",
                "album_type": "LONGPLAY",
                "genres": ["disco"],
            }
        }


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
