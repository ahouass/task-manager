from sqlalchemy.orm import Session
from fastapi import HTTPException
from schemas.task_schema import TaskCreate, TaskUpdate
from repositories import task_repository

def create_task(db: Session, task_data: TaskCreate):
    return task_repository.create_task(
        db,
        title=task_data.title,
        description=task_data.description,
    )

def get_all_tasks(db: Session):
    return task_repository.get_all_tasks(db)

def get_task_by_id(db: Session, task_id: int):
    task = task_repository.get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

def update_task(db: Session, task_id: int, task_data: TaskUpdate):
    task = task_repository.get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task_repository.update_task(
        db,
        task=task,
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
    )

def delete_task(db: Session, task_id: int):
    task = task_repository.get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task_repository.delete_task(db, task)
    return None