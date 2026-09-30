import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.inventory_movement import InventoryMovement, MovementType
from app.models.demand_prediction import DemandPrediction
from app.models.alert import Alert
from app.models.recommendation import Recommendation
from app.models.ml_model import MLModelRecord

from app.gotech_data_part1 import DATA_PART_1
from app.gotech_data_part2 import DATA_PART_2
from app.gotech_data_part3 import DATA_PART_3
from app.gotech_data_part4 import DATA_PART_4
from app.gotech_data_part5 import DATA_PART_5
from app.gotech_data_part6 import DATA_PART_6
from app.gotech_data_part7 import DATA_PART_7
from app.gotech_data_part8 import DATA_PART_8
from app.gotech_data_part9 import DATA_PART_9
from app.gotech_data_part10 import DATA_PART_10

from app.ml.trainer import MLTrainer
from app.services.inventory_optimizer import InventoryOptimizer
from app.services.alert_manager import AlertManager

def parse_date(d_str: str) -> datetime:
    parts = d_str.strip().split('/')
    day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
    return datetime(year, month, day, 12, 0, 0)

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("=================================================================")
    print(" CARGANDO BASE DE DATOS REAL GO TECH (Desde 01/01/2025 al 27/08/2026)")
    print("=================================================================")

    # 1. Categorías
    cat_map = {}
    for cat_name, desc in [
        ("Smartphones", "Teléfonos inteligentes de alta gama, media y open box"),
        ("Tablets", "Tablets y iPads para uso profesional y personal"),
        ("Audio & Wearables", "Audífonos AirPods y Apple Watch"),
        ("Laptops & Computadoras", "Equipos portátiles MacBook y PCs")
    ]:
        cat = db.query(Category).filter(Category.name == cat_name).first()
        if not cat:
            cat = Category(name=cat_name, description=desc)
            db.add(cat)
            db.flush()
        cat_map[cat_name] = cat.id

    # 2. Proveedores
    sup_map = {}
    for sup_name, contact, phone, email, lead_time in [
        ("Apple Import Direct", "Carlos Mendoza", "+1 305 123 4567", "imports@appledirect.com", 7),
        ("Samsung Latam Logistics", "Laura Gomez", "+593 99 876 5432", "logistica@samsunglatam.com", 6),
        ("Global Tech Distributors", "Alex Chen", "+1 786 555 0192", "ventas@globaltechdist.com", 10)
    ]:
        sup = db.query(Supplier).filter(Supplier.name == sup_name).first()
        if not sup:
            sup = Supplier(name=sup_name, contact=contact, phone=phone, email=email, lead_time_days=lead_time)
            db.add(sup)
            db.flush()
        sup_map[sup_name] = sup.id

    # 3. Limpiar transacciones y estados anteriores para tener datos 100% limpios
    db.query(SaleItem).delete()
    db.query(Sale).delete()
    db.query(InventoryMovement).delete()
    db.query(DemandPrediction).delete()
    db.query(Alert).delete()
    db.query(Recommendation).delete()
    db.commit()

    all_data = (
        DATA_PART_1 + DATA_PART_2 + DATA_PART_3 + DATA_PART_4 + DATA_PART_5 +
        DATA_PART_6 + DATA_PART_7 + DATA_PART_8 + DATA_PART_9 + DATA_PART_10
    )

    print(f"Total productos en catálogo GO TECH: {len(all_data)}")

    total_sales_created = 0
    total_items_created = 0
    total_revenue = 0.0

    for item in all_data:
        sku = item["sku"]
        name = item["name"]
        brand = item["brand"]
        model = item["model"]
        cat_id = cat_map.get(item.get("category", "Smartphones"), cat_map["Smartphones"])
        sup_id = sup_map["Apple Import Direct"] if brand == "Apple" else sup_map["Samsung Latam Logistics"]
        cost = float(item["cost"])
        price = float(item["price"])
        stock = int(item.get("stock", 0))

        prod = db.query(Product).filter(Product.sku == sku).first()
        if not prod:
            prod = Product(
                sku=sku,
                name=name,
                brand=brand,
                model=model,
                category_id=cat_id,
                supplier_id=sup_id,
                purchase_price=cost,
                sale_price=price,
                current_stock=stock,
                minimum_stock=max(2, int(stock * 0.5)),
                maximum_stock=max(20, stock * 4),
                safety_stock=max(2, int(stock * 0.3)),
                reorder_point=max(4, int(stock * 0.8)),
                active=True
            )
            db.add(prod)
            db.flush()
        else:
            prod.name = name
            prod.brand = brand
            prod.model = model
            prod.purchase_price = cost
            prod.sale_price = price
            prod.current_stock = stock
            db.flush()

        if stock > 0:
            m = InventoryMovement(
                product_id=prod.id,
                type=MovementType.ENTRADA.value,
                quantity=stock,
                previous_stock=0,
                new_stock=stock,
                unit_cost=cost,
                total_value=cost * stock,
                document_ref="INV-INICIAL-GOTECH",
                reason="Inventario inicial auditado"
            )
            db.add(m)

        for sale_row in item["sales"]:
            date_str, customer, doc_num, qty, cost_doc, subtotal, utilid = sale_row
            s_date = parse_date(date_str)

            sale = Sale(
                date=s_date,
                total=float(subtotal),
                customer_name=customer,
                channel="Distribuidor Mayorista" if qty >= 3 else "Tienda Física"
            )
            db.add(sale)
            db.flush()

            s_item = SaleItem(
                sale_id=sale.id,
                product_id=prod.id,
                quantity=int(qty),
                unit_price=round(float(subtotal) / max(1, qty), 2),
                subtotal=float(subtotal)
            )
            db.add(s_item)

            total_sales_created += 1
            total_items_created += int(qty)
            total_revenue += float(subtotal)

    db.commit()
    print(f"\n[OK] Datos cargados con éxito en la base de datos:")
    print(f" - Transacciones de venta (Notas): {total_sales_created}")
    print(f" - Unidades físicas vendidas: {total_items_created}")
    print(f" - Facturación total acumulada: ${total_revenue:,.2f} USD")

    print("\n=================================================================")
    print(" INICIANDO ENTRENAMIENTO Y COMPETENCIA DE MODELOS MACHINE LEARNING")
    print("=================================================================")
    trainer = MLTrainer(db)
    train_results = trainer.train_and_compare_models()

    print(f"\n[OK] Entrenamiento completado con éxito!")
    print(f"Modelo Campeón Seleccionado: {train_results['champion_model']}")
    print(f"R² Score del Campeón: {train_results['champion_r2_score']}")
    print("\nTabla de Rendimiento (Leaderboard):")
    for m in train_results['leaderboard']:
        print(f" - {m['algorithm']:<20} | R²: {m['r2']:>7.4f} | RMSE: {m['rmse']:>7.4f} | MAE: {m['mae']:>7.4f}")

    print("\n=================================================================")
    print(" GENERANDO PRONÓSTICOS DE DEMANDA, RECOMENDACIONES Y ALERTAS")
    print("=================================================================")
    alert_mgr = AlertManager(db)
    alerts = alert_mgr.synchronize_system_alerts()
    print(f"[OK] Alertas operacionales generadas: {len(alerts)}")

    db.close()
    print("\n¡PROCESO COMPLETADO EXITOSAMENTE!")

if __name__ == "__main__":
    main()
