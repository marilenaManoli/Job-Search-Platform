from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.database import get_db
from app.models import User, Goal
from app.schemas import GoalCreate, GoalUpdate, GoalOut
from app.deps import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("", response_model=list[GoalOut])
async def list_goals(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.created_at))
    return result.scalars().all()

@router.post("", response_model=GoalOut, status_code=201)
async def create_goal(body: GoalCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    goal = Goal(**body.model_dump(), user_id=current_user.id)
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal

@router.patch("/{goal_id}", response_model=GoalOut)
async def update_goal(goal_id: int, body: GoalUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(goal, field, value)
    await db.commit()
    await db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(goal)
    await db.commit()

@router.post("/reset-week", response_model=list[GoalOut])
async def reset_week(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(update(Goal).where(Goal.user_id == current_user.id).values(done=False))
    await db.commit()
    result = await db.execute(select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.created_at))
    return result.scalars().all()
