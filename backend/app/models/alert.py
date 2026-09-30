from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    alert_type = Column(String(50), nullable=False) # AGOTADO, STOCK_BAJO, REORDEN_ALCANZADO, SOBREINVENTARIO, QUIEBRE_INMINENTE, DEMANDA_CRECIENTE
    severity = Column(String(20), nullable=False, default="MEDIA") # CRITICA, ALTA, MEDIA, INFORMATIVA
    message = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="ACTIVA") # ACTIVA, RESUELTA, LEIDA
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
