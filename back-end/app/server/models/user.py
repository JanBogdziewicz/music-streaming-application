from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from pydantic import BaseModel, Field, validator
from uuid import UUID


class UserSchemaNoPass(BaseModel):
    username: str = Field(..., min_length=1, max_length=32)
    birth_date: date = Field(...)
    join_date: datetime = Field(default_factory=datetime.now)
    country: str = Field(...)
    avatar: str = Field(None)
    queue: list[str] = Field([])
    library: str = Field("")

    @validator("birth_date")
    def ensure_birth_date(cls, v):
        if v > date.today() - relativedelta(years=12):
            raise ValueError("User must be 12 years old or older")
        return v


class UserSchema(UserSchemaNoPass):
    password: str = Field(..., min_length=6, max_length=32)

    class Config:
        arbitrary_types_allowed = True
        schema_extra = {
            "example": {
                "username": "joe17",
                "password": "12Pass34",
                "birth_date": date(1990, 12, 30),
                "country": "United States",
            }
        }


class UpdateUserModel(BaseModel):
    birth_date: date = Field(...)
    country: str = Field(...)
    avatar: str = Field(None)

    @validator("birth_date")
    def ensure_birth_date(cls, v):
        if v > date.today() - relativedelta(years=12):
            raise ValueError("User must be 12 years old or older")
        return v

    class Config:
        schema_extra = {
            "example": {
                "birth_date": date(1980, 12, 30),
                "country": "Canada",
            }
        }


class UpdateLibraryModel(BaseModel):
    collection_name: str = Field(...)
    item_ids: list[str] = Field(..., unique_items=True)

    @validator("collection_name")
    def ensure_collection_name(cls, v):
        if v not in ["playlists", "artists", "albums", "songs"]:
            raise ValueError(
                "Field 'collection_name' must be either 'playlists', 'artists', 'albums', 'songs'"
            )
        return v

    class Config:
        schema_extra = {
            "example": {
                "collection_name": "songs",
                "item_ids": [],
            }
        }


class TokenSchema(BaseModel):
    access_token: str


class TokenPayload(BaseModel):
    sub: str = None
    exp: int = None


class UserAuth(BaseModel):
    email: str = Field(..., description="user email")
    password: str = Field(..., min_length=5, max_length=24,
                          description="user password")


class UserOut(BaseModel):
    auth_id: UUID
    username: str


class SystemUser(UserSchema):
    password: str


def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }
