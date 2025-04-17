from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import User, Todo, LoginRequest, Item
from database import fetch_all_listings, startup, users_collection, listings_collection, database
from utils.security import hash_password 
from bson import ObjectId
from utils.security import verify_password
from fastapi.responses import JSONResponse
from fastapi import Query


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

    # Await this call!
    group = await database.groups.find_one({"members": user_object_id})
    if not group:
        raise HTTPException(status_code=404, detail="No group found for this user")

    # Await the cursor, turn to list
    item_belongs_cursor = database.itemBelongs.find({
        "userId": {"$in": group["members"]}
    })
    item_belongs = await item_belongs_cursor.to_list(length=None)

    results = []
    for item in item_belongs:
        item_id = item["itemId"]
        item_obj_id = ObjectId(item_id) if isinstance(item_id, str) else item_id

        # Await item lookup
        item_doc = await database.items.find_one({"_id": item_obj_id})
        item_name = item_doc["name"] if item_doc else "Unknown Item"

        results.append({
            "_id": str(item["_id"]),
            "userId": str(item["userId"]),
            "itemId": str(item["itemId"]),
            "quantity": item.get("quantity", 1),
            "name": item_name
        })

    return results

@app.get("/api/item-name")
async def get_item_name(id: str = Query(..., alias="id")):
    try:
        item_object_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID format")

    item = await database.items.find_one({ "_id": item_object_id })

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return item["name"] 

@app.get("/api/get-listing/{listing_id}")
async def get_listing(listing_id: str):
    try:
        listing_object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing_id format")

    listing = await listings_collection.find_one({"_id": listing_object_id})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Convert ObjectId to string for JSON serialization
    listing["_id"] = str(listing["_id"])
    return listing

@app.post("/api/register")
async def register_user(user: User):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use.")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    result = await users_collection.insert_one(user_dict)
    
    return {"id": str(result.inserted_id), "email": user.email, "username": user.username, "role": user.role }
    
@app.post("/api/login")
async def login_user(credentials: LoginRequest):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please sign up.")

    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password.")


    return {"message": "Login successful", "id": str(user["_id"]), "username": user["username"], "email": user["email"], "role": user.get("role","user")}

@app.post("/api/promote")
async def promote_to_admin(email: str):
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"role": "admin"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": f"{email} promoted to admin"}

@app.post("/api/items")
async def create_item(item: Item):
    item_dict = item.dict()
    result = await database["items"].insert_one(item_dict)
    return {"id": str(result.inserted_id)}

@app.get("/api/items")
async def get_items():
    items = await database["items"].find().to_list(1000)
    for item in items:
        item["_id"] = str(item["_id"])
    return items