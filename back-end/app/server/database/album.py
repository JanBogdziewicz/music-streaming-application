def album_helper(artist) -> dict:
    return {
        "id": str(artist["_id"]),
        "name": artist["name"],
        "join_date": artist["join_date"],
        "bio": artist["bio"],
        "albums": artist["albums"],
        "logo_path": artist["logo_path"]
    }