from pydantic import BaseModel


class LibrarySchema(BaseModel):
    playlists: list[str] = []
    artists: list[str] = []
    albums: list[str] = []
    songs: list[str] = []


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
