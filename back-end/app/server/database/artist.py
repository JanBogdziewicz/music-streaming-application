from bson.objectid import ObjectId
from pymongo.collection import Collection
from server.config import database
from server.database.album import album_helper

artists_collection: Collection = database.get_collection("artists")
albums_collection: Collection = database.get_collection("albums")

# helper
def artist_helper(artist) -> dict:
    return {
        "id": str(artist["_id"]),
        "name": artist["name"],
        "join_date": artist["join_date"],
        "bio": artist["bio"],
        "logo_path": artist["logo_path"]
    }


# Retrieve all artists present in the database
async def retrieve_artists():
    artists = []
    async for artist in artists_collection.find():
        artists.append(artist_helper(artist))
    return artists


# Add a new artist to the database
async def add_artist(artist_data: dict) -> dict:
    artist = await artists_collection.insert_one(artist_data)
    new_artist = await artists_collection.find_one({"_id": artist.inserted_id})
    return artist_helper(new_artist)
    

# Retrieve a artist with a matching ID
async def retrieve_artist(id: str):
    artist = await artists_collection.find_one({"_id": ObjectId(id)})
    return artist_helper(artist) if artist else False


# Update a artist with a matching ID
async def update_artist(id: str, data: dict):
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False
    artist = await artists_collection.find_one({"_id": ObjectId(id)})
    if artist:
        updated_artist = await artists_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return updated_artist if updated_artist else False
    else:
        return False


# Delete a artist from the database
async def delete_artist(id: str):
    artist = await artists_collection.find_one({"_id": ObjectId(id)})
    if artist:
        await artists_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False

# Retreive all albums of an artist
async def retreive_artist_albums(id: str):
    artist = await artists_collection.find_one({"_id": ObjectId(id)})
    if not artist: return False
    albums = []
    async for album in albums_collection.find({"artist": artist["name"]}):
        albums.append(album_helper(album))
    return albums
