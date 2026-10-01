from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.services.inventory_optimizer import InventoryOptimizer

router = APIRouter()

@router.get("/")
@router.get("", include_in_schema=False)
def get_recommendations(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    optimizer = InventoryOptimizer(db)
    try:
        return optimizer.generate_smart_recommendations()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/abc-summary")
def get_abc_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    optimizer = InventoryOptimizer(db)
    return optimizer.get_abc_summary_metrics()
