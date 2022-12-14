from fastapi import HTTPException
from bson.objectid import ObjectId
from server.config import songs_collection
from server.utils import make_ngrams


# helper
def song_helper(song) -> dict:
    return {
        "id": str(song["_id"]),
        "name": song["name"],
        "genres": song["genres"],
        "artist": song["artist"],
        "album": song["album"],
        "length": song["length"],
        "release_date": song["release_date"],
        "cover": song["cover"],
        "listenings": song["listenings"],
    }


# Retrieve all songs present in the database
async def retrieve_songs():
    songs = []
    async for song in songs_collection.find():
        songs.append(song_helper(song))
    return songs


# Add a new song to the database
async def add_song(song_data: dict) -> dict:
    song_data["ngrams"] = make_ngrams(song_data["name"])
    song_data["prefix_ngrams"] = make_ngrams(song_data["name"], prefix_only=True)
    song_data["artist_ngrams"] = make_ngrams(song_data["artist"], prefix_only=True)
    song_data["album_ngrams"] = make_ngrams(song_data["album"], prefix_only=True)
    song = await songs_collection.insert_one(song_data)
    new_song = await songs_collection.find_one({"_id": song.inserted_id})
    return song_helper(new_song)


# Retrieve a song with a matching ID
async def retrieve_song(id: str):
    song = await songs_collection.find_one({"_id": ObjectId(id)})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song_helper(song)


# Retrieve a song path
async def retrieve_song_path(id: str):
    song = await songs_collection.find_one({"_id": ObjectId(id)})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song["song_path"]


# Update a song with a matching ID
async def update_song(id: str, data: dict):
    if data.get("name", None):
        data["ngrams"] = make_ngrams(data["name"])
        data["prefix_ngrams"] = make_ngrams(data["name"], prefix_only=True)
    if data.get("artist", None):
        data["artist_ngrams"] = make_ngrams(data["artist"], prefix_only=True)
    if data.get("album", None):
        data["album_ngrams"] = make_ngrams(data["album"], prefix_only=True)
    update_status = await songs_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": data}
    )
    if update_status.matched_count < 1:
        raise HTTPException(status_code=404, detail="Song not found")
    return song_helper(await songs_collection.find_one({"_id": ObjectId(id)}))


# Delete a song from the database
async def delete_song(id: str):
    deleted = await songs_collection.delete_one({"_id": ObjectId(id)})
    if deleted.deleted_count < 1:
        raise HTTPException(status_code=404, detail="song not found")


# Search songs
async def search_songs(query: str):
    songs = []
    async for song in songs_collection.find(
        {"$text": {"$search": query}},
        {
            "name": True,
            "artist": True,
            "album": True,
            "cover": True,
            "score": {"$meta": "textScore"},
        },
    ).sort([("score", {"$meta": "textScore"})]):
        song["id"] = str(song["_id"])
        del song["_id"]
        songs.append(song)
    return songs[:3]
