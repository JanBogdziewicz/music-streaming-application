from fastapi import HTTPException
from bson.objectid import ObjectId
from server.config import artists_collection, albums_collection
from server.database.album import album_helper


# helper
def artist_helper(artist) -> dict:
    return {
        "id": str(artist["_id"]),
        "name": artist["name"],
        "join_date": artist["join_date"],
        "bio": artist["bio"],
        "logo_path": artist["logo_path"],
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
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist_helper(artist)


# Update a artist with a matching ID
async def update_artist(id: str, data: dict):
    update_status = await artists_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": data}
    )
    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist_helper(await artists_collection.find_one({"_id": ObjectId(id)}))


# Delete a artist from the database
async def delete_artist(id: str):
    deleted = await artists_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="artist not found")


# Retrieve all albums of an artist
async def retrieve_artist_albums(id: str):
    artist = await artists_collection.find_one({"_id": ObjectId(id)})
    if not artist:
        raise HTTPException(status_code=404, detail="artist not found")
    albums = []
    async for album in albums_collection.find({"artist": artist["name"]}):
        albums.append(album_helper(album))
    return albums
