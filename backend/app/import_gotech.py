# Script to parse the OCR text from the 39 pages and load into DB
import re
import os
import json
from datetime import datetime
from app.core.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.inventory_movement import InventoryMovement, MovementType

def parse_and_load_data(raw_text_path: str):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    with open(raw_text_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by pages
    pages = re.split(r'==Start of OCR for page \d+==', content)
    
    current_product = None
    records = []
    
    # Let's inspect product headers and sales lines
    print(f"Loaded {len(pages)} pages.")

if __name__ == "__main__":
    pass
