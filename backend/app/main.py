from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vulnerable Web App - SQL Injection Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import router AFTER app is created to avoid early SQLAlchemy load
from app.routes import router
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Vulnerable Web Application API - Educational Purpose Only"}
