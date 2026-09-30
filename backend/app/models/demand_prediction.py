from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class DemandPrediction(Base):
    __tablename__ = "demand_predictions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    prediction_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    target_date = Column(DateTime(timezone=True), nullable=False)
    predicted_demand = Column(Float, nullable=False)
    model_name = Column(String(100), nullable=False, default="Random Forest")
    confidence_lower = Column(Float, nullable=True)
    confidence_upper = Column(Float, nullable=True)
    horizon_days = Column(Integer, nullable=False, default=30)
    trend = Column(String(50), nullable=True, default="ESTABLE")  # CRECIENTE, DECRECIENTE, ESTABLE
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
