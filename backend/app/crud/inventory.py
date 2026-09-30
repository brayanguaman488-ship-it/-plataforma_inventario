from sqlalchemy.orm import Session
from app.models.inventory_movement import InventoryMovement, MovementType
from app.models.product import Product
from app.schemas.inventory import InventoryMovementCreate, KardexItem
from fastapi import HTTPException
from typing import List

def register_movement(db: Session, movement_in: InventoryMovementCreate) -> InventoryMovement:
    product = db.query(Product).filter(Product.id == movement_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    previous_stock = product.current_stock
    qty = abs(movement_in.quantity)

    # Calcular nuevo stock según tipo de movimiento
    if movement_in.type in [MovementType.ENTRADA.value, MovementType.AJUSTE_POSITIVO.value, MovementType.DEVOLUCION.value]:
        new_stock = previous_stock + qty
    elif movement_in.type in [MovementType.SALIDA.value, MovementType.AJUSTE_NEGATIVO.value]:
        if previous_stock < qty and movement_in.type == MovementType.SALIDA.value:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente ({previous_stock} disponibles) para realizar la salida de {qty} unidades.")
        new_stock = previous_stock - qty
    else:
        raise HTTPException(status_code=400, detail="Tipo de movimiento inválido")

    # Actualizar stock actual en el producto
    product.current_stock = new_stock

    # Costo y valor
    unit_cost = movement_in.unit_cost if movement_in.unit_cost > 0 else product.purchase_price
    total_value = unit_cost * qty

    # Crear movimiento
    movement = InventoryMovement(
        product_id=product.id,
        type=movement_in.type,
        quantity=qty,
        previous_stock=previous_stock,
        new_stock=new_stock,
        unit_cost=unit_cost,
        total_value=total_value,
        document_ref=movement_in.document_ref,
        reason=movement_in.reason,
        user_id=movement_in.user_id
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement

def get_product_kardex(db: Session, product_id: int) -> List[KardexItem]:
    movements = db.query(InventoryMovement).filter(
        InventoryMovement.product_id == product_id
    ).order_by(InventoryMovement.created_at.asc()).all()

    kardex: List[KardexItem] = []
    for m in movements:
        is_input = m.type in [MovementType.ENTRADA.value, MovementType.AJUSTE_POSITIVO.value, MovementType.DEVOLUCION.value]
        kardex.append(KardexItem(
            id=m.id,
            date=m.created_at,
            type=m.type,
            document_ref=m.document_ref,
            reason=m.reason,
            input_quantity=m.quantity if is_input else 0,
            output_quantity=m.quantity if not is_input else 0,
            balance_quantity=m.new_stock,
            unit_cost=m.unit_cost,
            total_value=m.total_value
        ))
    return kardex
