from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InventoryMovementCreate(BaseModel):
    product_id: int
    type: str  # ENTRADA, SALIDA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, DEVOLUCION
    quantity: int
    unit_cost: Optional[float] = 0.0
    document_ref: Optional[str] = None
    reason: Optional[str] = None
    user_id: Optional[int] = None

class InventoryMovementResponse(BaseModel):
    id: int
    product_id: int
    type: str
    quantity: int
    previous_stock: int
    new_stock: int
    unit_cost: float
    total_value: float
    document_ref: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class KardexItem(BaseModel):
    id: int
    date: datetime
    type: str
    document_ref: Optional[str] = None
    reason: Optional[str] = None
    input_quantity: int = 0
    output_quantity: int = 0
    balance_quantity: int = 0
    unit_cost: float = 0.0
    total_value: float = 0.0
