from app.core.database import SessionLocal, engine, Base
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement, MovementType
from app.models.user import User

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Product).first():
        print("La base de datos ya contiene datos demo.")
        db.close()
        return

    # Categorías
    cat_smartphones = Category(name="Smartphones", description="Teléfonos inteligentes de gama alta, media y de entrada")
    cat_tablets = Category(name="Tablets", description="Tabletas electrónicas para productividad y entretenimiento")
    cat_audio = Category(name="Audio & Wearables", description="Audífonos inalámbricos y smartwatches")
    
    db.add_all([cat_smartphones, cat_tablets, cat_audio])
    db.commit()

    # Proveedores
    sup_apple = Supplier(name="Apple Direct Distribution", contact="Carlos Mendoza", phone="+52 55 1234 5678", email="sales@apple-dist.com", lead_time_days=10)
    sup_samsung = Supplier(name="Samsung Electronics Latam", contact="Laura Gomez", phone="+52 55 8765 4321", email="dist@samsung.com", lead_time_days=7)
    sup_global = Supplier(name="Global Mobile Supply Inc", contact="Alex Chen", phone="+1 305 987 6543", email="chen@globalmobile.com", lead_time_days=15)

    db.add_all([sup_apple, sup_samsung, sup_global])
    db.commit()

    # Productos
    products = [
        Product(sku="APP-IPH16P-256", name="iPhone 16 Pro 256GB Titanium", brand="Apple", model="iPhone 16 Pro", category_id=cat_smartphones.id, supplier_id=sup_apple.id, purchase_price=950.0, sale_price=1199.0, current_stock=8, minimum_stock=5, maximum_stock=30, safety_stock=5, reorder_point=12),
        Product(sku="SAM-S24U-512", name="Samsung Galaxy S24 Ultra 512GB", brand="Samsung", model="Galaxy S24 Ultra", category_id=cat_smartphones.id, supplier_id=sup_samsung.id, purchase_price=980.0, sale_price=1249.0, current_stock=4, minimum_stock=5, maximum_stock=25, safety_stock=5, reorder_point=10),
        Product(sku="XIA-14P-256", name="Xiaomi 14 Pro 256GB Black", brand="Xiaomi", model="Xiaomi 14 Pro", category_id=cat_smartphones.id, supplier_id=sup_global.id, purchase_price=650.0, sale_price=849.0, current_stock=18, minimum_stock=6, maximum_stock=40, safety_stock=6, reorder_point=15),
        Product(sku="HON-M6P-512", name="Honor Magic 6 Pro 512GB Green", brand="Honor", model="Magic 6 Pro", category_id=cat_smartphones.id, supplier_id=sup_global.id, purchase_price=720.0, sale_price=920.0, current_stock=0, minimum_stock=4, maximum_stock=20, safety_stock=4, reorder_point=8),
        Product(sku="INF-GT20P-256", name="Infinix GT 20 Pro 256GB Mecha", brand="Infinix", model="GT 20 Pro", category_id=cat_smartphones.id, supplier_id=sup_global.id, purchase_price=240.0, sale_price=329.0, current_stock=35, minimum_stock=10, maximum_stock=30, safety_stock=8, reorder_point=18),
        Product(sku="TEC-CAM30-256", name="Tecno Camon 30 Premier 512GB", brand="Tecno", model="Camon 30", category_id=cat_smartphones.id, supplier_id=sup_global.id, purchase_price=290.0, sale_price=399.0, current_stock=14, minimum_stock=8, maximum_stock=35, safety_stock=6, reorder_point=14),
        Product(sku="SAM-TABS9-128", name="Samsung Galaxy Tab S9 128GB", brand="Samsung", model="Galaxy Tab S9", category_id=cat_tablets.id, supplier_id=sup_samsung.id, purchase_price=550.0, sale_price=699.0, current_stock=6, minimum_stock=3, maximum_stock=15, safety_stock=3, reorder_point=6),
    ]

    db.add_all(products)
    db.commit()

    # Registrar movimientos iniciales en el Kardex para los productos
    for p in products:
        m = InventoryMovement(
            product_id=p.id,
            type=MovementType.ENTRADA.value,
            quantity=p.current_stock if p.current_stock > 0 else 10,
            previous_stock=0,
            new_stock=p.current_stock if p.current_stock > 0 else 10,
            unit_cost=p.purchase_price,
            total_value=p.purchase_price * (p.current_stock if p.current_stock > 0 else 10),
            document_ref="FAC-INICIAL-2026",
            reason="Carga de inventario inicial"
        )
        db.add(m)
    db.commit()

    print("[OK] Datos Demo cargados exitosamente (Categorias, Proveedores, Productos y Kardex inicial).")
    db.close()

if __name__ == "__main__":
    seed_data()
