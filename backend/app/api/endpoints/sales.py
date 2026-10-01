from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse, ImportPreviewResponse, ImportConfirmRequest
from app.crud import sale as crud_sale
from app.services import importer

router = APIRouter()

@router.get("/", response_model=List[SaleResponse])
@router.get("", response_model=List[SaleResponse], include_in_schema=False)
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_sale.get_sales(db, skip=skip, limit=limit)

@router.post("/", response_model=SaleResponse)
@router.post("", response_model=SaleResponse, include_in_schema=False)
def create_sale(sale_in: SaleCreate, db: Session = Depends(get_db)):
    return crud_sale.create_sale(db, sale_in)

@router.post("/import-preview", response_model=ImportPreviewResponse)
async def preview_import(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Formato de archivo inválido. Solo se admiten archivos .csv y .xlsx")
    
    contents = await file.read()
    try:
        preview = importer.process_sales_file(contents, file.filename, db)
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando archivo: {str(e)}")

@router.post("/import-confirm")
def confirm_import(req: ImportConfirmRequest, db: Session = Depends(get_db)):
    try:
        res = importer.confirm_import(req.import_token, db)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/historical-summary")
def get_historical_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    from app.models.sale import Sale, SaleItem
    from sqlalchemy import func
    
    total_sales_count = db.query(func.count(Sale.id)).scalar() or 0
    total_revenue = db.query(func.sum(Sale.total)).scalar() or 0.0
    total_units = db.query(func.sum(SaleItem.quantity)).scalar() or 0
    
    return {
        "total_sales_transactions": total_sales_count,
        "total_revenue": round(total_revenue, 2),
        "total_units_sold": total_units,
        "is_ready_for_ml": total_sales_count >= 50
    }
