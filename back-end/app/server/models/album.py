from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from pydantic import BaseModel, Field, validator
    

class AlbumSchema(BaseModel):
    name: str = Field(...)
    release_date: date = datetime.now()
    label: str = Field(...)
    album_type: str = Field(...)
    genres: list[str] = []
    artist: str = Field(...)
    cover_path: str = Field(None)

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v
    
    @validator("album_type")
    def ensure_album_type(cls, v):
        if v not in ["SINGLE", "EXTENDED_PLAY", "LONGPLAY"]:
            raise ValueError("Field 'album_type' must be either 'SINGLE', 'EXTENDED_PLAY', or 'LONGPLAY'")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Aftermath",
                "label": "Universal Music",
                "album_type": "LONGPLAY",
                "genres": ["rock"],
                "artist": "The Rolling Stones",
            }
        }


class UpdateAlbumModel(BaseModel):
    name: Optional[str]
    genres: Optional[list[str]]


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
