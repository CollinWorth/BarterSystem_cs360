from pydantic import BaseModel

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
