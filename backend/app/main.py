from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import user, category, supplier, product, inventory_movement, sale, ml_model, demand_prediction, recommendation, alert
from app.api import api_router

# Crear automáticamente todas las tablas en MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma Inteligente de Inventario y Predicción ML",
    description="API RESTful para la gestión de inventario, Kardex, análisis predictivo y optimización de compras.",
    version="1.0.0"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "system": "Plataforma Inteligente para Predicción de Demanda y Control de Inventario",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "database": "MySQL Connected"}
