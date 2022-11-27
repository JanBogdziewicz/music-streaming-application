from fastapi import APIRouter, Body, Depends, File, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response
from server.deps import get_current_user
from server.database.images import (
    download_playlist_cover,
    upload_playlist_cover,
    download_default_playlist_cover,
    retrieve_default_playlist_cover_id,
)
from server.database.playlist import *
from server.models.playlist import *
from server.models.user import UserSchema

PlaylistRouter = APIRouter()


# Get a default playlist cover
@PlaylistRouter.get("/cover", response_description="default playlist cover retrieved")
async def get_default_playlist_cover():
    default_cover = await download_default_playlist_cover()
    return Response(default_cover)


# Get a default playlist cover id
@PlaylistRouter.get(
    "/coverId", response_description="default playlist cover id retrieved"
)
async def get_default_playlist_cover():
    default_cover_id = await retrieve_default_playlist_cover_id()
    return ResponseModel(
        default_cover_id, "efault playlist cover id retrieved successfully"
    )


# Add a new playlist
@PlaylistRouter.post("/", response_description="playlist added into the database")
async def add_playlist_data(
    playlist: PlaylistSchema = Body(...), user: UserSchema = Depends(get_current_user)
):
    if not playlist.user == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    playlist = jsonable_encoder(playlist)
    new_playlist = await add_playlist(playlist)
    return ResponseModel(new_playlist, "playlist added successfully.")


# Get all playlists
@PlaylistRouter.get("/", response_description="All playlists retrieved")
async def get_playlists():
    playlists = await retrieve_playlists()
    if playlists:
        return ResponseModel(playlists, "All playlists retrieved successfully")
    return ResponseModel(playlists, "Empty list returned")


# Get a playlist with a matching ID
@PlaylistRouter.get("/{id}", response_description="playlist retrieved")
async def get_playlist_data(id):
    playlist = await retrieve_playlist(id)
    return ResponseModel(playlist, "playlist retrieved successfully")


# Update a playlist with a matching ID
@PlaylistRouter.put("/{id}")
async def update_playlist_data(
    id: str,
    req: UpdatePlaylistModel = Body(...),
    user: UserSchema = Depends(get_current_user),
):
    playlist = await retrieve_playlist(id)
    if not playlist["user"] == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    req = jsonable_encoder(req)
    updated_playlist = await update_playlist(id, req)
    return ResponseModel(
        updated_playlist, "playlist with ID: {0} update is successful".format(id)
    )


# Delete a playlist with a matching ID
@PlaylistRouter.delete(
    "/{id}", response_description="playlist deleted from the database"
)
async def delete_playlist_data(id: str, user: UserSchema = Depends(get_current_user)):
    playlist = await retrieve_playlist(id)
    if not playlist["user"] == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    await delete_playlist(id)
    return ResponseModel(
        "playlist with ID: {0} removed".format(id), "playlist deleted successfully"
    )


# Get all songs of an playlist
@PlaylistRouter.get(
    "/{id}/songs", response_description="playlist songs retrieved sucessfully"
)
async def get_playlist_songs(id: str):
    songs = await retrieve_playlist_songs(id)
    if songs:
        songs_with_index = []
        index = 0
        for song in songs:
            song = {"index": index, **song}
            index += 1
            songs_with_index.append(song)
        return ResponseModel(
            songs_with_index, "All playlist songs retrieved successfully"
        )
    return ResponseModel(songs, "Empty list returned")


# Add song to playlist
@PlaylistRouter.patch(
    "/{playlist_id}/songs/{song_id}", response_description="songs added sucessfully"
)
async def add_song_to_playlist(
    playlist_id: str, song_id: str, user: UserSchema = Depends(get_current_user)
):
    playlist = await retrieve_playlist(playlist_id)
    if not playlist["user"] == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    song = await append_song_to_playlist(playlist_id, song_id)
    return ResponseModel(song, "Song successfully added to the playlist")


# Remove song from playlist
@PlaylistRouter.delete("/{id}/songs/{song_index}")
async def delete_song_from_playlist(
    id: str, song_index: int, user: UserSchema = Depends(get_current_user)
):
    playlist = await retrieve_playlist(id)
    if not playlist["user"] == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    song = await remove_song_from_playlist(id, song_index)
    return ResponseModel(song, "Song successfully removed from the playlist")


# Get cover of a playlist
@PlaylistRouter.get(
    "/{id}/cover", response_description="playlist cover retrieved sucessfully"
)
async def get_playlist_cover(id: str):
    playlist = await retrieve_playlist(id)
    cover = await download_playlist_cover(playlist["cover"])
    return Response(cover)


# Update cover of a playlist
@PlaylistRouter.put(
    "/{id}/cover", response_description="playlist cover updated sucessfully"
)
async def update_playlist_cover(
    id: str, file: UploadFile = File(...), user: UserSchema = Depends(get_current_user)
):
    playlist = await retrieve_playlist(id)
    if not playlist["user"] == user.username:
        raise HTTPException(
            status_code=401, detail="user not authorized to perform operation"
        )
    updated_cover_id = await upload_playlist_cover(playlist["cover"], file.file)
    playlist["cover"] = updated_cover_id
    await update_playlist(id, playlist)
    return ResponseModel(
        updated_cover_id, "playlist with ID: {0} update is successful".format(id)
    )
