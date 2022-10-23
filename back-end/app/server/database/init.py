from datetime import datetime
from pymongo.collection import Collection
from server.config import (
    database,
    albums_collection,
    artists_collection,
    libraries_collection,
    listenings_collection,
    playlists_collection,
    searches_collection,
    songs_collection,
    users_collection,
)
from server.init_config import *
import pymongo
import logging
from fastapi.encoders import jsonable_encoder
from faker import Faker
from bson.objectid import ObjectId
import random
from dateutil.relativedelta import relativedelta
from server.database.album import album_helper
from server.database.user import user_helper
from server.database.song import song_helper
from server.database.artist import artist_helper
from server.models.library import LibrarySchema

logger = logging.getLogger(__name__)


def clear_database():
    database.drop_collection("artists")
    database.drop_collection("albums")
    database.drop_collection("libraries")
    database.drop_collection("listenings")
    database.drop_collection("playlists")
    database.drop_collection("searches")
    database.drop_collection("songs")
    database.drop_collection("users")


async def create_unique_constraint(collection: Collection, fields: list[str]):
    logger.info("creating index")
    fields_array = list(map(lambda x: (x, pymongo.ASCENDING), fields))
    collection.create_index(fields_array, unique=True)


async def initialize_db_schema():
    await create_unique_constraint(songs_collection, ["name", "artist"])
    await create_unique_constraint(artists_collection, ["name"])
    await create_unique_constraint(albums_collection, ["name", "artist"])
    await create_unique_constraint(playlists_collection, ["name", "user"])
    await create_unique_constraint(users_collection, ["username"])
    await create_unique_constraint(searches_collection, ["user", "timestamp"])
    # still have to figure out time
    # await create_unique_constraint("time", [])


async def init_artists(fake: Faker, artist_number: int):
    artist_ids = []
    for _ in range(artist_number):
        artist_data = {
            "name": fake.name(),
            "join_date": fake.date_time(),
            "bio": fake.sentence(nb_words=5),
            "logo_path": "temp",
        }
        artist = await artists_collection.insert_one(artist_data)
        artist_ids.append(str(artist.inserted_id))
    return artist_ids


async def init_albums(fake: Faker, artist_ids: list[str]):
    labels = ["Universal Music Group", "Sony Music", "Warner Music Group"]
    album_types = ["SINGLE", "EXTENDED_PLAY", "LONGPLAY"]
    genres = [
        "Blues",
        "Classical",
        "Country",
        "Disco",
        "Hiphop",
        "Jazz",
        "Metal",
        "Pop",
        "Reggae",
        "Rock",
    ]
    album_ids = []
    for artist_id in artist_ids:
        artist_albums_number = random.randint(
            ARTIST_ALBUMS_NR_MIN, ARTIST_ALBUMS_NR_MAX
        )
        for _ in range(artist_albums_number):
            album_data = {
                "name": fake.word(),
                "release_date": fake.date(),
                "label": fake.word(ext_word_list=labels),
                "album_type": fake.word(ext_word_list=album_types),
                "genres": [fake.word(ext_word_list=genres)],
                "artist": artist_id,
                "cover_path": "temp",
            }
            album = await albums_collection.insert_one(album_data)
            album_ids.append(str(album.inserted_id))
    return album_ids


async def init_songs(fake: Faker, album_ids: list[str]):
    song_ids = []
    for album_id in album_ids:
        album = album_helper(
            await albums_collection.find_one({"_id": ObjectId(album_id)})
        )
        match album["album_type"]:
            case "SINGLE":
                album_song_number = SINGLE_SONG_NR
            case "EXTENDED_PLAY":
                album_song_number = random.randint(EP_SONG_NR_MIN, EP_SONG_NR_MAX)
            case "LONGPLAY":
                album_song_number = random.randint(LP_SONG_NR_MIN, LP_SONG_NR_MAX)
        for _ in range(album_song_number):
            song_data = {
                "name": fake.word(),
                "genres": album["genres"],
                "artist": album["artist"],
                "album": album["id"],
                "length": random.randint(SONG_LENGTH_MIN, SONG_LENGTH_MAX),
                "release_date": album["release_date"],
                "listenings": 0,
            }
            song = await songs_collection.insert_one(song_data)
            song_ids.append(str(song.inserted_id))
    return song_ids


async def init_users(fake: Faker, user_number: int):
    user_ids = []
    for _ in range(user_number):
        new_library = jsonable_encoder(LibrarySchema())
        library = await libraries_collection.insert_one(new_library)
        birth_date = fake.date_of_birth(
            minimum_age=USER_AGE_MIN, maximum_age=USER_AGE_MAX
        )
        user_data = {
            "username": fake.user_name(),
            "birth_date": str(birth_date),
            "join_date": fake.date_time_between(
                start_date=(birth_date + relativedelta(years=USER_AGE_MIN))
            ),
            "country": fake.country(),
            "queue": [],
            "library": str(library.inserted_id),
        }
        user = await users_collection.insert_one(user_data)
        user_ids.append(user.inserted_id)
    return user_ids


async def init_playlists(fake: Faker, user_ids: list[str], song_ids: list[str]):
    playlist_ids = []
    for user_id in user_ids:
        user_playlist_ids = []
        user = user_helper(await users_collection.find_one({"_id": ObjectId(user_id)}))
        user_playlist_number = random.randint(
            USER_PLAYLIST_NR_MIN, USER_PLAYLIST_NR_MAX
        )
        for _ in range(user_playlist_number):
            playlist_song_number = random.randint(
                PLAYLIST_SONG_NR_MIN, PLAYLIST_SONG_NR_MAX
            )
            songs = random.sample(song_ids, playlist_song_number)
            length = 0
            for song_id in songs:
                song = song_helper(
                    await songs_collection.find_one({"_id": ObjectId(song_id)})
                )
                length += song["length"]
            playlist_data = {
                "name": fake.word(),
                "creation_date": str(fake.date_between(start_date=user["join_date"])),
                "songs": songs,
                "length": length,
                "user": user["username"],
            }
            playlist = await playlists_collection.insert_one(playlist_data)
            playlist_ids.append(str(playlist.inserted_id))
            user_playlist_ids.append(playlist.inserted_id)
        await libraries_collection.update_one(
            {"_id": ObjectId(user["library"])},
            {
                "$addToSet": {
                    "playlists": {
                        "$each": list(map(lambda x: ObjectId(x), user_playlist_ids))
                    }
                }
            },
        )
    return playlist_ids


async def init_libraries(
    user_ids: list[str],
    playlist_ids: list[str],
    artist_ids: list[str],
    album_ids: list[str],
    song_ids: list[str],
):
    for user_id in user_ids:
        user = user_helper(await users_collection.find_one({"_id": ObjectId(user_id)}))
        user_playlists_library_number = random.randint(
            USER_PLAYLIST_LIBRARY_NR_MIN, USER_PLAYLIST_LIBRARY_NR_MAX
        )
        await libraries_collection.update_one(
            {"_id": ObjectId(user["library"])},
            {
                "$addToSet": {
                    "playlists": {
                        "$each": list(
                            map(
                                lambda x: ObjectId(x),
                                random.sample(
                                    playlist_ids, user_playlists_library_number
                                ),
                            )
                        )
                    }
                }
            },
        )
        user_artists_library_number = random.randint(
            USER_ARTIST_LIBRARY_NR_MIN, USER_ARTIST_LIBRARY_NR_MAX
        )
        await libraries_collection.update_one(
            {"_id": ObjectId(user["library"])},
            {
                "$addToSet": {
                    "artists": {
                        "$each": list(
                            map(
                                lambda x: ObjectId(x),
                                random.sample(artist_ids, user_artists_library_number),
                            )
                        )
                    }
                }
            },
        )
        user_albums_library_number = random.randint(
            USER_ALBUM_LIBRARY_NR_MIN, USER_ALBUM_LIBRARY_NR_MAX
        )
        await libraries_collection.update_one(
            {"_id": ObjectId(user["library"])},
            {
                "$addToSet": {
                    "albums": {
                        "$each": list(
                            map(
                                lambda x: ObjectId(x),
                                random.sample(album_ids, user_albums_library_number),
                            )
                        )
                    }
                }
            },
        )
        user_songs_library_number = random.randint(
            USER_SONG_LIBRARY_NR_MIN, USER_SONG_LIBRARY_NR_MAX
        )
        await libraries_collection.update_one(
            {"_id": ObjectId(user["library"])},
            {
                "$addToSet": {
                    "songs": {
                        "$each": list(
                            map(
                                lambda x: ObjectId(x),
                                random.sample(song_ids, user_songs_library_number),
                            )
                        )
                    }
                }
            },
        )


async def init_listenings(fake: Faker, user_ids: list[str], song_ids: list[str]):
    for song_id in song_ids:
        song = await songs_collection.find_one({"_id": ObjectId(song_id)})
        artist = artist_helper(
            await artists_collection.find_one({"_id": ObjectId(song["artist"])})
        )
        listening_number = 0
        for user_id in user_ids:
            user = user_helper(
                await users_collection.find_one({"_id": ObjectId(user_id)})
            )
            user_song_listening_number = random.randint(
                USER_SONG_LISTENING_NR_MIN, USER_SONG_LISTENING_NR_MAX
            )
            for _ in range(user_song_listening_number):
                listening_data = {
                    "song": song,
                    "time": fake.date_time_between(
                        start_date=max(
                            user["join_date"],
                            datetime.strptime(song["release_date"], "%Y-%m-%d"),
                            artist["join_date"],
                        )
                    ),
                    "user": user["username"],
                }
                await listenings_collection.insert_one(listening_data)
            listening_number += user_song_listening_number
        await songs_collection.update_one(
            {"_id": ObjectId(song_id)}, {"$set": {"listenings": listening_number}}
        )


async def initialize_db_data():
    fake = Faker()
    Faker.seed(0)
    random.seed(0)
    artist_ids = await init_artists(fake, ARTIST_NR)
    album_ids = await init_albums(fake, artist_ids)
    song_ids = await init_songs(fake, album_ids)
    user_ids = await init_users(fake, USER_NR)
    playlist_ids = await init_playlists(fake, user_ids, song_ids)
    await init_libraries(user_ids, playlist_ids, artist_ids, album_ids, song_ids)
    await init_listenings(fake, user_ids, song_ids)
