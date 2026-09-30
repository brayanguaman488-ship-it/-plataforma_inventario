from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    brand = Column(String(100), index=True, nullable=False)   # Apple, Samsung, Xiaomi, etc.
    model = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    purchase_price = Column(Float, nullable=False, default=0.0)
    sale_price = Column(Float, nullable=False, default=0.0)

    current_stock = Column(Integer, nullable=False, default=0)
    minimum_stock = Column(Integer, nullable=False, default=5)
    maximum_stock = Column(Integer, nullable=False, default=100)
    safety_stock = Column(Integer, nullable=False, default=5)
    reorder_point = Column(Integer, nullable=False, default=10)

    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    movements = relationship("InventoryMovement", back_populates="product", cascade="all, delete-orphan")

    @property
    def status(self) -> str:
        if self.current_stock <= 0:
            return "Agotado"
        elif self.current_stock <= self.minimum_stock:
            return "Crítico"
        elif self.current_stock <= self.reorder_point:
            return "Stock bajo"
        elif self.current_stock >= self.maximum_stock:
            return "Sobreinventario"
        return "Disponible"
