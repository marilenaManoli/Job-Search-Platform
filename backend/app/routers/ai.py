from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from app.database import get_db
from app.models import User, Profile
from app.schemas import AIScanRequest, AICoverLetterRequest, AIOutreachRequest, AISuggestionsRequest, AIResponse
from app.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

CAT_DESCRIPTIONS = {
    "all":      "junior software engineer, data engineer, AI/ML, research assistant, or internship roles",
    "swe":      "junior software engineer or junior developer roles",
    "growth":   "growth engineer, product growth, B2B SaaS growth, experimentation, or growth analytics roles",
    "data":     "data engineer, data analyst, or ML engineer roles",
    "ai":       "AI engineer, human-centered AI, AI product, or AI UX roles",
    "research": "research assistant, research engineer, or academic software roles",
    "intern":   "any technology internships",
    "product":  "AI product manager, UX researcher, technical product roles",
}
CITY_DESC = {"both": "Zürich or Basel", "zurich": "Zürich", "basel": "Basel", "remote": "remote or anywhere in Switzerland"}


def build_profile_summary(profile: Profile) -> str:
    roles = ", ".join(profile.role_types) if profile.role_types else "junior software engineer, data/AI roles"
    skills = ", ".join(profile.skills) + (f", {profile.other_skills}" if profile.other_skills else "")
    return f"""Candidate profile:
- Name: {profile.name or 'CS graduate student'}
- Education: {profile.bsc or 'BSc Computer Science'} + {profile.msc or 'MSc Computer Science (University of Bern)'}
- Graduation: {profile.grad or 'August 2026'}
- Thesis/project: {profile.thesis or 'Multimodal human-AI interaction system'}
- Work permit: {profile.permit or 'studying in Switzerland'}
- Technical skills: {skills or 'Python, JavaScript, ML basics'}
- Languages: {profile.langs or 'English (fluent)'}
- Target roles: {roles}
- Key strengths: {profile.strengths or 'strong CS foundations, human-centered thinking'}
- Work preferences: {profile.prefs or 'hybrid, collaborative, meaning-driven'}""".strip()


async def call_anthropic(api_key: str, messages: list, system: str, web_search: bool = False) -> str:
    body = {"model": "claude-sonnet-4-6", "max_tokens": 2000, "system": system, "messages": messages}
    if web_search:
        body["tools"] = [{"type": "web_search_20250305", "name": "web_search"}]
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            json=body,
        )
    if not r.is_success:
        raise HTTPException(status_code=502, detail=r.json().get("error", {}).get("message", "Anthropic error"))
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")


async def call_ollama(url: str, model: str, messages: list, system: str) -> str:
    all_messages = ([{"role": "system", "content": system}] if system else []) + messages
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(f"{url}/v1/chat/completions", json={"model": model, "messages": all_messages, "stream": False})
    if not r.is_success:
        raise HTTPException(status_code=502, detail="Ollama error: " + r.text)
    return r.json()["choices"][0]["message"]["content"]


async def call_ai(profile: Profile, messages: list, system: str, web_search: bool = False) -> str:
    if web_search or profile.provider == "anthropic":
        if not profile.anthropic_api_key:
            raise HTTPException(status_code=400, detail="Anthropic API key not set. Add it in Settings.")
        return await call_anthropic(profile.anthropic_api_key, messages, system, web_search)
    return await call_ollama(profile.ollama_url, profile.ollama_model, messages, system)


async def get_profile(current_user: User, db: AsyncSession) -> Profile:
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    return result.scalar_one()


@router.post("/scan", response_model=AIResponse)
async def scan_jobs(body: AIScanRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await get_profile(current_user, db)
    summary = build_profile_summary(profile)
    cat_desc = CAT_DESCRIPTIONS.get(body.cat, CAT_DESCRIPTIONS["all"])
    city_desc = CITY_DESC.get(body.city, "Zürich or Basel")

    if profile.provider == "ollama":
        prompt = f"""Give a targeted Swiss job search strategy for: {cat_desc} in {city_desc}.

{summary}

Provide:
1. 6-8 exact search terms to use on jobs.ch, LinkedIn, Google Jobs
2. 10 specific Swiss companies to check directly with their careers page path
3. Best timing to apply on Swiss job boards
4. Red flags to avoid in job descriptions
5. One niche tip specific to this role type in Switzerland

Be specific and reference the candidate's actual skills."""
        text = await call_ollama(profile.ollama_url, profile.ollama_model, [{"role": "user", "content": prompt}],
            "You are a practical Swiss job search advisor.")
    else:
        prompt = f"""Search the web RIGHT NOW for current job openings in Switzerland.

Find real, current listings for: {cat_desc}
Location: {city_desc}
Requirements: English-friendly, suitable for a recent CS MSc graduate{', keywords: ' + body.kw if body.kw else ''}

Search: jobs.ch, swissdevjobs.ch, linkedin.com/jobs, glassdoor.com, datacareer.ch, englishforum.ch/jobs

For each job: title, company, location, 1-2 sentence description, why it suits the candidate, URL.
Aim for 6-10 real current openings posted in the last 30 days.

{summary}"""
        text = await call_anthropic(profile.anthropic_api_key, [{"role": "user", "content": prompt}],
            "You are a helpful Swiss job search assistant. Always search the web for current listings.", web_search=True)

    return {"text": text}


@router.post("/cover-letter", response_model=AIResponse)
async def cover_letter(body: AICoverLetterRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await get_profile(current_user, db)
    prompt = f"""Write a cover letter for this job application.

CANDIDATE:
{build_profile_summary(profile)}

TARGET JOB:
Company: {body.company}
Role: {body.role}
{('Job description:\n' + body.jd) if body.jd else ''}
{('Why this company/role: ' + body.why) if body.why else ''}

REQUIREMENTS:
- Tone: {body.tone}
- Length: {body.length}
- {('Special instructions: ' + body.extra) if body.extra else 'Standard professional cover letter'}
- Swiss/European professional context
- Do NOT use "Dear Sir/Madam" or "I am writing to apply"
- Highlight the Swiss MSc connection for local credibility
- Start with a compelling match statement, end with a confident close
- Include placeholder [City, Date] at top

Output ONLY the letter text."""
    text = await call_ai(profile, [{"role": "user", "content": prompt}],
        "You are an expert career coach specialising in Swiss tech applications. Write compelling, personalised cover letters.")
    return {"text": text}


@router.post("/outreach", response_model=AIResponse)
async def outreach(body: AIOutreachRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await get_profile(current_user, db)
    prompt = f"""Write a {body.type} message for a Swiss tech job search.

SENDER:
{build_profile_summary(profile)}

MESSAGE DETAILS:
{('Recipient: ' + body.recipient_name) if body.recipient_name else 'Recipient: unnamed'}
{('Company/agency: ' + body.company) if body.company else ''}
{('Role: ' + body.role) if body.role else 'Open to junior/graduate tech roles'}
Tone: {body.tone}

REQUIREMENTS:
- LinkedIn DMs under 150 words, emails under 200 words
- Sound human, not template-like
- Mention the Swiss MSc naturally
- Do NOT write "I hope this message finds you well"
- Clear low-pressure call to action
- For email: include "Subject: ..." on the first line

Output ONLY the message."""
    text = await call_ai(profile, [{"role": "user", "content": prompt}],
        "You write short, natural, effective professional outreach messages. Confident, never desperate.")
    return {"text": text}


@router.post("/suggestions", response_model=AIResponse)
async def suggestions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await get_profile(current_user, db)
    from app.models import Application, Goal
    apps_result = await db.execute(select(Application).where(Application.user_id == current_user.id))
    apps = apps_result.scalars().all()
    goals_result = await db.execute(select(Goal).where(Goal.user_id == current_user.id))
    goals = goals_result.scalars().all()

    by_status = {}
    for a in apps:
        by_status[a.status] = by_status.get(a.status, 0) + 1
    done_goals = sum(1 for g in goals if g.done)
    tracker = f"""- Total tracked: {len(apps)} roles
- By status: {', '.join(f'{k}: {v}' for k, v in by_status.items()) or 'none yet'}
- Weekly goals: {done_goals}/{len(goals)} done"""

    prompt = f"""Analyse this job seeker's profile and give personalised Swiss tech job search suggestions.

{build_profile_summary(profile)}

Current progress:
{tracker}

Respond in exactly these 5 sections, each starting with ## and the exact name:

## Role Fit
Which roles match best and why — reference their actual thesis and skills.

## Companies to Target
8-10 real Swiss companies in Zürich or Basel with one-line reason each.

## Strengths to Highlight
What to emphasise in applications — reference actual skills and thesis.

## Skill Gaps
2-4 specific gaps with concrete suggestions (course, project, quick win).

## Quick Wins This Week
5 specific actionable tasks — name real companies, platforms, actions. No generic advice."""
    text = await call_ai(profile, [{"role": "user", "content": prompt}],
        "You are a Swiss tech career advisor. Be direct, specific, always reference the candidate's actual profile.")
    return {"text": text}
