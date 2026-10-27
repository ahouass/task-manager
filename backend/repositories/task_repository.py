from sqlalchemy.orm import Session
from sqlalchemy import select
from models.task_model import Task

def create_task(db: Session, title: str, description: str | None):
    task = Task(title=title, description=description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_all_tasks(db: Session):
    stmt = select(Task)
    result = db.execute(stmt)
    return result.scalars().all()

def get_task_by_id(db: Session, task_id: int):
    stmt = select(Task).where(Task.id == task_id)
    result = db.execute(stmt)
    return result.scalar_one_or_none()

def update_task(
    db: Session,
    task: Task,
    title: str,
    description: str | None,
    completed: bool,
):
    task.title = title
    task.description = description
    task.completed = completed

    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task: Task):
    db.delete(task)
    db.commit()
    return None