from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.responsable import router as responsable_router
from app.routes.maestro import router as maestro_router

app = FastAPI(
    title="Sistema de Control de Asistencias",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(responsable_router)
app.include_router(maestro_router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API funcionando"
    }


@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

    return {
        "database": "conectada",
        "resultado": result.scalar()
    }