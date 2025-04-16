from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Listing(BaseModel):
	name: str
	description: str
	photo: str
	quantity: int
	user: str
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