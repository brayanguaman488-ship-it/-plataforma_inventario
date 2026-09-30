from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.services.alert_manager import AlertManager

router = APIRouter()

@router.get("/")
def get_alerts(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    manager = AlertManager(db)
    return manager.synchronize_system_alerts()

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    manager = AlertManager(db)
    success = manager.resolve_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return {"status": "ok", "message": "Alerta marcada como resuelta"}
