from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class MovementType(str, enum.Enum):
    ENTRADA = "ENTRADA"           # Compra, ingreso de mercadería
    SALIDA = "SALIDA"             # Venta, consumo interno
    AJUSTE_POSITIVO = "AJUSTE_POSITIVO" # Corrección de inventario (+)
    AJUSTE_NEGATIVO = "AJUSTE_NEGATIVO" # Merma, daño (-)
    DEVOLUCION = "DEVOLUCION"     # Devolución de cliente

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(30), nullable=False)  # MovementType
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)

    unit_cost = Column(Float, nullable=False, default=0.0)
    total_value = Column(Float, nullable=False, default=0.0)
    document_ref = Column(String(100), nullable=True) # Factura, Guía, Boleta
    reason = Column(String(200), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="movements")
