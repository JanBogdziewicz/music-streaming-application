from datetime import date, datetime
from pydantic import BaseModel, Field, validator


class ArtistSchema(BaseModel):
    name: str = Field(...)
    join_date: datetime = Field(default_factory=datetime.now)
    bio: str = Field(...)
    logo: str = Field(None)
    ngrams: list[str] = Field([])
    prefix_ngrams: list[str] = Field([])

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
    bio: str = Field(...)
    logo: str = Field(None)

    class Config:
        schema_extra = {
            "example": {
                "bio": "Cool band. Really really cool.",
            }
        }


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
