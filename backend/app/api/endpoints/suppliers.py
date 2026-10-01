from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierResponse

router = APIRouter()

@router.get("/", response_model=List[SupplierResponse])
@router.get("", response_model=List[SupplierResponse], include_in_schema=False)
def read_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()

@router.post("/", response_model=SupplierResponse)
@router.post("", response_model=SupplierResponse, include_in_schema=False)
def create_supplier(sup_in: SupplierCreate, db: Session = Depends(get_db)):
    db_sup = db.query(Supplier).filter(Supplier.name == sup_in.name).first()
    if db_sup:
        raise HTTPException(status_code=400, detail="El proveedor ya existe")
    new_sup = Supplier(**sup_in.model_dump())
    db.add(new_sup)
    db.commit()
    db.refresh(new_sup)
    return new_sup
