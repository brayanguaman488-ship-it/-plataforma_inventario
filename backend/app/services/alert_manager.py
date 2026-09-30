from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.core.database import Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement
from app.models.user import User
from app.models.sale import Sale, SaleItem
from app.models.alert import Alert
from app.services.inventory_optimizer import InventoryOptimizer

class AlertManager:
    """
    Gestor de Alertas Inteligentes: Analiza el catálogo y genera notificaciones operacionales.
    """

    def __init__(self, db: Session):
        Base.metadata.create_all(bind=engine)
        self.db = db
        self.optimizer = InventoryOptimizer(db)

    def synchronize_system_alerts(self) -> List[Dict[str, Any]]:
        # Obtener recomendaciones actuales
        recs = self.optimizer.generate_smart_recommendations()

        # Limpiar alertas activas anteriores para regenerar estado fresco
        self.db.query(Alert).filter(Alert.status == "ACTIVA").delete()

        generated_alerts: List[Alert] = []

        for r in recs:
            if r["recommendation_type"] == "COMPRA_URGENTE":
                if r["current_stock"] <= 0:
                    alert = Alert(
                        product_id=r["product_id"],
                        alert_type="AGOTADO",
                        severity="CRITICA",
                        message=f"STOCK AGOTADO: El dispositivo {r['name']} ({r['sku']}) tiene 0 unidades en inventario. Se proyecta una demanda de {r['predicted_demand_30d']} unidades a 30 días.",
                        status="ACTIVA"
                    )
                else:
                    alert = Alert(
                        product_id=r["product_id"],
                        alert_type="QUIEBRE_INMINENTE",
                        severity="CRITICA",
                        message=f"QUIEBRE INMINENTE: {r['name']} tiene solo {r['current_stock']} unidades (cobertura para {r['days_of_inventory']} días) vs Lead Time de {r['lead_time_days']} días.",
                        status="ACTIVA"
                    )
                generated_alerts.append(alert)

            elif r["recommendation_type"] == "COMPRAR":
                alert = Alert(
                    product_id=r["product_id"],
                    alert_type="REORDEN_ALCANZADO",
                    severity="ALTA" if r["abc_class"] == "A" else "MEDIA",
                    message=f"Punto de Reorden alcanzado en {r['name']}: Stock actual de {r['current_stock']} unidades. Se sugiere reponer {r['recommended_quantity']} unidades (EOQ: {r['eoq_quantity']}).",
                    status="ACTIVA"
                )
                generated_alerts.append(alert)

            elif r["recommendation_type"] == "SOBREINVENTARIO":
                alert = Alert(
                    product_id=r["product_id"],
                    alert_type="SOBREINVENTARIO",
                    severity="INFORMATIVA",
                    message=f"Exceso de existencias en {r['name']}: {r['current_stock']} unidades en almacén con cobertura para {r['days_of_inventory']} días.",
                    status="ACTIVA"
                )
                generated_alerts.append(alert)

        for a in generated_alerts:
            self.db.add(a)

        self.db.commit()

        # Retornar lista
        alerts_db = self.db.query(Alert).filter(Alert.status == "ACTIVA").order_by(Alert.id.desc()).all()
        return [
            {
                "id": a.id,
                "product_id": a.product_id,
                "product_name": a.product.name if a.product else "Sistema",
                "product_sku": a.product.sku if a.product else "-",
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "status": a.status,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else None
            }
            for a in alerts_db
        ]

    def resolve_alert(self, alert_id: int) -> bool:
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return False
        alert.status = "RESUELTA"
        self.db.commit()
        return True
