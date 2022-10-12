from bson.objectid import ObjectId
from pydantic.json import ENCODERS_BY_TYPE


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


if ObjectId not in ENCODERS_BY_TYPE:
    ENCODERS_BY_TYPE[ObjectId] = str
