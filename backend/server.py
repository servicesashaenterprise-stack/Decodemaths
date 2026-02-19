from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    created_at: datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str
    question_text: str
    question_type: str
    marks: int
    class_level: str
    chapter: str
    chapter_number: int
    correct_answer: Optional[str] = None
    options: Optional[List[str]] = None
    youtube_link: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class QuestionCreate(BaseModel):
    question_text: str
    question_type: str
    marks: int
    class_level: str
    chapter: str
    chapter_number: int
    correct_answer: Optional[str] = None
    options: Optional[List[str]] = None
    youtube_link: Optional[str] = None
    explanation: Optional[str] = None

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    marks: Optional[int] = None
    class_level: Optional[str] = None
    chapter: Optional[str] = None
    chapter_number: Optional[int] = None
    correct_answer: Optional[str] = None
    options: Optional[List[str]] = None
    youtube_link: Optional[str] = None
    explanation: Optional[str] = None

class Bookmark(BaseModel):
    model_config = ConfigDict(extra="ignore")
    bookmark_id: str
    user_id: str
    question_id: str
    created_at: datetime

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    progress_id: str
    user_id: str
    question_id: str
    is_correct: bool
    time_spent: int
    created_at: datetime

class ProgressCreate(BaseModel):
    question_id: str
    is_correct: bool
    time_spent: int

class QuestionReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    report_id: str
    user_id: str
    question_id: str
    issue_description: str
    status: str = "pending"
    created_at: datetime

class ReportCreate(BaseModel):
    question_id: str
    issue_description: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    user_id: str
    user_name: str
    rating: int
    review_text: str
    admin_reply: Optional[str] = None
    admin_reply_at: Optional[datetime] = None
    created_at: datetime

class ReviewCreate(BaseModel):
    rating: int
    review_text: str

class ReviewReply(BaseModel):
    reply_text: str

class PracticeTest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    test_id: str
    user_id: str
    class_level: str
    chapter: Optional[str] = None
    question_ids: List[str]
    total_questions: int
    created_at: datetime

class PracticeTestCreate(BaseModel):
    class_level: str
    chapter: Optional[str] = None
    question_count: int = 10

class SessionIDRequest(BaseModel):
    session_id: str

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

async def get_user_from_session(session_token: Optional[str] = None, authorization: Optional[str] = None) -> Optional[User]:
    """Get user from session_token cookie or Authorization header"""
    token = session_token or (authorization.replace('Bearer ', '') if authorization else None)
    
    if not token:
        return None
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        return None
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None) -> User:
    """Dependency to get current authenticated user"""
    user = await get_user_from_session(session_token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def get_admin_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None) -> User:
    """Dependency to get current authenticated admin user"""
    user = await get_user_from_session(session_token, authorization)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    """Register new student user"""
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "picture": None,
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    del user_doc["password"]
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return User(**user_doc)

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    """Login student user"""
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user_doc.get("role") != "student":
        raise HTTPException(status_code=403, detail="Please use admin login")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    del user_doc["password"]
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return User(**user_doc)

@api_router.post("/auth/admin/login")
async def admin_login(credentials: AdminLogin, response: Response):
    """Login admin user"""
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user_doc.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    del user_doc["password"]
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return User(**user_doc)

@api_router.post("/auth/google/session")
async def google_auth_session(request: SessionIDRequest, response: Response):
    """Exchange session_id from Emergent Auth for user data"""
    try:
        # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        emergent_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": request.session_id},
            timeout=10
        )
        
        if emergent_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        google_data = emergent_response.json()
        
        user_doc = await db.users.find_one({"email": google_data["email"]}, {"_id": 0})
        
        if user_doc:
            user_id = user_doc["user_id"]
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": google_data["email"],
                "name": google_data["name"],
                "picture": google_data.get("picture"),
                "role": "student",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = google_data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7*24*60*60,
            path="/"
        )
        
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc['created_at'], str) else user_doc['created_at']
        return User(**user_doc)
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")

@api_router.get("/auth/me")
async def get_me(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get current user from session"""
    user = await get_user_from_session(session_token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

# ============= QUESTION ROUTES =============

@api_router.get("/questions")
async def get_questions(
    class_level: Optional[str] = None,
    chapter: Optional[str] = None,
    marks: Optional[int] = None,
    question_type: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """Get questions with filters (public access for preview)"""
    query = {}
    if class_level:
        query["class_level"] = class_level
    if chapter:
        query["chapter"] = chapter
    if marks:
        query["marks"] = marks
    if question_type:
        query["question_type"] = question_type
    
    questions = await db.questions.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for q in questions:
        if isinstance(q.get('created_at'), str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
        if isinstance(q.get('updated_at'), str):
            q['updated_at'] = datetime.fromisoformat(q['updated_at'])
    
    return [Question(**q) for q in questions]

@api_router.get("/questions/{question_id}")
async def get_question(question_id: str):
    """Get single question by ID"""
    question = await db.questions.find_one({"question_id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if isinstance(question.get('created_at'), str):
        question['created_at'] = datetime.fromisoformat(question['created_at'])
    if isinstance(question.get('updated_at'), str):
        question['updated_at'] = datetime.fromisoformat(question['updated_at'])
    
    return Question(**question)

@api_router.get("/questions/stats/overview")
async def get_question_stats():
    """Get overview statistics of questions"""
    total = await db.questions.count_documents({})
    
    by_class = await db.questions.aggregate([
        {"$group": {"_id": "$class_level", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    by_type = await db.questions.aggregate([
        {"$group": {"_id": "$question_type", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    return {
        "total": total,
        "by_class": {item["_id"]: item["count"] for item in by_class},
        "by_type": {item["_id"]: item["count"] for item in by_type}
    }

# ============= ADMIN QUESTION ROUTES =============

@api_router.post("/admin/questions")
async def create_question(question_data: QuestionCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Create new question (admin only)"""
    admin = await get_admin_user(session_token, authorization)
    
    question_id = f"q_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    question_doc = {
        "question_id": question_id,
        **question_data.model_dump(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.questions.insert_one(question_doc)
    
    question_doc['created_at'] = now
    question_doc['updated_at'] = now
    return Question(**question_doc)

@api_router.put("/admin/questions/{question_id}")
async def update_question(question_id: str, question_data: QuestionUpdate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Update question (admin only)"""
    admin = await get_admin_user(session_token, authorization)
    
    existing = await db.questions.find_one({"question_id": question_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = {k: v for k, v in question_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.questions.update_one({"question_id": question_id}, {"$set": update_data})
    
    updated = await db.questions.find_one({"question_id": question_id}, {"_id": 0})
    updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Question(**updated)

@api_router.delete("/admin/questions/{question_id}")
async def delete_question(question_id: str, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Delete question (admin only)"""
    admin = await get_admin_user(session_token, authorization)
    
    result = await db.questions.delete_one({"question_id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question deleted successfully"}

# ============= BOOKMARK ROUTES =============

@api_router.post("/bookmarks/{question_id}")
async def add_bookmark(question_id: str, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Add bookmark"""
    user = await get_current_user(session_token, authorization)
    
    existing = await db.bookmarks.find_one({"user_id": user.user_id, "question_id": question_id}, {"_id": 0})
    if existing:
        return {"message": "Already bookmarked"}
    
    bookmark_id = f"bm_{uuid.uuid4().hex[:12]}"
    bookmark_doc = {
        "bookmark_id": bookmark_id,
        "user_id": user.user_id,
        "question_id": question_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookmarks.insert_one(bookmark_doc)
    
    bookmark_doc['created_at'] = datetime.fromisoformat(bookmark_doc['created_at'])
    return Bookmark(**bookmark_doc)

@api_router.delete("/bookmarks/{question_id}")
async def remove_bookmark(question_id: str, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Remove bookmark"""
    user = await get_current_user(session_token, authorization)
    
    result = await db.bookmarks.delete_one({"user_id": user.user_id, "question_id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark removed"}

@api_router.get("/bookmarks")
async def get_bookmarks(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get user bookmarks"""
    user = await get_current_user(session_token, authorization)
    
    bookmarks = await db.bookmarks.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    question_ids = [b["question_id"] for b in bookmarks]
    questions = await db.questions.find({"question_id": {"$in": question_ids}}, {"_id": 0}).to_list(1000)
    
    for q in questions:
        if isinstance(q.get('created_at'), str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
        if isinstance(q.get('updated_at'), str):
            q['updated_at'] = datetime.fromisoformat(q['updated_at'])
    
    return [Question(**q) for q in questions]

# ============= PROGRESS ROUTES =============

@api_router.post("/progress")
async def add_progress(progress_data: ProgressCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Track question progress"""
    user = await get_current_user(session_token, authorization)
    
    progress_id = f"prog_{uuid.uuid4().hex[:12]}"
    progress_doc = {
        "progress_id": progress_id,
        "user_id": user.user_id,
        **progress_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress.insert_one(progress_doc)
    
    progress_doc['created_at'] = datetime.fromisoformat(progress_doc['created_at'])
    return Progress(**progress_doc)

@api_router.get("/progress/stats")
async def get_progress_stats(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get user progress statistics"""
    user = await get_current_user(session_token, authorization)
    
    total = await db.progress.count_documents({"user_id": user.user_id})
    correct = await db.progress.count_documents({"user_id": user.user_id, "is_correct": True})
    
    recent = await db.progress.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_attempted": total,
        "correct_answers": correct,
        "accuracy": round((correct / total * 100) if total > 0 else 0, 2),
        "recent_activity": recent
    }

# ============= REPORT ROUTES =============

@api_router.post("/reports")
async def report_question(report_data: ReportCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Report question with issue"""
    user = await get_current_user(session_token, authorization)
    
    report_id = f"rep_{uuid.uuid4().hex[:12]}"
    report_doc = {
        "report_id": report_id,
        "user_id": user.user_id,
        **report_data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.question_reports.insert_one(report_doc)
    
    report_doc['created_at'] = datetime.fromisoformat(report_doc['created_at'])
    return QuestionReport(**report_doc)

@api_router.get("/admin/reports")
async def get_reports(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get all question reports (admin only)"""
    admin = await get_admin_user(session_token, authorization)
    
    reports = await db.question_reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for r in reports:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    
    return [QuestionReport(**r) for r in reports]

# ============= PRACTICE TEST ROUTES =============

@api_router.post("/practice-tests")
async def create_practice_test(test_data: PracticeTestCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Generate practice test"""
    user = await get_current_user(session_token, authorization)
    
    query = {"class_level": test_data.class_level}
    if test_data.chapter:
        query["chapter"] = test_data.chapter
    
    all_questions = await db.questions.find(query, {"_id": 0}).to_list(1000)
    
    if len(all_questions) < test_data.question_count:
        raise HTTPException(status_code=400, detail=f"Not enough questions available. Found {len(all_questions)}")
    
    import random
    selected = random.sample(all_questions, test_data.question_count)
    question_ids = [q["question_id"] for q in selected]
    
    test_id = f"test_{uuid.uuid4().hex[:12]}"
    test_doc = {
        "test_id": test_id,
        "user_id": user.user_id,
        "class_level": test_data.class_level,
        "chapter": test_data.chapter,
        "question_ids": question_ids,
        "total_questions": len(question_ids),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.practice_tests.insert_one(test_doc)
    
    test_doc['created_at'] = datetime.fromisoformat(test_doc['created_at'])
    return PracticeTest(**test_doc)

@api_router.get("/practice-tests")
async def get_practice_tests(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get user's practice tests"""
    user = await get_current_user(session_token, authorization)
    
    tests = await db.practice_tests.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for t in tests:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    
    return [PracticeTest(**t) for t in tests]

@api_router.get("/practice-tests/{test_id}")
async def get_practice_test(test_id: str, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Get practice test with questions"""
    user = await get_current_user(session_token, authorization)
    
    test = await db.practice_tests.find_one({"test_id": test_id, "user_id": user.user_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    questions = await db.questions.find({"question_id": {"$in": test["question_ids"]}}, {"_id": 0}).to_list(1000)
    
    for q in questions:
        if isinstance(q.get('created_at'), str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
        if isinstance(q.get('updated_at'), str):
            q['updated_at'] = datetime.fromisoformat(q['updated_at'])
    
    test['created_at'] = datetime.fromisoformat(test['created_at']) if isinstance(test['created_at'], str) else test['created_at']
    
    return {
        "test": PracticeTest(**test),
        "questions": [Question(**q) for q in questions]
    }

# ============= CHAPTER/CLASS METADATA =============

@api_router.get("/metadata/classes")
async def get_classes():
    """Get available classes"""
    return {
        "classes": ["Class 10", "Class 11", "Class 12", "CA Foundation", "JEE"]
    }

@api_router.get("/metadata/chapters")
async def get_chapters(class_level: str):
    """Get chapters for a class"""
    chapters = await db.questions.aggregate([
        {"$match": {"class_level": class_level}},
        {"$group": {"_id": "$chapter", "chapter_number": {"$first": "$chapter_number"}}},
        {"$sort": {"chapter_number": 1}}
    ]).to_list(100)
    
    return {"chapters": [{"name": c["_id"], "number": c["chapter_number"]} for c in chapters]}

# ============= REVIEW ROUTES =============

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    """Submit a review"""
    user = await get_current_user(session_token, authorization)
    
    # Check if user already reviewed
    existing = await db.reviews.find_one({"user_id": user.user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review")
    
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_id = f"rev_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "rating": review_data.rating,
        "review_text": review_data.review_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    review_doc['created_at'] = datetime.fromisoformat(review_doc['created_at'])
    return Review(**review_doc)

@api_router.get("/reviews")
async def get_reviews(limit: int = 10, skip: int = 0):
    """Get public reviews"""
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for r in reviews:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    
    return [Review(**r) for r in reviews]

@api_router.get("/reviews/stats")
async def get_review_stats():
    """Get review statistics"""
    total = await db.reviews.count_documents({})
    
    if total == 0:
        return {"total": 0, "average_rating": 0, "rating_distribution": {}}
    
    ratings = await db.reviews.aggregate([
        {"$group": {"_id": "$rating", "count": {"$sum": 1}}}
    ]).to_list(10)
    
    avg_rating = await db.reviews.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]).to_list(1)
    
    return {
        "total": total,
        "average_rating": round(avg_rating[0]["avg"], 1) if avg_rating else 0,
        "rating_distribution": {str(item["_id"]): item["count"] for item in ratings}
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
