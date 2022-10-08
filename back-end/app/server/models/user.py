from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from pydantic import BaseModel, Field, validator


class UserSchema(BaseModel):
    username: str = Field(...)
    birth_date: date = Field(...)
    join_date: datetime = datetime.now()
    country: str = Field(...)
    queue: list[str] = []
    library: str = ""
    settings: str = ""

    @validator("birth_date")
    def ensure_birth_date(cls, v):
        if v > date.today() - relativedelta(years=12):
            raise ValueError("User must be 12 years old or older")
        return v

    @validator("join_date")
    def ensure_join_date(cls, v):
        if v > date.today():
            raise ValueError("Must be past or current date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "username": "joe17",
                "birth_date": date(1990, 12, 30),
                "country": "United States",
            }
        }


class UpdateUserModel(BaseModel):
    username: Optional[str]
    birth_date: Optional[date]
    country: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "username": "joe18",
                "birth_date": date(1980, 12, 30),
                "country": "Canada",
            }
        }


class UpdateLibraryModel(BaseModel):
    collection_name: str
    item_ids: Optional[list[str]]

    class Config:
        schema_extra = {
            "example": {
                "collection_name": "songs",
                "item_ids": [],
            }
        }


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
