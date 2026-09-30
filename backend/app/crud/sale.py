from sqlalchemy.orm import Session
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement, MovementType
from app.schemas.sale import SaleCreate
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime

def create_sale(db: Session, sale_in: SaleCreate, user_id: Optional[int] = None) -> Sale:
    if not sale_in.items:
        raise HTTPException(status_code=400, detail="La venta debe incluir al menos un producto")

    sale_date = sale_in.date or datetime.now()
    sale = Sale(
        date=sale_date,
        customer_name=sale_in.customer_name,
        channel=sale_in.channel,
        user_id=user_id,
        total=0.0
    )
    db.add(sale)
    db.flush()

    total_amount = 0.0

    for item in sale_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto ID {item.product_id} no encontrado")

        if product.current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {product.name} (SKU: {product.sku}). Disponibles: {product.current_stock}, Solicitados: {item.quantity}"
            )

        unit_price = item.unit_price if (item.unit_price is not None and item.unit_price > 0) else product.sale_price
        subtotal = unit_price * item.quantity
        total_amount += subtotal

        # Crear detalle de venta
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=subtotal
        )
        db.add(sale_item)

        # Actualizar stock del producto
        prev_stock = product.current_stock
        product.current_stock = prev_stock - item.quantity

        # Registrar movimiento de salida en Kardex
        movement = InventoryMovement(
            product_id=product.id,
            type=MovementType.SALIDA.value,
            quantity=item.quantity,
            previous_stock=prev_stock,
            new_stock=product.current_stock,
            unit_cost=product.purchase_price,
            total_value=product.purchase_price * item.quantity,
            document_ref=f"VENTA-{sale.id}",
            reason=f"Venta a {sale.customer_name or 'Cliente'}",
            user_id=user_id,
            created_at=sale_date
        )
        db.add(movement)

    sale.total = total_amount
    db.commit()
    db.refresh(sale)
    return sale

def get_sales(db: Session, skip: int = 0, limit: int = 100) -> List[Sale]:
    return db.query(Sale).order_by(Sale.date.desc()).offset(skip).limit(limit).all()
