from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import Todo

origins = ["*"]

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)

@app.get('/')
def get_root():
	return {"Ping": "Pong"}

##############################################################
@app.get("/api/get-todo/{nanoid}", response_model=Todo)
async def get_one_todo(nanoid):
    todo = await fetch_one_todo(nanoid)
    if not todo: raise HTTPException(404)
    return todo

@app.get("/api/get-todo")
async def get_todos():
    todos = await fetch_all_todos()
    if not todos: raise HTTPException(404)
    return todos

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

