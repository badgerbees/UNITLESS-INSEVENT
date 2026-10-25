from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.me import router as me_router
from app.api.routes.pregnancies import router as pregnancies_router
from app.api.routes.health_data import router as health_data_router
from app.api.routes.calendar import router as calendar_router
from app.api.routes.resources import router as resources_router
from app.api.routes.reports import router as reports_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.emergency import router as emergency_router


api_router = APIRouter()
api_router.include_router(health_router, tags=["system"])
api_router.include_router(me_router, tags=["users"])
api_router.include_router(pregnancies_router, tags=["pregnancies"])
api_router.include_router(health_data_router, tags=["health"])
api_router.include_router(calendar_router, tags=["calendar"])
api_router.include_router(resources_router, tags=["resources"])
api_router.include_router(reports_router, tags=["reports"])
api_router.include_router(notifications_router, tags=["notifications"])
api_router.include_router(emergency_router, tags=["emergency"])
