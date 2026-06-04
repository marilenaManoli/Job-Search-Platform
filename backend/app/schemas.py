from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Profile ───────────────────────────────────────────────────────────────────
class ProfileOut(BaseModel):
    id: int
    user_id: int
    name: str
    linkedin: str
    github: str
    bsc: str
    msc: str
    grad: str
    thesis: str
    permit: str
    skills: list
    other_skills: str
    langs: str
    role_types: list
    strengths: str
    prefs: str
    anthropic_api_key: str
    ollama_url: str
    ollama_model: str
    provider: str
    model_config = {"from_attributes": True}

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    bsc: Optional[str] = None
    msc: Optional[str] = None
    grad: Optional[str] = None
    thesis: Optional[str] = None
    permit: Optional[str] = None
    skills: Optional[list] = None
    other_skills: Optional[str] = None
    langs: Optional[str] = None
    role_types: Optional[list] = None
    strengths: Optional[str] = None
    prefs: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    provider: Optional[str] = None

# ── Applications ──────────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    company: str
    role: str
    city: str = "Zürich"
    type: str = "junior"
    status: str = "saved"
    url: str = ""
    date_applied: str = ""
    deadline: str = ""
    notes: str = ""

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    city: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    url: Optional[str] = None
    date_applied: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    company: str
    role: str
    city: str
    type: str
    status: str
    url: str
    date_applied: str
    deadline: str
    notes: str
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Goals ─────────────────────────────────────────────────────────────────────
class GoalCreate(BaseModel):
    text: str
    tag: str = "Other"

class GoalUpdate(BaseModel):
    text: Optional[str] = None
    tag: Optional[str] = None
    done: Optional[bool] = None

class GoalOut(BaseModel):
    id: int
    user_id: int
    text: str
    tag: str
    done: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# ── AI ────────────────────────────────────────────────────────────────────────
class AIScanRequest(BaseModel):
    cat: str = "all"
    city: str = "both"
    kw: str = ""

class AICoverLetterRequest(BaseModel):
    company: str
    role: str
    jd: str = ""
    why: str = ""
    tone: str = "professional and warm"
    length: str = "concise (3 short paragraphs)"
    extra: str = ""

class AIOutreachRequest(BaseModel):
    type: str
    recipient_name: str = ""
    company: str = ""
    role: str = ""
    tone: str = "professional and friendly"

class AISuggestionsRequest(BaseModel):
    pass

class AIResponse(BaseModel):
    text: str
