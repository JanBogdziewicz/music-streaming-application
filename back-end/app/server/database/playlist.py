from bson.objectid import ObjectId
from pymongo.collection import Collection
from server.config import database
from server.database.song import song_helper

playlists_collection: Collection = database.get_collection("playlists")
songs_collection: Collection = database.get_collection("songs")

# helper
def playlist_helper(playlist) -> dict:
    return {
        "id": str(playlist["_id"]),
        "name": playlist["name"],
        "creation_date": playlist["creation_date"],
        "songs": list(map(lambda x: str(x), playlist["songs"])),
        "length": playlist["length"],
        "user": playlist["user"]
    }


# Retrieve all playlists present in the database
async def retrieve_playlists():
    playlists = []
    async for playlist in playlists_collection.find():
        playlists.append(playlist_helper(playlist))
    return playlists


# Add a new playlist to the database
async def add_playlist(playlist_data: dict) -> dict:
    playlist = await playlists_collection.insert_one(playlist_data)
    new_playlist = await playlists_collection.find_one({"_id": playlist.inserted_id})
    return playlist_helper(new_playlist)


# Retrieve a playlist with a matching ID
async def retrieve_playlist(id: str):
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    return playlist_helper(playlist) if playlist else False


# Update a playlist with a matching ID
async def update_playlist(id: str, data: dict):
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    if playlist:
        updated_playlist = await playlists_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return updated_playlist if updated_playlist else False
    else:
        return False


# Delete a playlist from the database
async def delete_playlist(id: str):
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    if playlist:
        await playlists_collection.delete_one({"_id": ObjectId(id)})
        return True
    else:
        return False

# Retreive all songs of a playlist
async def retreive_playlist_songs(id: str):
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    if not playlist: return False
    songs = []
    async for song in songs_collection.find({
        "_id": {"$in": playlist["songs"]}
    }):
        songs.append(song_helper(song))
    return songs

# Append song to a playlist
async def append_song_to_playlist(playlist_id: str, song_id: str):
    try:
        song_length = (await songs_collection.find_one({"_id": ObjectId(song_id)}))["length"]
        await playlists_collection.update_one(
            {"_id": ObjectId(playlist_id)}, 
            {
                "$push": {"songs": ObjectId(song_id)}, 
                "$inc": {"length": song_length}
            }
        )
    except Exception as e:
        raise e

# Delete song from playlist
async def remove_song_from_playlist(playlist_id: str, song_index: int):
    try:
        playlist = await playlists_collection.find_one({"_id": ObjectId(playlist_id)})
        del playlist["songs"][song_index]
        await playlists_collection.replace_one(
            {"_id": ObjectId(playlist_id)}, 
            playlist
        )
    except Exception as e:
        raise e