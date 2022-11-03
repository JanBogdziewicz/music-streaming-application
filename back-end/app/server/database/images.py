from server.config import (
    album_covers_fs,
    artist_logos_fs,
    playlist_covers_fs,
    user_avatars_fs,
)
from bson.objectid import ObjectId


async def download_album_cover(file_id: str):
    data = await album_covers_fs.open_download_stream(ObjectId(file_id))
    bytes = await data.read()
    return bytes


async def download_artist_logo(file_id: str):
    data = await artist_logos_fs.open_download_stream(ObjectId(file_id))
    bytes = await data.read()
    return bytes


async def download_playlist_cover(file_id: str):
    data = await playlist_covers_fs.open_download_stream(ObjectId(file_id))
    bytes = await data.read()
    return bytes


async def download_user_avatar(file_id: str):
    data = await user_avatars_fs.open_download_stream(ObjectId(file_id))
    bytes = await data.read()
    return bytes
