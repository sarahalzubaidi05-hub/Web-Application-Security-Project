from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import pymysql
import bcrypt

from jose import JWTError, jwt
from datetime import datetime, timedelta

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # Secure: Query by username only
    query = "SELECT * FROM users WHERE username = %s"
    
    try:
        connection = db.connection()
        cursor = connection.connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        cursor.close()
        
        if user:
            # Verify hashed password using bcrypt
            if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
          
             # Create JWT token
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
                    "email": user["email"]
                }
            }
             
                       
                        
           
                    }
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
