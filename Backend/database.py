from model import *
import motor.motor_asyncio
from dotenv import dotenv_values
import os
from pymongo import ASCENDING

# Load environment variables
config = dotenv_values(".env")
DATABASE_URI = config.get("DATABASE_URI")
if os.getenv("DATABASE_URI"): 
    DATABASE_URI = os.getenv("DATABASE_URI")

if not DATABASE_URI:
    print("Error: DATABASE_URI is not set in the environment or .env file")

# Initialize Motor client
client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URI)

# Select the database and collections
database = client.barterDB
listings_collection = database["currentListings"]
users_collection = database["users"]
haggles_collection = database["haggles"]
items_collection = database["items"]
item_belongs_collection = database["itemBelongs"]

# Check connection
async def check_mongo_connection():
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")


# On startup
async def startup():
    await check_mongo_connection()
