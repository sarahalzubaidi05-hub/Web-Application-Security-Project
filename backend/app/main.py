from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vulnerable Web App - SQL Injection Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Vulnerable Web Application API - Educational Purpose Only"}
