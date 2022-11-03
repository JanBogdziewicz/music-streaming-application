from datetime import date
from pydantic import BaseModel, Field, validator


class PlaylistSchema(BaseModel):
    name: str = Field(...)
    creation_date: date = Field(default_factory=date.today)
    songs: list[str] = Field([])
    length: int = Field(0)
    user: str = Field(...)
    cover: str = Field(None)

    @validator("creation_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "My Own Playlist",
                "user": "joe17",
            }
        }


class UpdatePlaylistModel(BaseModel):
    name: str = Field(...)
    cover: str = Field(None)

    class Config:
        schema_extra = {
            "example": {
                "name": "Not my Own Playlist",
            }
        }


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
