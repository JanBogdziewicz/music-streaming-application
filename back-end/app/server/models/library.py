from pydantic import BaseModel, Field


class LibrarySchema(BaseModel):
    playlists: list[str] = Field([], unique_items=True)
    artists: list[str] = Field([], unique_items=True)
    albums: list[str] = Field([], unique_items=True)
    songs: list[str] = Field([], unique_items=True)


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
