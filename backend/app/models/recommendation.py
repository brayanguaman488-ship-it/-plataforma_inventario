from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    recommendation_type = Column(String(50), nullable=False) # COMPRAR, COMPRA_URGENTE, MANTENER, SOBREINVENTARIO
    current_stock = Column(Integer, nullable=False)
    predicted_demand = Column(Integer, nullable=False)
    recommended_quantity = Column(Integer, nullable=False, default=0)
    explanation = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False, default="MEDIA") # CRITICA, ALTA, MEDIA, BAJA
    lead_time_days = Column(Integer, nullable=False, default=7)
    eoq_quantity = Column(Integer, nullable=True)
    abc_class = Column(String(5), nullable=True, default="A") # A, B, C
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
