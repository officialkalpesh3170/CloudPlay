from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any, List
from app.database.firestore import db
from fastapi import Depends
from app.core.security import get_current_user
app = FastAPI(
    title="CloudPlay API",
    description="Backend API for CloudPlay Gaming Platform",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (port 5173) and preview (port 4173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User data model
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr

class ProfileSync(BaseModel):
    xp: Optional[int] = 0
    coins: Optional[int] = 0
    playtimeSeconds: Optional[int] = 0
    highScores: Optional[Dict[str, int]] = {}
    favouriteIds: Optional[List[str]] = []

# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to CloudPlay API!",
        "status": "Running",
        "platform": "Cloud Gaming Platform",
        "docs": "/docs"
    }

# Health API
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CloudPlay Backend",
        "port": 8000
    }

# Games Catalog API
@app.get("/api/games")
def get_games():
    return {
        "games": [
            {
                "id": "cyber-2048",
                "name": "Cyber 2048",
                "category": "Puzzle",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "temple-run",
                "name": "Temple Run",
                "category": "Action",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "hill-climb",
                "name": "Hill Climb Racing",
                "category": "Racing",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "trigger-rally",
                "name": "Trigger Rally 3D",
                "category": "Racing",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "open-world-3d",
                "name": "OpenWorld 3D",
                "category": "Adventure",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "asteroid-fury",
                "name": "Asteroid Fury",
                "category": "Arcade",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "block-puzzle",
                "name": "Block Drop",
                "category": "Puzzle",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "ludo-royale",
                "name": "Ludo Royale",
                "category": "Board",
                "mode": "local",
                "status": "Available"
            },
            {
                "id": "moto-gp",
                "name": "MotoGP: Speed Trial",
                "category": "Racing",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "hexgl",
                "name": "HexGL",
                "category": "Racing",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "clumsy-bird",
                "name": "Clumsy Bird",
                "category": "Arcade",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "particle-clicker",
                "name": "Particle Clicker",
                "category": "Strategy",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "sandboxels",
                "name": "Sandboxels",
                "category": "Simulation",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "a-dark-room",
                "name": "A Dark Room",
                "category": "Adventure",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "astray",
                "name": "Astray",
                "category": "Puzzle",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "duck-hunt",
                "name": "DuckHunt JS",
                "category": "Arcade",
                "mode": "embed",
                "status": "Available"
            },
            {
                "id": "skifree",
                "name": "SkiFree.js",
                "category": "Arcade",
                "mode": "embed",
                "status": "Available"
            }
        ]
    }

# User Registration API
@app.post("/api/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    email = user.email.lower()

    existing_user = (
        db.collection("users")
        .where("email", "==", email)
        .limit(1)
        .stream()
    )

    if next(existing_user, None):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user_data = {
        "username": user.username,
        "email": email,
        "xp": 0,
        "coins": 100,
        "level": 1
    }

    document_ref = db.collection("users").document()
    document_ref.set(user_data)

    return {
        "message": "User created successfully",
        "user_id": document_ref.id,
        "user": user_data
    }

# Sync Player Progression (XP, coins, high scores)

@app.put("/api/users/{user_id}/sync")
def sync_user_profile(
    user_id: str,
    profile: ProfileSync,
    current_user: dict = Depends(get_current_user)
):
    # UID must come from the verified Firebase ID token
    firebase_uid = current_user["uid"]

    # Prevent users from modifying another user's profile
    if user_id != firebase_uid:
        raise HTTPException(
            status_code=403,
            detail="You cannot modify another user's profile"
        )

    doc_ref = db.collection("users").document(firebase_uid)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )

    update_payload = {
        k: v
        for k, v in profile.model_dump(exclude_none=True).items()
    }

    doc_ref.update(update_payload)

    return {
        "status": "success",
        "user_id": firebase_uid,
        "updated": update_payload
    }
                                                             
@app.get("/health/firestore")
def firestore_health():
    try:
        db.collection("_health").document("connection_test").set({
            "status": "connected",
            "project": "cloudplay-513308"
        })
        return {
            "status": "success",
            "message": "Firestore connected successfully!"
        }
    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }

@app.get("/api/users")
def get_users():
    users = db.collection("users").stream()
    user_list = []
    for user in users:
        user_data = user.to_dict()
        user_data["id"] = user.id
        user_list.append(user_data)
    return {
        "total_users": len(user_list),
        "users": user_list
    }
