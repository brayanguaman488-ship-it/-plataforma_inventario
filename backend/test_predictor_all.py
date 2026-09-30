from app.core.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement
from app.models.sale import Sale, SaleItem
from app.models.demand_prediction import DemandPrediction
from app.models.recommendation import Recommendation
from app.models.alert import Alert
from app.models.ml_model import MLModelRecord
from app.ml.predictor import DemandPredictor

Base.metadata.create_all(bind=engine)
db = SessionLocal()
p = DemandPredictor(db)

prods = db.query(Product).all()
print(f"Total productos en BD: {len(prods)}")
for prod in prods[:10]:
    try:
        res = p.forecast_product_demand(prod.id, 30)
        print(f"[OK] ID {prod.id} ({prod.name}): Demanda={res['total_predicted_demand']} uds, History={len(res['history_series'])} pts, Forecast={len(res['forecast_series'])} pts, Tendencia={res['trend_label']} ({res['trend_percentage']}%)")
    except Exception as e:
        print(f"[ERROR] ID {prod.id} ({prod.name}): {e}")
db.close()
