from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from model import User, Haggle, LoginRequest, Item, AddBelongRequest, TradeListing, UpdateUserRoleRequest
from database import startup, users_collection, listings_collection, database, haggles_collection, item_belongs_collection, items_collection
from utils.security import hash_password, verify_password
from bson import ObjectId, errors
from fastapi.responses import JSONResponse
from fastapi import Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

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

###################################### User Routes ######################################

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

@app.put("/api/users/{user_id}/role")
async def update_user_role(user_id: str, request: UpdateUserRoleRequest):
    try:
        user_object_id = ObjectId(user_id)  # Validate ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Extract role from the request model
    role = request.role.lower()

    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    result = await users_collection.update_one(
        {"_id": user_object_id}, {"$set": {"role": role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User role updated successfully"}

@app.get("/api/users")
async def get_all_users():
    try:
        users = await users_collection.find().to_list(1000)
        for user in users:
            user["_id"] = str(user["_id"])  # Convert ObjectId to string
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    try:
        user_object_id = ObjectId(user_id)  # Validate ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    result = await users_collection.delete_one({"_id": user_object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}

################### Items Routes ###################

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

@app.delete("/api/delete-item/{itemBelongsId}")
async def delete_item(itemBelongsId: str):
    try:
        # Validate the itemBelongsId
        item_belongs_object_id = ObjectId(itemBelongsId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid itemBelongsId format")

    # Attempt to delete the item from the user's inventory
    result = await database["itemBelongs"].delete_one({"_id": item_belongs_object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in user's inventory")

    return {"message": "Item deleted successfully"}

##################### Inventory Routes #####################

@app.post("/api/add-belong")
async def add_belong(data: AddBelongRequest):
    user_id = ObjectId(data.userId)
    item_id = ObjectId(data.itemId)
    result = await database["itemBelongs"].insert_one({
        "userId": user_id,
        "itemId": item_id,
        "quantity": data.quantity
    })
    return{ "message": "Item added to user inventory", "id": str(result.inserted_id)}

@app.get("/api/user-inventory")
async def get_user_inventory(userId: str):
    try:
        user_object_id = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid userId format")

    # Get all itemBelongs entries for this user
    belongs_cursor = database.itemBelongs.find({"userId": user_object_id})
    belongs_list = await belongs_cursor.to_list(length=None)

    results = []

    for entry in belongs_list:
        item_id = entry["itemId"]
        item_obj_id = ObjectId(item_id) if isinstance(item_id, str) else item_id

        # Look up the actual item
        item_doc = await database.items.find_one({"_id": item_obj_id})
        item_name = item_doc["name"] if item_doc else "Unknown Item"

        results.append({
            "_id": str(entry["_id"]),
            "userId": str(entry["userId"]),
            "itemId": str(entry["itemId"]),
            "quantity": entry.get("quantity", 1),
            "name": item_name,
            "image": item_doc.get("image", "") if item_doc else "",
            "relative_value": item_doc.get("relative_value", "") if item_doc else "",
        })

    return results

@app.get("/api/InventoryOptions")
async def get_inventory_options(userId: str):
    try:
        user_object_id = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid userId format")

    # Step 1: Fetch all items directly associated with the user
    user_items_cursor = database.itemBelongs.find({"userId": user_object_id})
    user_items = await user_items_cursor.to_list(length=None)

    # Step 2: Find the group(s) the user belongs to
    group_memberships = await database.groupMembers.find({"userId": user_object_id}).to_list(length=None)
    group_ids = [membership["groupId"] for membership in group_memberships]

    # Step 3: Find all users in the same groups
    group_members = await database.groupMembers.find({"groupId": {"$in": group_ids}}).to_list(length=None)
    user_ids_in_groups = [member["userId"] for member in group_members]

    # Step 4: Fetch all items associated with users in the same groups
    group_items_cursor = database.itemBelongs.find({"userId": {"$in": user_ids_in_groups}})
    group_items = await group_items_cursor.to_list(length=None)

    # Combine user items and group items
    all_items = user_items + group_items

    # Step 5: Enrich the items with details from the `items` collection
    results = []
    for item in all_items:
        item_id = item["itemId"]
        item_obj_id = ObjectId(item_id) if isinstance(item_id, str) else item_id

        # Lookup item details
        item_doc = await database.items.find_one({"_id": item_obj_id})
        item_name = item_doc["name"] if item_doc else "Unknown Item"
        item_description = item_doc["description"] if item_doc else "N/A"

        results.append({
            "_id": str(item["_id"]),
            "userId": str(item["userId"]),
            "itemId": str(item["itemId"]),
            "quantity": item.get("quantity", 1),
            "name": item_name,
            "description": item_description
        })

    return results

############################ Listings Routes ############################

@app.post("/api/trade-listing")
async def create_trade_listing(listing: TradeListing):
    try:
        # Validate & convert IDs
        listing_dict = {
            "userId": ObjectId(listing.userId),
            "offered_item_id": ObjectId(listing.offered_item_id),
            "offered_quantity": listing.offered_quantity,
            "requested_item_id": ObjectId(listing.requested_item_id),
            "requested_quantity": listing.requested_quantity,
            "post_status": listing.post_status
        }

        result = await database["currentListings"].insert_one(listing_dict)
        return {"message": "Listing created", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/api/user-listings")
async def get_user_listings(userId: str):
    try:
        user_object_id = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid userId format")

    listings = await database["currentListings"].find({
        "userId": user_object_id
    }).to_list(length=100)

    results = []

    for listing in listings:
        offered_item_id = listing.get("offered_item_id")
        requested_item_id = listing.get("requested_item_id")

        # Lookup item names from items collection
        offered_item = await database["items"].find_one({"_id": ObjectId(offered_item_id)})
        requested_item = await database["items"].find_one({"_id": ObjectId(requested_item_id)})

        offered_name = offered_item.get("name", "Unknown") if offered_item else "Unknown"
        requested_name = requested_item.get("name", "Unknown") if requested_item else "Unknown"

        results.append({
            "_id": str(listing["_id"]),
            "userId": str(listing["userId"]),
            "offered_item_id": str(offered_item_id),
            "offered_item_name": str(offered_name),  # ✅ include readable name
            "offered_quantity": listing["offered_quantity"],
            "requested_item_id": str(requested_item_id),
            "requested_item_name": str(requested_name),  # ✅ include readable name
            "requested_quantity": listing["requested_quantity"],
            "post_status": listing.get("post_status", "unknown")
        })

    return results


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


@app.get("/api/get-listings")
async def get_listings():
    currentListings = []
    cursor = listings_collection.find()

    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["userId"] = str(doc["userId"])
        doc["offered_item_id"] = str(doc["offered_item_id"])
        doc["requested_item_id"] = str(doc["requested_item_id"])

        # Fetch item details
        offered_item = await database.items.find_one({"_id": ObjectId(doc["offered_item_id"])})
        requested_item = await database.items.find_one({"_id": ObjectId(doc["requested_item_id"])})

        # Add readable fields for frontend
        doc["offered_item_details"] = {
            "name": offered_item.get("name", "Unknown Item"),
            "description": offered_item.get("description", "N/A"),
            "photo": offered_item.get("image", "")  
        } if offered_item else {}

        doc["requested_item_details"] = {
            "name": requested_item.get("name", "Unknown Item"),
            "description": requested_item.get("description", "N/A"),
            "photo": requested_item.get("image", "")  
        } if requested_item else {}

        currentListings.append(doc)

    if not currentListings:
        raise HTTPException(status_code=404, detail="No listings found")

    print(f"Fetched {len(currentListings)} listings")
    return currentListings

################## Haggle Routes ##################

def validate_object_id(id: str, field_name: str):
    try:
        return ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format")

def is_valid_objectid(oid: str) -> bool:
    try:
        ObjectId(oid)
        return True
    except (errors.InvalidId, TypeError):
        return False

@app.post("/api/submit-haggle")
async def create_haggle(haggle: Haggle):
    haggle_dict = haggle.dict()
    try:
        result = await database["haggles"].insert_one(haggle_dict)
        return {"message": "Haggle request submitted", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Haggle creation failed: {str(e)}")

@app.post("/api/finalize-trade")
async def finalize_trade(
    haggleId: str = Body(...),
):
    try:
        print(f"Starting trade finalization for haggleId: {haggleId}")

        haggle = await database["haggles"].find_one({"_id": ObjectId(haggleId)})
        if not haggle:
            print(f"Haggle not found for haggleId: {haggleId}")
            raise HTTPException(status_code=404, detail="Haggle not found")

        print(f"Haggle details: {haggle}")

        if haggle["status"] != "pending":
            print(f"Haggle already processed. Status: {haggle['status']}")
            raise HTTPException(status_code=400, detail="Haggle has already been processed")

        sender_obj = ObjectId(haggle["senderId"])
        recipient_obj = ObjectId(haggle["recipientId"])

        print(f"Sender ID: {sender_obj}, Recipient ID: {recipient_obj}")

        # Validate sender and recipient have enough quantity
        sender_item = await database["itemBelongs"].find_one({
            "userId": sender_obj,
            "itemId": ObjectId(haggle["senderItemId"])
        })
        recipient_item = await database["itemBelongs"].find_one({
            "userId": recipient_obj,
            "itemId": ObjectId(haggle["recipientItemId"])
        })

        print(f"Sender item details: {sender_item}")
        print(f"Recipient item details: {recipient_item}")

        if not sender_item or sender_item["quantity"] < haggle["senderItemQuantity"]:
            print(f"Sender has insufficient quantity. Required: {haggle['senderItemQuantity']}, Available: {sender_item['quantity'] if sender_item else 'None'}")
            raise HTTPException(status_code=400, detail="Sender has insufficient quantity")

        if not recipient_item or recipient_item["quantity"] < haggle["recipientItemQuantity"]:
            print(f"Recipient has insufficient quantity. Required: {haggle['recipientItemQuantity']}, Available: {recipient_item['quantity'] if recipient_item else 'None'}")
            raise HTTPException(status_code=400, detail="Recipient has insufficient quantity")

        # Execute trade
        print("Executing trade...")
        await database.itemBelongs.update_one(
            {"userId": sender_obj, "itemId": ObjectId(haggle["senderItemId"])},
            {"$inc": {"quantity": -haggle["senderItemQuantity"]}}
        )
        await database.itemBelongs.update_one(
            {"userId": recipient_obj, "itemId": ObjectId(haggle["senderItemId"])},
            {"$inc": {"quantity": haggle["senderItemQuantity"]}},
            upsert=True
        )

        await database.itemBelongs.update_one(
            {"userId": recipient_obj, "itemId": ObjectId(haggle["recipientItemId"])},
            {"$inc": {"quantity": -haggle["recipientItemQuantity"]}}
        )
        await database.itemBelongs.update_one(
            {"userId": sender_obj, "itemId": ObjectId(haggle["recipientItemId"])},
            {"$inc": {"quantity": haggle["recipientItemQuantity"]}},
            upsert=True
        )

        # Update haggle status to "approved"
        await database["haggles"].update_one(
            {"_id": ObjectId(haggleId)},
            {"$set": {"status": "approved"}}
        )

        print(f"Trade finalized successfully for haggleId: {haggleId}")
        return {"message": "Trade finalized and approved successfully"}

    except Exception as e:
        print(f"Trade finalization failed for haggleId: {haggleId}. Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trade failed: {str(e)}")

@app.get("/api/current-haggles")
async def get_current_haggles(userId: str):
    try:
        ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid userId format")

    # Fetch haggles where the user is either the sender OR the recipient
    cursor = database["haggles"].find({
        "$or": [
            {"senderId": userId},
            {"recipientId": userId}
        ]
    })

    haggles = await cursor.to_list(length=None)

    enriched = []
    for haggle in haggles:
        sender_item_name = "Unknown"
        recipient_item_name = "Unknown"
        sender_relative_value = None
        recipient_relative_value = None

        if is_valid_objectid(haggle["senderItemId"]):
            sender_item = await database["items"].find_one({"_id": ObjectId(haggle["senderItemId"])})
            if sender_item:
                sender_item_name = sender_item["name"]

        if is_valid_objectid(haggle["recipientItemId"]):
            recipient_item = await database["items"].find_one({"_id": ObjectId(haggle["recipientItemId"])})
            if recipient_item:
                recipient_item_name = recipient_item["name"]
        

        if is_valid_objectid(haggle["senderItemId"]):
            sender_item = await database["items"].find_one({"_id": ObjectId(haggle["senderItemId"])})
            if sender_item:
                sender_item_name = sender_item["name"]
                sender_relative_value = sender_item.get("relative_value", None)

        if is_valid_objectid(haggle["recipientItemId"]):
            recipient_item = await database["items"].find_one({"_id": ObjectId(haggle["recipientItemId"])})
            if recipient_item:
                recipient_item_name = recipient_item["name"]
                recipient_relative_value = recipient_item.get("relative_value", None)

        enriched.append({
            "id": str(haggle["_id"]),
            "senderId": haggle["senderId"],
            "recipientId": haggle["recipientId"],
            "senderItemId": haggle["senderItemId"],
            "senderItemName": sender_item_name,
            "senderItemQuantity": haggle["senderItemQuantity"],
            "senderItemRelativeValue": sender_relative_value,     # <-- new
            "recipientItemId": haggle["recipientItemId"],
            "recipientItemName": recipient_item_name,
            "recipientItemQuantity": haggle["recipientItemQuantity"],
            "recipientItemRelativeValue": recipient_relative_value, # <-- new
            "status": haggle.get("status", "pending")
        })

    return enriched

@app.delete("/api/delete-haggle/{haggleId}")
async def delete_haggle(haggleId: str):
    try:
        # Validate the haggleId
        haggle_object_id = ObjectId(haggleId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid haggleId format")

    # Attempt to delete the haggle
    result = await database["haggles"].delete_one({"_id": haggle_object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Haggle not found")

    return {"message": "Haggle deleted successfully"}


def is_valid_objectid(oid: str) -> bool:
    try:
        return ObjectId.is_valid(oid)
    except Exception:
        return False

@app.get("/api/all-haggles")
async def get_all_haggles():
    cursor = database["haggles"].find()
    haggles = await cursor.to_list(length=None)

    enriched = []

    for haggle in haggles:
        sender_item_name = "Unknown"
        recipient_item_name = "Unknown"
        sender_relative_value = None
        recipient_relative_value = None

        sender_item_id = haggle.get("senderItemId", "")
        recipient_item_id = haggle.get("recipientItemId", "")

        if is_valid_objectid(sender_item_id):
            sender_item = await database["items"].find_one({"_id": ObjectId(sender_item_id)})
            if sender_item:
                sender_item_name = sender_item.get("name", "Unknown")
                sender_relative_value = sender_item.get("relative_value")

        if is_valid_objectid(recipient_item_id):
            recipient_item = await database["items"].find_one({"_id": ObjectId(recipient_item_id)})
            if recipient_item:
                recipient_item_name = recipient_item.get("name", "Unknown")
                recipient_relative_value = recipient_item.get("relative_value")

        # Convert ALL ObjectIds to strings before returning
        enriched.append({
            "id": str(haggle.get("_id", "")),
            "senderId": str(haggle.get("senderId", "")),
            "recipientId": str(haggle.get("recipientId", "")),
            "senderItemId": str(sender_item_id),
            "senderItemName": sender_item_name,
            "senderItemQuantity": haggle.get("senderItemQuantity", 0),
            "senderItemRelativeValue": sender_relative_value,
            "recipientItemId": str(recipient_item_id),
            "recipientItemName": recipient_item_name,
            "recipientItemQuantity": haggle.get("recipientItemQuantity", 0),
            "recipientItemRelativeValue": recipient_relative_value,
            "status": haggle.get("status", "pending")
        })

    return enriched


 ####################### End of Haggle Routes ##################

class CreateGroupRequest(BaseModel):
    name: str

class AddUserToGroupRequest(BaseModel):
    userId: str

@app.post("/api/groups")
async def create_group(request: CreateGroupRequest):
    try:
        # Check if the group name already exists
        existing_group = await database.groups.find_one({"name": request.name})
        if existing_group:
            raise HTTPException(status_code=400, detail="Group name already exists")

        result = await database.groups.insert_one({"name": request.name})
        return {"message": "Group created successfully", "groupId": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create group: {str(e)}")

@app.get("/api/groups")
async def get_all_groups():
    try:
        groups = await database.groups.find().to_list(length=None)
        for group in groups:
            group["_id"] = str(group["_id"])  # Convert ObjectId to string
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch groups: {str(e)}")

@app.post("/api/groups/{groupId}/add-user")
async def add_user_to_group(groupId: str, request: AddUserToGroupRequest):
    try:
        group_object_id = validate_object_id(groupId, "groupId")
        user_object_id = validate_object_id(request.userId, "userId")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid groupId or userId format")

    # Check if the group exists
    group = await database.groups.find_one({"_id": group_object_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the user exists
    user = await database.users.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already in the group
    existing = await database.groupMembers.find_one({"groupId": group_object_id, "userId": user_object_id})
    if existing:
        raise HTTPException(status_code=400, detail="User is already in the group")

    result = await database.groupMembers.insert_one({"groupId": group_object_id, "userId": user_object_id})
    return {"message": "User added to group successfully", "id": str(result.inserted_id)}

@app.delete("/api/groups/{groupId}/remove-user/{userId}")
async def remove_user_from_group(groupId: str, userId: str):
    try:
        group_object_id = validate_object_id(groupId, "groupId")
        user_object_id = validate_object_id(userId, "userId")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid groupId or userId format")

    # Check if the group exists
    group = await database.groups.find_one({"_id": group_object_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the user exists
    user = await database.users.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Attempt to remove the user from the group
    result = await database.groupMembers.delete_one({"groupId": group_object_id, "userId": user_object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found in the group")

    return {"message": "User removed from group successfully"}

@app.get("/api/groups/{groupId}/users")
async def get_users_in_group(groupId: str):
    try:
        group_object_id = ObjectId(groupId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid groupId format")

    # Check if the group exists
    group = await database.groups.find_one({"_id": group_object_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Fetch users in the group
    group_members = await database.groupMembers.find({"groupId": group_object_id}).to_list(length=None)
    user_ids = [member["userId"] for member in group_members]

    users = await database.users.find({"_id": {"$in": user_ids}}).to_list(length=None)
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string

    return users