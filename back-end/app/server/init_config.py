USER_NR = 3
USER_AGE_MIN = 12
USER_AGE_MAX = 70
USER_PLAYLIST_NR_MIN = 2
USER_PLAYLIST_NR_MAX = 5
USER_PLAYLIST_LIBRARY_NR_MIN = 2
USER_PLAYLIST_LIBRARY_NR_MAX = 5
USER_ARTIST_LIBRARY_NR_MIN = 2
USER_ARTIST_LIBRARY_NR_MAX = 5
USER_ALBUM_LIBRARY_NR_MIN = 3
USER_ALBUM_LIBRARY_NR_MAX = 8
USER_SONG_LIBRARY_NR_MIN = 5
USER_SONG_LIBRARY_NR_MAX = 20
USER_SONG_LISTENING_NR_MIN = 0
USER_SONG_LISTENING_NR_MAX = 20
USER_LISTENING_WEIGHTS = (
    [0.6]
    + [0.04 for _ in range(5)]
    + [0.02 for _ in range(5)]
    + [
        (0.1) / (USER_SONG_LISTENING_NR_MAX - 10)
        for _ in range(USER_SONG_LISTENING_NR_MAX - 10)
    ]
)
USER_AVATARS_PATH = "./assets/user_images/non_default/"

ARTIST_NR = 8
ARTIST_ALBUMS_NR_MIN = 1
ARTIST_ALBUMS_NR_MAX = 3
ARTIST_LOGOS_PATH = "./assets/artist_images/"

ALBUM_LABELS = ["Universal Music Group", "Sony Music", "Warner Music Group"]
ALBUM_TYPES = ["SINGLE", "EXTENDED_PLAY", "LONGPLAY"]
ALBUM_GENRES = [
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
SINGLE_SONG_NR = 1
EP_SONG_NR_MIN = 2
EP_SONG_NR_MAX = 5
LP_SONG_NR_MIN = 6
LP_SONG_NR_MAX = 10
ALBUM_COVERS_PATH = "./assets/album_images/"

SONG_LENGTH_MIN = 120
SONG_LENGTH_MAX = 300

PLAYLIST_SONG_NR_MIN = 5
PLAYLIST_SONG_NR_MAX = 20
PLAYLIST_COVERS_PATH = "./assets/playlist_images/"

DEFAULT_AVATAR = "./assets/user_images/default/default.png"
