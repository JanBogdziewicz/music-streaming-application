from datetime import datetime

from pydantic import BaseModel, Field


class SearchSchema(BaseModel):
    content: str = Field(..., min_length=1, max_length=1024)
    time: datetime = Field(default_factory=datetime.now)
    user: str = Field(...)


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
