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
database = client.barterDB  # Replace with your database name
collection = database.currentListings  # Replace with your collection name

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
    cursor = collection.find()
    async for doc in cursor:
        currentListings.append(Listing(**doc))
    print(f"Fetched {len(currentListings)} listings")
    return currentListings

# Fetch a single todo (if applicable, you can change this function to match your data structure)
async def fetch_one_todo(nanoid):
    doc = await collection.find_one({"nanoid": nanoid}, {"_id": 0})
    return doc

# Create a new todo (or a new listing in your case)
async def create_todo(todo):
    doc = todo.dict()
    await collection.insert_one(doc)
    result = await fetch_one_todo(todo.nanoid)
    return result

# Update an existing todo
async def change_todo(nanoid, title, desc, checked):
    await collection.update_one({"nanoid": nanoid}, {"$set": {"title": title, "desc": desc, "checked": checked}})
    result = await fetch_one_todo(nanoid)
    return result

# Remove a todo
async def remove_todo(nanoid):
    await collection.delete_one({"nanoid": nanoid})
    return True

# Call the MongoDB connection check here
async def startup():
    await check_mongo_connection()


   