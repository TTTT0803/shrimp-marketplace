from fastapi import FastAPI
from app.routers import analyze

app = FastAPI(title="Shrimp AI Service")

app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])


@app.get("/health")
def health_check():
    return {"status": "ok"}