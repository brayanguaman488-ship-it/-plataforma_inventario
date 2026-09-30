from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Optional[float] = None

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    date: Optional[datetime] = None
    customer_name: Optional[str] = "Cliente Mostrador"
    channel: Optional[str] = "Tienda Física"
    items: List[SaleItemCreate]

class SaleResponse(BaseModel):
    id: int
    date: datetime
    total: float
    customer_name: Optional[str] = None
    channel: Optional[str] = None
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True

class ImportRowError(BaseModel):
    row_number: int
    sku: Optional[str] = None
    error: str

class ImportPreviewResponse(BaseModel):
    filename: str
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    errors: List[ImportRowError] = []
    preview_data: List[dict] = []
    import_token: str

class ImportConfirmRequest(BaseModel):
    import_token: str
