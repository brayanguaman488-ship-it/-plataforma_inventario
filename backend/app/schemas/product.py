from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse
from app.schemas.supplier import SupplierResponse

class ProductBase(BaseModel):
    sku: str
    name: str
    brand: str
    model: str
    category_id: int
    supplier_id: Optional[int] = None
    purchase_price: float = 0.0
    sale_price: float = 0.0
    current_stock: int = 0
    minimum_stock: int = 5
    maximum_stock: int = 100
    safety_stock: int = 5
    reorder_point: int = 10
    active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    purchase_price: Optional[float] = None
    sale_price: Optional[float] = None
    minimum_stock: Optional[int] = None
    maximum_stock: Optional[int] = None
    safety_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    status: str
    created_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None
    supplier: Optional[SupplierResponse] = None

    class Config:
        from_attributes = True
