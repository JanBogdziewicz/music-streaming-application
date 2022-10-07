from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from pydantic import BaseModel, Field, validator


class ArtistSchema(BaseModel):
    name: str = Field(...)
    join_date: datetime = datetime.now()
    bio: str = Field(...)
    logo_path: str = Field(None)

    @validator("join_date")
    def ensure_join_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "The Rolling Stones",
                "bio": "Cool band. Really cool.",
            }
        }

class UpdateArtistModel(BaseModel):
    bio: Optional[str]


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
