from fastapi import HTTPException
from server.config import artists_collection, albums_collection, songs_collection
from server.database.album import album_helper
from server.database.song import song_helper

# helper
def artist_helper(artist) -> dict:
    return {
        "id": str(artist["_id"]),
        "name": artist["name"],
        "join_date": artist["join_date"],
        "bio": artist["bio"],
        "logo": artist["logo"],
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


# Retrieve a artist with a matching name
async def retrieve_artist(name: str):
    artist = await artists_collection.find_one({"name": name})
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist_helper(artist)


# Update a artist with a matching name
async def update_artist(name: str, data: dict):
    update_status = await artists_collection.update_one({"name": name}, {"$set": data})
    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist_helper(await artists_collection.find_one({"name": name}))


# Delete a artist from the database
async def delete_artist(name: str):
    deleted = await artists_collection.delete_one({"name": name})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="artist not found")


# Retrieve all albums of an artist
async def retrieve_artist_albums(name: str):
    artist = await artists_collection.find_one({"name": name})
    if not artist:
        raise HTTPException(status_code=404, detail="artist not found")
    albums = []
    async for album in albums_collection.find({"artist": name}):
        albums.append(album_helper(album))
    return albums

async def retrieve_artist_songs(name: str):
    artist = await artists_collection.find_one({"name": name})
    if not artist:
        raise HTTPException(status_code=404, detail="artist not found")
    songs = []
    async for song in songs_collection.find({"artist": name}):
        songs.append(song_helper(song))
    return songs
