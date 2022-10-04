from server.config import database
from pymongo.collection import Collection
import pymongo
import logging

logger = logging.getLogger(__name__)

async def create_unique_constraint(collection_name: str, fields: list[str]):
    if collection_name in await database.list_collection_names():
        logger.info("collection already exists")
        return
    
    logger.info("creating index")
    collection: Collection = database.get_collection(collection_name)
    fields_array = list(map(lambda x: (x, pymongo.ASCENDING), fields))
    collection.create_index(fields_array, unique=True)

async def initialize_db_schema():
    await create_unique_constraint("songs", ["name", "artist"])
    await create_unique_constraint("artists", ["name"])
    await create_unique_constraint("albums", ["name", "artist"])
    await create_unique_constraint("playlists", ["name", "user"])
    await create_unique_constraint("users", ["username"])
    await create_unique_constraint("search", ["user", "timestamp"])
    # still have to figure out time
    # await create_unique_constraint("time", [])

    
