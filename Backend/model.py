from pydantic import BaseModel

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

class UserCreate(BaseModel):
	username: str
	password: str
	email: str

	class Config:
		orm_mode = True
