from server.config import album_covers_fs, artist_logos_fs
from bson.objectid import ObjectId


async def download_album_cover(file_id: str):
    data = await album_covers_fs.open_download_stream(ObjectId(file_id))
    bytes = await data.read()
    return bytes
