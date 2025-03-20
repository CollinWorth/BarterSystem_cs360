from model import *
import motor.motor_asyncio
from dotenv import dotenv_values
import os

config = dotenv_values(".env")
DATABSE_URI = config.get("DATAASE_URI")
if os.getenv("DATABASE_URI"): DATABASE_URI = os.getenv("DATABSE_URI") # if we have a system environment variable it uses that instead

client = motor.motor_asyncio.AsyncIOMotorClient(DATABSE_URI)
##################################################
database = client.TodoDatabase
collection = database.todos

async def fetch_all_todos():
    todos = []
    cursor = collection.find()
    async for doc in cursor:
        todos.append(Todo(**doc))
    return todos

async def fetch_one_todo(nanoid):
    doc = await collection.find_one({"nanoid": nanoid}, {"_id": 0})
    return doc

async def create_todo(todo):
    doc = todo.dict()
    await collection.insert_one(doc)
    result = await fetch_one_todo(todo.nanoid)
    return result

async def change_todo(nanoid, title, desc, checked):
    await collection.update_one({"nanoid": nanoid}, {"$set": {"title": title, "desc": desc, "checked": checked}})
    result = await fetch_one_todo(nanoid)
    return result

async def remove_todo(nanoid):
    await collection.delete_one({"nanoid": nanoid})
    return True
