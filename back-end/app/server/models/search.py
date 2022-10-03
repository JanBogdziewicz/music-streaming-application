from datetime import datetime

from pydantic import BaseModel, Field


class SearchSchema(BaseModel):
    content: str = Field(...)
    time: datetime = datetime.now()


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
