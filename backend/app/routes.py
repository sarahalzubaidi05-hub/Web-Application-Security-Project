from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
import pymysql
import bcrypt
import secrets
from datetime import datetime, timedelta
from jose import jwt
import re
import html

router = APIRouter()

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")
    return True

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # SECURE: Parameterized query
    query = "SELECT * FROM users WHERE username = %s"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            # SECURE: Cryptographically secure token
            session_token = secrets.token_urlsafe(32)  # 256-bit token
            
            # Store session in database
            expires_at = datetime.now() + timedelta(hours=24)
            insert_query = "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (user['id'], session_token, expires_at))
            connection.commit()
            cursor.close()
            
            # Generate JWT token
            access_token = create_access_token(data={"sub": username, "user_id": user["id"]})
            
            # Create response with cookie
            response = JSONResponse({
                "message": "Login successful",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"]
                }
            })
            
            # SECURE: Hardened cookie with all flags
            response.set_cookie(
                key="session_id",
                value=session_token,
                httponly=True,      # ✅ JavaScript CANNOT access
                secure=False,       # Set False for localhost (True in production with HTTPS)
                samesite="Strict",  # ✅ CSRF protection
                max_age=86400,      # 24 hours
                path="/"
            )
            
            return response
        else:
            cursor.close()
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    connection = db.connection()
    cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT id, username, email FROM users")
    users = cursor.fetchall()
    cursor.close()
    return {"users": users}

@router.post("/register")
def register(username: str, email: str, password: str, db: Session = Depends(get_db)):
    # Validate password first
    validate_password(password)
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        
        # Check for duplicates with parameterized query
        check_query = "SELECT * FROM users WHERE username = %s OR email = %s"
        cursor.execute(check_query, (username, email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            cursor.close()
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        # Hash password before storage
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Secure INSERT with parameterized query
        insert_query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (username, email, hashed_password.decode('utf-8')))
        connection.commit()
        
        user_id = cursor.lastrowid
        cursor.close()
        
        # Generate JWT token for auto-login
        access_token = create_access_token(data={"sub": username, "user_id": user_id})
        
        return {
            "message": "Registration successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/profile")
def update_profile(username: str, bio: str, db: Session = Depends(get_db)):
    # SECURE: Sanitize HTML input to prevent XSS
    sanitized_bio = html.escape(bio)
    
    query = "UPDATE users SET bio = %s WHERE username = %s"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, (sanitized_bio, username))
        connection.commit()
        cursor.close()
        return {"message": "Bio updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/profile/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    query = "SELECT username, bio FROM users WHERE username = %s"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        cursor.close()
        
        if user:
            return {"username": user["username"], "bio": user["bio"] or ""}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
