from fastapi import FastAPI

from database import Base, engine
from models import task_model          # noqa: F401  ← registers Task on Base.metadata
from routers import task_router

app = FastAPI(title="Task Manager API")

# Create tables (only those that don't exist yet)
Base.metadata.create_all(bind=engine)

# Register the task router
app.include_router(task_router.router)


@app.get("/")
def root():
    return {"message": "Task Manager API is running"}