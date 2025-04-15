from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import User, Todo, LoginRequest
from database import fetch_all_listings, startup, users_collection, listings_collection, database
from utils.security import hash_password 
from bson import ObjectId
from utils.security import verify_password
from fastapi.responses import JSONResponse


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


@app.get("/api/get-listings")
async def get_listings():
    currentListings = await fetch_all_listings()
    if not currentListings: raise HTTPException(404)
    return currentListings

@app.get("/api/InventoryOptions")
async def get_inventory_options(userId: str):
    try:
        user_object_id = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid userId format")

    group = database.groups.find_one({ "members": user_object_id })

    if not group:
        raise HTTPException(status_code=404, detail="No group found for this user")

    listings = list(database.listings.find({
        "ownerId": { "$in": group["members"] }
    }))

    for listing in listings:
        listing["_id"] = str(listing["_id"])
        listing["ownerId"] = str(listing["ownerId"])

    return JSONResponse(content=listings)

@app.post("/api/register")
async def register_user(user: User):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use.")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    result = await users_collection.insert_one(user_dict)
    
    return {"id": str(result.inserted_id), "email": user.email, "username": user.username}
    
@app.post("/api/login")
async def login_user(credentials: LoginRequest):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please sign up.")

    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password.")


    return {"message": "Login successful", "username": user["username"]}