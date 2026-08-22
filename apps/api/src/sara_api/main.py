from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sara_api.config import get_settings
from sara_api.routes.health import router as health_router
from sara_api.routes.pairings import router as pairing_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Inicializar pools, telemetría y consumidores en implementaciones posteriores.
    yield


settings = get_settings()
app = FastAPI(
    title="Sara Pairing API",
    version="0.1.0",
    description="API explicable de vinos y gastronomía boliviana.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
)
app.include_router(health_router)
app.include_router(pairing_router, prefix="/v1")
