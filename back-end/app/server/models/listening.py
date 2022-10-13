from datetime import datetime
from pydantic import BaseModel, Field
from server.models.song import SongSchema


class ListeningSchema(BaseModel):
    song: SongSchema = Field(...)
    time: datetime = Field(default_factory=datetime.now)
    user: str = Field(...)


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
