from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def now_utc():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[list["Goal"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), default="")
    linkedin: Mapped[str] = mapped_column(String(500), default="")
    github: Mapped[str] = mapped_column(String(500), default="")
    bsc: Mapped[str] = mapped_column(String(500), default="")
    msc: Mapped[str] = mapped_column(String(500), default="")
    grad: Mapped[str] = mapped_column(String(100), default="")
    thesis: Mapped[str] = mapped_column(String(500), default="")
    permit: Mapped[str] = mapped_column(String(200), default="")
    skills: Mapped[list] = mapped_column(JSON, default=list)
    other_skills: Mapped[str] = mapped_column(String(500), default="")
    langs: Mapped[str] = mapped_column(String(300), default="")
    role_types: Mapped[list] = mapped_column(JSON, default=list)
    strengths: Mapped[str] = mapped_column(Text, default="")
    prefs: Mapped[str] = mapped_column(Text, default="")
    anthropic_api_key: Mapped[str] = mapped_column(String(500), default="")
    ollama_url: Mapped[str] = mapped_column(String(200), default="http://localhost:11434")
    ollama_model: Mapped[str] = mapped_column(String(100), default="llama3")
    provider: Mapped[str] = mapped_column(String(50), default="anthropic")

    user: Mapped["User"] = relationship(back_populates="profile")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="Zürich")
    type: Mapped[str] = mapped_column(String(50), default="junior")
    status: Mapped[str] = mapped_column(String(50), default="saved")
    url: Mapped[str] = mapped_column(String(500), default="")
    date_applied: Mapped[str] = mapped_column(String(20), default="")
    deadline: Mapped[str] = mapped_column(String(20), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    user: Mapped["User"] = relationship(back_populates="applications")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    tag: Mapped[str] = mapped_column(String(50), default="Other")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    user: Mapped["User"] = relationship(back_populates="goals")
