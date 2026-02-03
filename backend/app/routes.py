from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
import pymysql
import uuid
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # INTENTIONALLY VULNERABLE CODE - DO NOT USE IN PRODUCTION
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query)
        user = cursor.fetchone()
        
        if user:
            # VULNERABLE: Predictable session token
            session_token = str(uuid.uuid4())
            
            # Store session in database
            expires_at = datetime.now() + timedelta(hours=24)
            insert_query = f"INSERT INTO sessions (user_id, session_token, expires_at) VALUES ({user['id']}, '{session_token}', '{expires_at}')"
            cursor.execute(insert_query)
            connection.commit()
            cursor.close()
            
            # Create response with cookie
            response = JSONResponse({
                "message": "Login successful",
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"]
                }
            })
            
            # VULNERABLE: Insecure cookie (no flags)
            response.set_cookie(
                key="session_id",
                value=session_token
                # ❌ No httponly - JavaScript can steal it
                # ❌ No secure - sent over HTTP
                # ❌ No samesite - CSRF vulnerable
            )
            
            return response
        else:
            cursor.close()
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        # Show SQL error for demonstration
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
    
    query = f"INSERT INTO users (username, email, password) VALUES ('{username}', '{email}', '{password}')"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query)
        connection.commit()
        
        user_id = cursor.lastrowid
        cursor.close()
        
        return {
            "message": "Registration successful",
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")