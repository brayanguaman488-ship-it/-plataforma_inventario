from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class MLModelRecord(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False, default="v1.0")
    mae = Column(Float, nullable=False)
    mse = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    training_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="EVALUADO")  # MEJOR, EVALUADO, ARCHIVADO
    model_file_path = Column(String(255), nullable=True)
    hyperparameters = Column(Text, nullable=True)
    feature_names = Column(Text, nullable=True)
