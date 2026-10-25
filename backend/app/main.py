import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError

from app.api.router import api_router
from app.core.config import settings


logger = logging.getLogger(__name__)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for the TemanBunda pregnancy companion application.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


# Error Supabase yang tidak tertangani dulu jadi 500 tanpa header CORS, sehingga browser
# melaporkannya sebagai "gagal koneksi". Ubah jadi respons JSON yang jelas.
@app.exception_handler(APIError)
def supabase_error_handler(request: Request, exc: APIError) -> JSONResponse:
    logger.error("Supabase error on %s %s: %s", request.method, request.url.path, exc.message)
    # PGRST205: tabel belum ada, PGRST204: kolom belum ada
    if exc.code in ("PGRST205", "PGRST204"):
        detail = "Tabel database belum dibuat. Jalankan migrasi terbaru di backend/migrations pada Supabase."
    else:
        detail = "Database sedang bermasalah. Coba lagi beberapa saat lagi."
    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"detail": detail})


@app.get("/api/ready", tags=["system"])
def readiness_check() -> dict[str, str]:
    if settings.environment == "production" and not settings.supabase_configured:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase is not configured")
    return {"status": "ready", "environment": settings.environment}


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }
