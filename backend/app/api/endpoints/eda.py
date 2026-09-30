from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.ml.data_prep.preprocessor import DataPreprocessor

router = APIRouter()

@router.get("/eda-summary")
def get_eda_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    preprocessor = DataPreprocessor(db)
    return preprocessor.get_eda_summary()
