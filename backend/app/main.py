from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes import auth as auth_router
from app.api.routes import jobs as jobs_router


app = FastAPI(title="Recruiter AI API", version="1.0.0")

# Configure CORS - permissive for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api/v1
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/auth")
app.include_router(jobs_router.router, prefix="/api/v1")
