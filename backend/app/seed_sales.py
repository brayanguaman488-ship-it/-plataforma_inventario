import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.inventory_movement import InventoryMovement, MovementType
from app.models.user import User

def generate_historical_sales(days_back: int = 365):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing_sales_count = db.query(Sale).count()
    if existing_sales_count >= 50:
        print(f"El dataset historico ya contiene {existing_sales_count} ventas registradas.")
        db.close()
        return

    products = db.query(Product).all()
    if not products:
        print("Error: No hay productos en la base de datos. Ejecuta primero seed.py.")
        db.close()
        return

    channels = ["Tienda Fisica", "Online (E-Commerce)", "Distribuidor Mayorista"]
    customers = [
        "TechStore Central", "Distribuidora Movil Norte", "Retailer Express",
        "Juan Perez", "Maria Rodriguez", "Carlos Sanchez", "Smartphones & Co",
        "Digital Plaza", "Inversiones Gadget", "Cliente Mostrador"
    ]

    start_date = datetime.now() - timedelta(days=days_back)
    current_date = start_date

    sales_created = 0
    items_created = 0

    print(f"Iniciando generacion de datos historicos desde {start_date.strftime('%Y-%m-%d')}...")

    # Factores de estacionalidad y peso por marca
    brand_weights = {
        "Apple": 1.4,     # Mayor demanda, mayor precio
        "Samsung": 1.3,
        "Xiaomi": 1.6,    # Alta rotación
        "Honor": 1.1,
        "Infinix": 1.5,   # Gama media-baja alta rotación
        "Tecno": 1.2
    }

    while current_date <= datetime.now():
        day_of_week = current_date.weekday() # 0 = Lunes, 6 = Domingo
        month = current_date.month

        # Más ventas los fines de semana (Viernes, Sábado) y en Noviembre/Diciembre
        base_transactions = random.randint(1, 4)
        if day_of_week in [4, 5]: # Viernes / Sábado
            base_transactions += random.randint(1, 3)
        if month in [11, 12]: # Black Friday / Navidad
            base_transactions += random.randint(2, 5)

        for _ in range(base_transactions):
            channel = random.choice(channels)
            customer = random.choice(customers)

            # Seleccionar de 1 a 3 productos distintos por ticket de venta
            num_products = random.choices([1, 2, 3], weights=[0.7, 0.25, 0.05])[0]
            selected_prods = random.sample(products, min(num_products, len(products)))

            sale_time = current_date.replace(
                hour=random.randint(9, 20),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )

            sale = Sale(
                date=sale_time,
                total=0.0,
                customer_name=customer,
                channel=channel
            )
            db.add(sale)
            db.flush()

            sale_total = 0.0

            for p in selected_prods:
                weight = brand_weights.get(p.brand, 1.0)
                # Cantidad comprada: mayoristas compran más
                if channel == "Distribuidor Mayorista":
                    qty = random.randint(3, 8)
                else:
                    qty = random.choices([1, 2, 3], weights=[0.8, 0.15, 0.05])[0]

                # Pequeña variación promocional en el precio de venta (descuento 0% a 8%)
                discount = random.choice([0.0, 0.0, 0.03, 0.05, 0.08])
                unit_price = round(p.sale_price * (1.0 - discount), 2)
                subtotal = unit_price * qty
                sale_total += subtotal

                item = SaleItem(
                    sale_id=sale.id,
                    product_id=p.id,
                    quantity=qty,
                    unit_price=unit_price,
                    subtotal=subtotal
                )
                db.add(item)
                items_created += 1

            sale.total = round(sale_total, 2)
            sales_created += 1

        current_date += timedelta(days=1)

    db.commit()
    print(f"[OK] Generacion completada: {sales_created} transacciones de venta y {items_created} items generados exitosamente.")
    db.close()

if __name__ == "__main__":
    generate_historical_sales(days_back=365)
