from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
ALGORITHM = "HS256"

JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)
    return encoded_jwt


def make_ngrams(word, min_size=2, prefix_only=False):
    length = len(word)
    size_range = range(min_size, max(length, min_size) + 1)
    if prefix_only:
        return [word[0:size] for size in size_range]
    return list(
        set(
            word[i : i + size]
            for size in size_range
            for i in range(0, max(0, length - size) + 1)
        )
    )
