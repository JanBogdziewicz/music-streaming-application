from datetime import datetime
from pydantic import BaseModel, Field


class ListeningSchema(BaseModel):
    song: str = Field(...)
    time: datetime = Field(datetime.now())
    user: str = Field(...)


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
