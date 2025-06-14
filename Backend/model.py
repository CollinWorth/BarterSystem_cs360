from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Listing(BaseModel):
	userId: str
	offered_item_id: str
	offered_quantity: int
	requested_item_id: str
	requested_quantity: int
	post_status: str
	
 
 
class Todo(BaseModel):
	nanoid: str
	title: str
	desc: str
	checked: bool

class Address(BaseModel):
    street: str
    unit: Optional[str] = None 
    city: str
    state: str
    zip: str
    country: str
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
	username: str = Field (...,min_length=3,max_length=30)
	email: EmailStr
	password: str
	address: Address
	role: Optional[str] = "user"

	class Config:
		from_attributes = True


class Item(BaseModel):
    name: str
    description: str
    image: Optional[str]
    relative_value: int

class Haggle(BaseModel):
    senderId: str
    recipientId: str
    senderItemId: str
    senderItemQuantity: int
    recipientItemId: str
    recipientItemQuantity: int
    status: str = "pending"
    
class AddBelongRequest(BaseModel):
    userId: str
    itemId: str
    quantity: int
    
class TradeListing(BaseModel):
    userId: str
    offered_item_id: str
    offered_quantity: int
    requested_item_id: str
    requested_quantity: int
    post_status:str

class UpdateUserRoleRequest(BaseModel):
    role: str