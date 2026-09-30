from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
import io
import csv
from datetime import datetime
from app.core.database import get_db
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.services.inventory_optimizer import InventoryOptimizer

router = APIRouter()

@router.get("/export-csv")
def export_csv(
    report_type: str = Query("inventory", enum=["inventory", "sales", "recommendations"]),
    db: Session = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_MINIMAL)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M")

    if report_type == "inventory":
        writer.writerow(["ID", "SKU", "Nombre", "Marca", "Modelo", "Precio Compra", "Precio Venta", "Stock Actual", "Stock Min", "Stock Max", "Stock Seguridad", "Pto Reorden", "Estado"])
        products = db.query(Product).all()
        for p in products:
            writer.writerow([
                p.id, p.sku, p.name, p.brand, p.model,
                p.purchase_price, p.sale_price, p.current_stock,
                p.minimum_stock, p.maximum_stock, p.safety_stock, p.reorder_point,
                p.status
            ])
        filename = f"reporte_inventario_{timestamp}.csv"

    elif report_type == "sales":
        writer.writerow(["ID Venta", "Fecha", "Cliente", "Canal", "SKU", "Producto", "Cantidad", "Precio Unitario", "Subtotal", "Total Venta"])
        sales = db.query(Sale).order_by(Sale.date.desc()).all()
        for s in sales:
            for item in s.items:
                writer.writerow([
                    s.id, s.date.strftime("%Y-%m-%d %H:%M"), s.customer_name, s.channel,
                    item.product.sku if item.product else "-",
                    item.product.name if item.product else "-",
                    item.quantity, item.unit_price, item.subtotal, s.total
                ])
        filename = f"reporte_ventas_{timestamp}.csv"

    else: # recommendations
        writer.writerow(["SKU", "Producto", "Marca", "Clasif ABC", "Stock Actual", "Demanda Prevista 30d", "Lote EOQ", "Diagnostico", "Prioridad", "Cantidad a Comprar", "Costo Estimado"])
        optimizer = InventoryOptimizer(db)
        recs = optimizer.generate_smart_recommendations()
        for r in recs:
            writer.writerow([
                r["sku"], r["name"], r["brand"], r["abc_class"],
                r["current_stock"], r["predicted_demand_30d"], r["eoq_quantity"],
                r["recommendation_type"], r["priority"], r["recommended_quantity"],
                r["estimated_purchase_cost"]
            ])
        filename = f"reporte_recomendaciones_ia_{timestamp}.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
