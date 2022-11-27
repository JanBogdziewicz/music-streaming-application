from datetime import date

from pydantic import BaseModel, Field, validator


class SongSchema(BaseModel):
    name: str = Field(...)
    genres: list[str] = Field([])
    artist: str = Field(...)
    album: str = Field(...)
    length: int = Field(..., gt=0)
    release_date: date = Field(...)
    cover: str = Field(None)
    listenings: int = Field(0)
    song_path: str = Field(...)
    ngrams: list[str] = Field([])
    prefix_ngrams: list[str] = Field([])
    artist_ngrams: list[str] = Field([])
    album_ngrams: list[str] = Field([])

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
                "song_path": "assets/song_files/song_2.mp3",
            }
        }


class UpdateSongModel(BaseModel):
    name: str = Field(...)
    genres: list[str] = Field(...)
    artist: str = Field(...)
    album: str = Field(...)
    length: int = Field(..., gt=0)
    release_date: date = Field(...)
    cover: str = Field(None)

    @validator("release_date")
    def ensure_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Paint It, Pink",
                "genres": ["disco"],
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
