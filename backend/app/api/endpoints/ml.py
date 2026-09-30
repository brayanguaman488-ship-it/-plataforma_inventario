from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.ml.trainer import MLTrainer
from app.models.ml_model import MLModelRecord

router = APIRouter()

@router.post("/train")
def train_models(db: Session = Depends(get_db)) -> Dict[str, Any]:
    trainer = MLTrainer(db)
    try:
        results = trainer.train_and_compare_models()
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models")
def get_models_history(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    records = db.query(MLModelRecord).order_by(MLModelRecord.training_date.desc()).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "algorithm": r.algorithm,
            "version": r.version,
            "mae": r.mae,
            "mse": r.mse,
            "rmse": r.rmse,
            "r2": r.r2,
            "status": r.status,
            "training_date": r.training_date.strftime("%Y-%m-%d %H:%M:%S") if r.training_date else None
        }
        for r in records
    ]

@router.get("/champion")
def get_champion_model(db: Session = Depends(get_db)) -> Dict[str, Any]:
    trainer = MLTrainer(db)
    return trainer.get_champion_metadata()
