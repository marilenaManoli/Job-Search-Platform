from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Application
from app.schemas import ApplicationCreate, ApplicationUpdate, ApplicationOut
from app.deps import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("", response_model=list[ApplicationOut])
async def list_applications(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.user_id == current_user.id).order_by(Application.created_at.desc()))
    return result.scalars().all()

@router.post("", response_model=ApplicationOut, status_code=201)
async def create_application(body: ApplicationCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    app = Application(**body.model_dump(), user_id=current_user.id)
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app

@router.patch("/{app_id}", response_model=ApplicationOut)
async def update_application(app_id: int, body: ApplicationUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == app_id, Application.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(app, field, value)
    await db.commit()
    await db.refresh(app)
    return app

@router.delete("/{app_id}", status_code=204)
async def delete_application(app_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == app_id, Application.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(app)
    await db.commit()
