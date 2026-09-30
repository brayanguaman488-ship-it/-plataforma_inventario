from pydantic import BaseModel
from typing import List, Optional

class InvoiceExtractedItem(BaseModel):
    description: str
    sku: Optional[str] = None
    matched_product_id: Optional[int] = None
    matched_product_name: Optional[str] = None
    is_new_product: bool = False
    suggested_category: str = "Dispositivos Móviles"
    quantity: int = 1
    unit_cost: float = 0.0
    subtotal: float = 0.0
    suggested_sale_price: float = 0.0

class InvoiceAIPreviewResponse(BaseModel):
    filename: str
    invoice_number: str
    supplier_name: str
    supplier_tax_id: str
    date: str
    total_amount: float
    total_units: int
    items_count: int
    new_products_count: int
    items: List[InvoiceExtractedItem]
    import_token: str

class InvoiceAIConfirmRequest(BaseModel):
    import_token: str
    document_ref: Optional[str] = None
    supplier_name: Optional[str] = None
    items: Optional[List[InvoiceExtractedItem]] = None

class InvoiceAIConfirmResponse(BaseModel):
    success: bool
    message: str
    movements_created: int
    new_products_created: int
    total_units_added: int
    total_value_added: float
