from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import pymysql
import bcrypt
import re
from jose import jwt
from datetime import datetime, timedelta

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
    """
    Validate password meets security requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (!@#$%^&*...)")
    
    return True

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    query = "SELECT * FROM users WHERE username = %s"

    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)

        cursor.execute(query, (username,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verify hashed password using bcrypt
        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        
        access_token = create_access_token(
            data={"sub": user["username"], "user_id": user["id"]}
        )

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/register")
def register(username: str, email: str, password: str, db: Session = Depends(get_db)):
    # Validate password strength
    validate_password(password)
    
    # Check if username already exists
    check_query = "SELECT * FROM users WHERE username = %s OR email = %s"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(check_query, (username, email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            cursor.close()
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        # Hash password with bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Insert new user with parameterized query (SQL injection safe)
        insert_query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (username, email, hashed_password.decode('utf-8')))
        connection.commit()
        
        # Get the new user's ID
        user_id = cursor.lastrowid
        cursor.close()
        
        # Create JWT token for auto-login
        access_token = create_access_token(
            data={"sub": username, "user_id": user_id}
        )
        
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
