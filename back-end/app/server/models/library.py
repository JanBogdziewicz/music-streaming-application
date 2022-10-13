from pydantic import BaseModel, Field


class LibrarySchema(BaseModel):
    playlists: list[str] = Field([])
    artists: list[str] = Field([])
    albums: list[str] = Field([])
    songs: list[str] = Field([])


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
