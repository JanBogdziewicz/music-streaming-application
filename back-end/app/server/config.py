import motor.motor_asyncio
from pymongo.collection import Collection
from server.init_config import DEFAULT_AVATAR


MONGO_DETAILS = "mongodb://music:music@mongodb:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.music

album_covers_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "album")
artist_logos_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "artist")
playlist_covers_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "playlist")
user_avatars_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "user")

default_avatar_id = None


async def init_default_avatar():
    global default_avatar_id
    if not default_avatar_id:
        default_avatar_id = str(
            await user_avatars_fs.upload_from_stream(
                "default.png", open(DEFAULT_AVATAR, "rb")
            )
        )
    return default_avatar_id


artists_collection: Collection = database.get_collection("artists")
albums_collection: Collection = database.get_collection("albums")
songs_collection: Collection = database.get_collection("songs")
users_collection: Collection = database.get_collection("users")
libraries_collection: Collection = database.get_collection("libraries")
playlists_collection: Collection = database.get_collection("playlists")
listenings_collection: Collection = database.get_collection("listenings")
searches_collection: Collection = database.get_collection("searches")
