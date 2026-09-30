import pandas as pd
import io
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.inventory_movement import InventoryMovement, MovementType
from app.schemas.sale import ImportPreviewResponse, ImportRowError

# Almacenamiento temporal en memoria de lotes pre-validados antes de confirmación
PENDING_IMPORTS: Dict[str, List[Dict[str, Any]]] = {}

def process_sales_file(file_contents: bytes, filename: str, db: Session) -> ImportPreviewResponse:
    # 1. Cargar archivo con pandas según extensión
    if filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(file_contents))
    elif filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(io.BytesIO(file_contents))
    else:
        raise ValueError("Formato de archivo no soportado. Debe ser .csv o .xlsx")

    # Estandarizar nombres de columnas a minúsculas
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Columnas esperadas: sku, cantidad (o units), precio (o price), fecha (o date)
    col_mapping = {
        'sku': 'sku', 'codigo': 'sku', 'product_sku': 'sku',
        'cantidad': 'quantity', 'quantity': 'quantity', 'unidades': 'quantity', 'units': 'quantity',
        'precio': 'unit_price', 'price': 'unit_price', 'precio_unitario': 'unit_price', 'unit_price': 'unit_price',
        'fecha': 'date', 'date': 'date', 'fecha_venta': 'date',
        'cliente': 'customer', 'customer': 'customer',
        'canal': 'channel', 'channel': 'channel'
    }

    df.rename(columns=col_mapping, inplace=True)

    errors: List[ImportRowError] = []
    valid_records: List[Dict[str, Any]] = []

    # Cache de productos en base de datos para validación rápida
    products_db = {p.sku.upper(): p for p in db.query(Product).all()}

    total_rows = len(df)

    for idx, row in df.iterrows():
        row_num = int(idx) + 2  # Considerando cabecera en fila 1
        sku = str(row.get('sku', '')).strip().upper()

        # Validación 1: SKU vacío
        if not sku or sku == 'NAN':
            errors.append(ImportRowError(row_number=row_num, sku=None, error="El SKU está vacío"))
            continue

        # Validación 2: Existencia del SKU en DB
        if sku not in products_db:
            errors.append(ImportRowError(row_number=row_num, sku=sku, error=f"El SKU '{sku}' no existe en el catálogo de productos"))
            continue

        # Validación 3: Cantidad válida
        try:
            qty = int(row.get('quantity', 0))
            if qty <= 0:
                errors.append(ImportRowError(row_number=row_num, sku=sku, error=f"La cantidad debe ser mayor a 0 (recibido: {qty})"))
                continue
        except Exception:
            errors.append(ImportRowError(row_number=row_num, sku=sku, error="La cantidad no es un número entero válido"))
            continue

        # Validación 4: Precio
        product = products_db[sku]
        try:
            price = float(row.get('unit_price', product.sale_price))
            if pd.isna(price) or price <= 0:
                price = product.sale_price
        except Exception:
            price = product.sale_price

        # Validación 5: Fecha
        raw_date = row.get('date', None)
        try:
            if pd.isna(raw_date):
                date_val = pd.Timestamp.now()
            else:
                date_val = pd.to_datetime(raw_date)
        except Exception:
            date_val = pd.Timestamp.now()

        customer = str(row.get('customer', 'Cliente Importado'))
        if customer == 'nan':
            customer = 'Cliente Importado'

        channel = str(row.get('channel', 'Importación Masiva'))
        if channel == 'nan':
            channel = 'Importación Masiva'

        valid_records.append({
            'product_id': product.id,
            'sku': sku,
            'product_name': product.name,
            'quantity': qty,
            'unit_price': price,
            'subtotal': price * qty,
            'date': date_val.to_pydatetime(),
            'customer_name': customer,
            'channel': channel
        })

    import_token = str(uuid.uuid4())
    PENDING_IMPORTS[import_token] = valid_records

    # Vista previa de los primeros 10 registros válidos
    preview = [
        {
            'sku': r['sku'],
            'producto': r['product_name'],
            'cantidad': r['quantity'],
            'precio': r['unit_price'],
            'total': r['subtotal'],
            'fecha': r['date'].strftime('%Y-%m-%d %H:%M')
        }
        for r in valid_records[:10]
    ]

    return ImportPreviewResponse(
        filename=filename,
        total_rows=total_rows,
        valid_rows_count=len(valid_records),
        invalid_rows_count=len(errors),
        errors=errors,
        preview_data=preview,
        import_token=import_token
    )

def confirm_import(import_token: str, db: Session) -> Dict[str, Any]:
    if import_token not in PENDING_IMPORTS:
        raise ValueError("Token de importación inválido o expirado")

    records = PENDING_IMPORTS.pop(import_token)
    if not records:
        return {"imported_count": 0, "message": "No hay registros válidos para importar"}

    # Agrupar registros por venta o insertar transacciones
    imported_count = 0
    for r in records:
        sale = Sale(
            date=r['date'],
            total=r['subtotal'],
            customer_name=r['customer_name'],
            channel=r['channel']
        )
        db.add(sale)
        db.flush()

        item = SaleItem(
            sale_id=sale.id,
            product_id=r['product_id'],
            quantity=r['quantity'],
            unit_price=r['unit_price'],
            subtotal=r['subtotal']
        )
        db.add(item)

        # Actualizar inventario y registrar movimiento
        product = db.query(Product).filter(Product.id == r['product_id']).first()
        if product:
            prev_stock = product.current_stock
            product.current_stock = max(0, prev_stock - r['quantity'])
            
            movement = InventoryMovement(
                product_id=product.id,
                type=MovementType.SALIDA.value,
                quantity=r['quantity'],
                previous_stock=prev_stock,
                new_stock=product.current_stock,
                unit_cost=product.purchase_price,
                total_value=product.purchase_price * r['quantity'],
                document_ref=f"IMPORT-VENTA-{sale.id}",
                reason="Importación masiva de ventas históricas",
                created_at=r['date']
            )
            db.add(movement)

        imported_count += 1

    db.commit()
    return {
        "imported_count": imported_count,
        "message": f"Se han importado {imported_count} ventas históricas exitosamente y actualizado el Kardex."
    }
