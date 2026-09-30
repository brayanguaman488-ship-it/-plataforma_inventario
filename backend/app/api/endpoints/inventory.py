from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.inventory import InventoryMovementCreate, InventoryMovementResponse, KardexItem
from app.schemas.invoice_ai import (
    InvoiceAIPreviewResponse,
    InvoiceAIConfirmRequest,
    InvoiceAIConfirmResponse
)
from app.crud import inventory as crud_inventory
from app.services import invoice_ai_service

router = APIRouter()

@router.post("/movements", response_model=InventoryMovementResponse)
def create_movement(movement_in: InventoryMovementCreate, db: Session = Depends(get_db)):
    return crud_inventory.register_movement(db, movement_in)

@router.get("/kardex/{product_id}", response_model=List[KardexItem])
def read_kardex(product_id: int, db: Session = Depends(get_db)):
    return crud_inventory.get_product_kardex(db, product_id)

@router.post("/upload-invoice-ai", response_model=InvoiceAIPreviewResponse)
async def upload_invoice_ai(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "factura.pdf"
    contents = await file.read()
    
    try:
        if filename.lower().endswith('.pdf'):
            return invoice_ai_service.process_pdf_invoice(contents, filename, db)
        elif filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            return invoice_ai_service.process_table_invoice(contents, filename, db)
        else:
            # Fallback para archivos de texto o formato genérico
            try:
                return invoice_ai_service.process_pdf_invoice(contents, filename, db)
            except:
                return invoice_ai_service.get_demo_invoice_preview(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analizando factura con IA: {str(e)}")

@router.get("/demo-invoice-ai", response_model=InvoiceAIPreviewResponse)
def get_demo_invoice(db: Session = Depends(get_db)):
    try:
        return invoice_ai_service.get_demo_invoice_preview(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando factura demo: {str(e)}")

@router.post("/confirm-invoice-ai", response_model=InvoiceAIConfirmResponse)
def confirm_invoice_ai(req: InvoiceAIConfirmRequest, db: Session = Depends(get_db)):
    try:
        return invoice_ai_service.confirm_invoice_import(
            import_token=req.import_token,
            custom_items=req.items,
            document_ref=req.document_ref,
            supplier_name=req.supplier_name,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error confirmando ingreso al inventario: {str(e)}")
