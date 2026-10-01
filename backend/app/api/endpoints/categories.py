from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
@router.get("", response_model=List[CategoryResponse], include_in_schema=False)
def read_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/", response_model=CategoryResponse)
@router.post("", response_model=CategoryResponse, include_in_schema=False)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    db_cat = db.query(Category).filter(Category.name == cat_in.name).first()
    if db_cat:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    new_cat = Category(**cat_in.model_dump())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat
