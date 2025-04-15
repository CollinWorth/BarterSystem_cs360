from model import *
import motor.motor_asyncio
from dotenv import dotenv_values
import os

# Load environment variables
config = dotenv_values(".env")
DATABASE_URI = config.get("DATABASE_URI")
if os.getenv("DATABASE_URI"): 
    DATABASE_URI = os.getenv("DATABASE_URI")  # If we have a system environment variable, use it

# Check if DATABASE_URI is set
if not DATABASE_URI:
    print("Error: DATABASE_URI is not set in the environment or .env file")

# Initialize Motor client
client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URI)

# Select the database and collection
database = client.barterDB 
listings_collection = database.currentListings 
users_collection = database["users"]

# Function to check the connection to MongoDB
async def check_mongo_connection():
    try:
        # Perform a simple command to check the connection
        await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

# Fetch all listings
async def fetch_all_listings():
    currentListings = []
    cursor = listings_collection.find()
    async for doc in cursor:
        currentListings.append(Listing(**doc))
    print(f"Fetched {len(currentListings)} listings")
    return currentListings

# Call the MongoDB connection check here
async def startup():
    await check_mongo_connection()


   