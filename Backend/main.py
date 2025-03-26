from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import Todo
from database import fetch_all_listings, startup

origins = [
    "http://localhost:3000",  # Allow React app on localhost:3000
    "http://127.0.0.1:3000",  # Allow React app on 127.0.0.1:3000
]

app = FastAPI()

# Add the CORS middleware to allow the React app to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
async def on_startup():
    await startup()  # This will check the MongoDB connection at startup

@app.get('/')
def get_root():
    return {"Ping": "Pong"}

@app.get("/api/get-todo/{nanoid}", response_model=Todo)
async def get_one_todo(nanoid):
    todo = await fetch_one_todo(nanoid)
    if not todo: raise HTTPException(404)
    return todo

@app.get("/api/get-listings")
async def get_listings():
    currentListings = await fetch_all_listings()
    if not currentListings: raise HTTPException(404)
    return currentListings

@app.post("/api/add-todo", response_model=Todo)
async def add_todo(todo: Todo):
    result = await create_todo(todo)
    if not result: raise HTTPException(400)
    return result

@app.put("/api/update-todo/{nanoid}", response_model=Todo)
async def update_todo(todo: Todo):
    result = await change_todo(nanoid, title, desc, checked)
    if not result: raise HTTPException(400)
    return result

@app.delete("/api/delete-todo/{nanoid}")
async def delete_todo(nanoid):
    result = await remove_todo(nanoid)
    if not result: raise HTTPException(400)
    return result