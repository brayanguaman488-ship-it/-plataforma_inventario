from fastapi import APIRouter
from app.api.endpoints import categories, suppliers, products, inventory, sales, analytics, eda, ml, predictions, recommendations, alerts, reports

api_router = APIRouter()
api_router.include_router(categories.router, prefix="/categories", tags=["Categorías"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Proveedores"])
api_router.include_router(products.router, prefix="/products", tags=["Productos"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventario & Kardex"])
api_router.include_router(sales.router, prefix="/sales", tags=["Ventas & Histórico"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Business Intelligence & KPIs"])
api_router.include_router(eda.router, prefix="/ml", tags=["Machine Learning & EDA"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning & Modelos"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predicción de Demanda"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recomendaciones Inteligentes & ABC"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Centro de Alertas"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reportes & Exportación"])
