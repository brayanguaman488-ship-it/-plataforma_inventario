import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement
from app.models.user import User
from app.models.sale import Sale, SaleItem
from app.models.demand_prediction import DemandPrediction
from app.models.recommendation import Recommendation
from app.ml.predictor import DemandPredictor

class InventoryOptimizer:
    """
    Motor de Optimización Logística y Recomendaciones Inteligentes de Inventario.
    Integra: Predicción ML + EOQ + Clasificación ABC + Puntos de Reorden + Explicabilidad.
    """

    def __init__(self, db: Session):
        Base.metadata.create_all(bind=engine)
        self.db = db
        self.predictor = DemandPredictor(db)

    def calculate_abc_classification(self) -> Dict[int, Dict[str, Any]]:
        """
        Calcula la clasificación ABC de Pareto sobre los productos según sus ingresos históricos.
        A: Top ~80% de ingresos (Mayor impacto)
        B: Siguiente ~15% de ingresos (Impacto medio)
        C: Último ~5% de ingresos (Menor impacto)
        """
        sales_by_prod = self.db.query(
            Product.id,
            Product.sku,
            Product.name,
            func.coalesce(func.sum(SaleItem.subtotal), 0.0).label("total_revenue")
        ).outerjoin(SaleItem, SaleItem.product_id == Product.id)\
         .group_by(Product.id, Product.sku, Product.name)\
         .order_by(func.sum(SaleItem.subtotal).desc())\
         .all()

        if not sales_by_prod:
            return {}

        total_system_revenue = sum(float(r.total_revenue) for r in sales_by_prod)
        if total_system_revenue == 0:
            return {r.id: {"abc_class": "B", "revenue_share_pct": 0.0} for r in sales_by_prod}

        cumulative_revenue = 0.0
        abc_map: Dict[int, Dict[str, Any]] = {}

        for r in sales_by_prod:
            rev = float(r.total_revenue)
            cumulative_revenue += rev
            cum_pct = (cumulative_revenue / total_system_revenue) * 100
            share_pct = round((rev / total_system_revenue) * 100, 2)

            if cum_pct <= 80.0:
                abc_class = "A"
            elif cum_pct <= 95.0:
                abc_class = "B"
            else:
                abc_class = "C"

            abc_map[r.id] = {
                "abc_class": abc_class,
                "revenue": round(rev, 2),
                "revenue_share_pct": share_pct,
                "cumulative_pct": round(cum_pct, 2)
            }

        return abc_map

    def generate_smart_recommendations(self) -> List[Dict[str, Any]]:
        """
        Genera recomendaciones de abastecimiento individualizadas para cada producto
        combinando inferencia de Machine Learning, EOQ, parámetros logísticos y explicabilidad.
        """
        products = self.db.query(Product).filter(Product.active == True).all()
        abc_map = self.calculate_abc_classification()

        recommendations_list: List[Dict[str, Any]] = []

        # Parámetros estándar de costos logísticos para EOQ
        ORDERING_COST_S = 45.0      # Costo fijo por emitir una orden de compra ($)
        HOLDING_COST_RATE_H = 0.15   # 15% del costo del producto como costo de almacenamiento anual

        for p in products:
            lead_time = p.supplier.lead_time_days if p.supplier and p.supplier.lead_time_days else 7

            # 1. Obtener Pronóstico de Demanda a 30 días del Modelo Campeón ML
            try:
                forecast = self.predictor.forecast_product_demand(product_id=p.id, horizon_days=30)
                predicted_demand_30d = forecast["total_predicted_demand"]
                daily_avg_demand = forecast["daily_average_demand"]
                trend_label = forecast["trend_label"]
                trend_pct = forecast["trend_percentage"]
            except Exception:
                predicted_demand_30d = max(5, int(p.reorder_point * 1.5))
                daily_avg_demand = round(predicted_demand_30d / 30.0, 2)
                trend_label = "ESTABLE"
                trend_pct = 0.0

            # 2. Cálculo del Lote Económico de Pedido (EOQ)
            annual_demand_D = max(1.0, daily_avg_demand * 365.0)
            holding_cost_unit = max(1.0, p.purchase_price * HOLDING_COST_RATE_H)
            
            # Fórmula de Wilson / Harris EOQ: sqrt((2 * D * S) / H)
            eoq_calc = int(math.ceil(math.sqrt((2.0 * annual_demand_D * ORDERING_COST_S) / holding_cost_unit)))
            eoq_quantity = max(1, min(eoq_calc, 100)) # Limitar a rangos razonables

            # 3. Cálculo de Días de Cobertura de Inventario Actual
            if daily_avg_demand > 0:
                days_of_inventory = round(p.current_stock / daily_avg_demand, 1)
            else:
                days_of_inventory = 999.0

            # 4. Clasificación ABC del producto
            abc_info = abc_map.get(p.id, {"abc_class": "B", "revenue_share_pct": 10.0})
            abc_class = abc_info["abc_class"]

            # 5. Árbol de Decisión Logística para la Recomendación
            recommended_quantity = 0
            
            if p.current_stock <= 0 or (p.current_stock <= p.minimum_stock and days_of_inventory <= lead_time):
                rec_type = "COMPRA_URGENTE"
                priority = "CRITICA"
                # Cantidad sugerida: cubrir demanda + stock seguridad + margen EOQ
                deficit = (predicted_demand_30d + p.safety_stock) - p.current_stock
                recommended_quantity = max(eoq_quantity, deficit)
                explanation = (
                    f"Existe un ALTO RIESGO DE DESABASTECIMIENTO. El stock actual es de {p.current_stock} unidades "
                    f"(cobertura para solo {days_of_inventory} días), mientras que el tiempo de reposición del proveedor "
                    f"es de {lead_time} días. El modelo ML proyecta una demanda de {predicted_demand_30d} unidades con tendencia {trend_label} "
                    f"({trend_pct:+.1f}%). Se recomienda emitir orden de compra inmediata por {recommended_quantity} unidades "
                    f"(EOQ calculado: {eoq_quantity} uds) para reponer existencias y asegurar el stock de seguridad de {p.safety_stock} uds."
                )

            elif p.current_stock <= p.reorder_point:
                rec_type = "COMPRAR"
                priority = "ALTA" if abc_class == "A" else "MEDIA"
                deficit = (predicted_demand_30d + p.safety_stock) - p.current_stock
                recommended_quantity = max(eoq_quantity, deficit)
                explanation = (
                    f"El producto ha alcanzado su Punto de Reorden ({p.reorder_point} unidades). "
                    f"Con un inventario actual de {p.current_stock} unidades y una demanda estimada para los próximos 30 días de "
                    f"{predicted_demand_30d} unidades, se recomienda reabastecer {recommended_quantity} unidades. "
                    f"Clasificación ABC: Tipo {abc_class} (Alto impacto en facturación). Lote óptimo EOQ: {eoq_quantity} uds."
                )

            elif p.current_stock > (predicted_demand_30d * 2.5) and p.current_stock > p.maximum_stock:
                rec_type = "SOBREINVENTARIO"
                priority = "BAJA"
                recommended_quantity = 0
                capital_inmovilizado = round(p.current_stock * p.purchase_price, 2)
                explanation = (
                    f"Se detecta SOBREINVENTARIO. Las existencias actuales ({p.current_stock} unidades con un valor de ${capital_inmovilizado}) "
                    f"superan con creces la demanda estimada a 30 días ({predicted_demand_30d} unidades). "
                    f"La cobertura actual es de {days_of_inventory} días. No se debe realizar ninguna orden de compra para evitar costos de almacenamiento "
                    f"y riesgo de obsolescencia tecnológica."
                )

            else:
                rec_type = "MANTENER"
                priority = "BAJA"
                recommended_quantity = 0
                explanation = (
                    f"El inventario actual ({p.current_stock} unidades) se encuentra en niveles equilibrados y cubre satisfactoriamente "
                    f"la demanda proyectada de {predicted_demand_30d} unidades para los próximos 30 días. Cobertura estimada: {days_of_inventory} días."
                )

            # Persistir o actualizar en MySQL
            rec_db = Recommendation(
                product_id=p.id,
                recommendation_type=rec_type,
                current_stock=p.current_stock,
                predicted_demand=predicted_demand_30d,
                recommended_quantity=recommended_quantity,
                explanation=explanation,
                priority=priority,
                lead_time_days=lead_time,
                eoq_quantity=eoq_quantity,
                abc_class=abc_class
            )
            self.db.add(rec_db)

            recommendations_list.append({
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "brand": p.brand,
                "purchase_price": p.purchase_price,
                "current_stock": p.current_stock,
                "safety_stock": p.safety_stock,
                "reorder_point": p.reorder_point,
                "lead_time_days": lead_time,
                "predicted_demand_30d": predicted_demand_30d,
                "days_of_inventory": days_of_inventory,
                "abc_class": abc_class,
                "eoq_quantity": eoq_quantity,
                "recommendation_type": rec_type,
                "priority": priority,
                "recommended_quantity": recommended_quantity,
                "estimated_purchase_cost": round(recommended_quantity * p.purchase_price, 2),
                "explanation": explanation
            })

        self.db.commit()
        return recommendations_list

    def get_abc_summary_metrics(self) -> Dict[str, Any]:
        """
        Retorna métricas consolidadas de la Ley de Pareto ABC para visualización en el dashboard.
        """
        abc_map = self.calculate_abc_classification()
        if not abc_map:
            return {"total_products": 0, "class_a": 0, "class_b": 0, "class_c": 0}

        counts = {"A": 0, "B": 0, "C": 0}
        revenue_by_class = {"A": 0.0, "B": 0.0, "C": 0.0}

        for p_id, data in abc_map.items():
            cls = data["abc_class"]
            counts[cls] += 1
            revenue_by_class[cls] += data["revenue"]

        return {
            "total_products_classified": len(abc_map),
            "distribution": [
                {"class": "Clase A (Estratégico - 80%)", "count": counts["A"], "revenue": round(revenue_by_class["A"], 2), "color": "#2563eb"},
                {"class": "Clase B (Intermedio - 15%)", "count": counts["B"], "revenue": round(revenue_by_class["B"], 2), "color": "#8b5cf6"},
                {"class": "Clase C (Bajo Impacto - 5%)", "count": counts["C"], "revenue": round(revenue_by_class["C"], 2), "color": "#94a3b8"}
            ]
        }
