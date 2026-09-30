from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.ml.predictor import DemandPredictor

router = APIRouter()

@router.get("/forecast")
def get_product_forecast(
    product_id: int = Query(..., description="ID del producto"),
    horizon_days: int = Query(30, enum=[7, 15, 30, 60, 90], description="Horizonte de predicción en días"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    predictor = DemandPredictor(db)
    try:
        result = predictor.forecast_product_demand(product_id=product_id, horizon_days=horizon_days)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
