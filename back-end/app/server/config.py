import motor.motor_asyncio
from pymongo.collection import Collection


MONGO_DETAILS = "mongodb://music:music@mongodb:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.music
album_covers_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "album")
artist_logos_fs = motor.motor_asyncio.AsyncIOMotorGridFSBucket(database, "artist")

artists_collection: Collection = database.get_collection("artists")
albums_collection: Collection = database.get_collection("albums")
songs_collection: Collection = database.get_collection("songs")
users_collection: Collection = database.get_collection("users")
libraries_collection: Collection = database.get_collection("libraries")
playlists_collection: Collection = database.get_collection("playlists")
listenings_collection: Collection = database.get_collection("listenings")
searches_collection: Collection = database.get_collection("searches")
