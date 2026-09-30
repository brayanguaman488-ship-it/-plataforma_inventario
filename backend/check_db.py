import sys
import os

try:
    from app.core.database import engine, SessionLocal, Base
    from app.models.category import Category
    from app.models.supplier import Supplier
    from app.models.inventory_movement import InventoryMovement
    from app.models.product import Product
    from app.models.sale import Sale, SaleItem
    from app.models.user import User
    from app.models.ml_model import MLModelRecord
    from app.models.demand_prediction import DemandPrediction
    from app.models.alert import Alert
    from app.models.recommendation import Recommendation

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    products_count = db.query(Product).count()
    sales_count = db.query(Sale).count()
    items_count = db.query(SaleItem).count()
    categories_count = db.query(Category).count()
    suppliers_count = db.query(Supplier).count()

    print(f"DATABASE OK:")
    print(f"Categories: {categories_count}")
    print(f"Suppliers: {suppliers_count}")
    print(f"Products: {products_count}")
    print(f"Sales: {sales_count}")
    print(f"SaleItems: {items_count}")
    db.close()
except Exception as e:
    print(f"DATABASE ERROR: {e}")
