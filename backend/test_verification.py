from app.core.database import SessionLocal
from app.ml.data_prep.preprocessor import DataPreprocessor
from app.ml.trainer import MLTrainer
from app.ml.predictor import DemandPredictor
from app.services.inventory_optimizer import InventoryOptimizer
from app.models.ml_model import MLModelRecord
from app.models.product import Product
from app.models.alert import Alert
from app.models.recommendation import Recommendation

db = SessionLocal()

print("--- MODELOS REGISTRADOS ---")
models = db.query(MLModelRecord).all()
for m in models:
    print(f"[{m.status}] {m.algorithm}: R2={m.r2}, RMSE={m.rmse}, MAE={m.mae}")

print("\n--- EDA SUMMARY ---")
preprocessor = DataPreprocessor(db)
eda = preprocessor.get_eda_summary()
print("Estadísticas del objetivo:", eda["target_statistics"])
print("Calidad de datos:", eda["dataset_health"])
print("Correlaciones principales:", eda["correlations"][:4])

print("\n--- PRUEBA DE PREDICCIÓN CON PRODUCTO TOP ---")
top_prod = db.query(Product).filter(Product.sku == "IPHONE-17-PROMAX256GB").first()
if top_prod:
    predictor = DemandPredictor(db)
    pred = predictor.forecast_product_demand(top_prod.id, horizon_days=30)
    print(f"Producto: {pred['product_name']} ({pred['sku']})")
    print(f"Demanda Proyectada (30d): {pred['total_predicted_demand']} unidades")
    print(f"Tendencia: {pred['trend_label']} ({pred['trend_percentage']}%)")
    print(f"Intervalo 95%: [{pred['confidence_interval']['lower']}, {pred['confidence_interval']['upper']}]")

print("\n--- RESUMEN ABC Y RECOMENDACIONES ---")
opt = InventoryOptimizer(db)
abc_summary = opt.get_abc_summary_metrics()
print("Distribución ABC:", abc_summary)
recs = db.query(Recommendation).count()
alerts = db.query(Alert).count()
print(f"Total Recomendaciones: {recs}, Total Alertas: {alerts}")

db.close()
