from fastapi import HTTPException
from bson.objectid import ObjectId
from server.config import playlists_collection, songs_collection
from server.database.song import song_helper
import server.database.library as libraryService
import server.database.user as userService


# helper
def playlist_helper(playlist) -> dict:
    return {
        "id": str(playlist["_id"]),
        "name": playlist["name"],
        "creation_date": playlist["creation_date"],
        "songs": list(map(lambda x: str(x), playlist["songs"])),
        "length": playlist["length"],
        "user": playlist["user"],
        "cover": playlist["cover"],
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
    playlist_user = await userService.retrieve_user(new_playlist["user"])
    await libraryService.append_items_library(
        playlist_user["library"], "playlists", [new_playlist["_id"]]
    )
    return playlist_helper(new_playlist)


# Retrieve a playlist with a matching ID
async def retrieve_playlist(id: str):
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    if playlist:
        return playlist_helper(playlist)
    else:
        raise HTTPException(status_code=404, detail="Playlist not found")


# Update a playlist with a matching ID
async def update_playlist(id: str, data: dict):
    update_status = await playlists_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": data}
    )
    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="playlist not found")
    return playlist_helper(await playlists_collection.find_one({"_id": ObjectId(id)}))


# Delete a playlist from the database
async def delete_playlist(id: str):
    playlist = await retrieve_playlist(id)
    playlist_user = await userService.retrieve_user(playlist["user"])
    await libraryService.pull_items_library(
        playlist_user["library"], "playlists", [playlist["id"]]
    )
    deleted = await playlists_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="playlist not found")


# Retrieve all songs of a playlist
async def retrieve_playlist_songs(id: str):
    playlist = await playlists_collection.find_one({"_id": ObjectId(id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="playlist not found")
    songs = []
    for song_id in playlist["songs"]:
        song = await songs_collection.find_one({"_id": ObjectId(song_id)})
        if song:
            songs.append(song_helper(song))
    return songs


# Append song to a playlist
async def append_song_to_playlist(playlist_id: str, song_id: str):
    song = await songs_collection.find_one({"_id": ObjectId(song_id)})

    if not song:
        raise HTTPException(status_code=404, detail="song not found")

    update_status = await playlists_collection.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$push": {"songs": ObjectId(song_id)}, "$inc": {"length": song["length"]}},
    )

    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="playlist not found")

    return song_helper(song)


# Delete song from playlist
async def remove_song_from_playlist(playlist_id: str, song_index: int):
    playlist = await playlists_collection.find_one({"_id": ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="playlist not found")
    song = await songs_collection.find_one({"_id": playlist["songs"][song_index]})

    playlist["length"] -= song["length"]
    del playlist["songs"][song_index]

    await playlists_collection.replace_one({"_id": ObjectId(playlist_id)}, playlist)

    return song_helper(song)


# Get all user's playlists
async def retrieve_users_playlists(username: str):
    playlists = []
    async for playlist in playlists_collection.find({"user": username}):
        playlists.append(playlist_helper(playlist))

    return playlists


# Update username of all user's playlists
async def update_users_playlists(username: str, new_username: str):
    await playlists_collection.update_many(
        {"user": username}, {"$set": {"user": new_username}}
    )
