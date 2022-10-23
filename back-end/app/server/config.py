import motor.motor_asyncio

MONGO_DETAILS = "mongodb://music:music@mongodb:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.music
