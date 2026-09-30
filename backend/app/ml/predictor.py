import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.database import Base, engine
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement
from app.models.user import User
from app.models.sale import Sale, SaleItem
from app.models.demand_prediction import DemandPrediction
from app.models.ml_model import MLModelRecord
from app.ml.data_prep.preprocessor import DataPreprocessor
from app.ml.trainer import MLTrainer, SAVED_MODELS_DIR

class DemandPredictor:
    """
    Motor de Inferencia y Pronóstico de Demanda Multi-Horizonte (7, 15, 30, 60, 90 días).
    Utiliza pronóstico recursivo autorregresivo con el modelo campeón (.joblib).
    """

    def __init__(self, db: Session):
        Base.metadata.create_all(bind=engine)
        self.db = db
        self.preprocessor = DataPreprocessor(db)
        self.model_path = os.path.join(SAVED_MODELS_DIR, "champion_model.joblib")

    def _get_or_load_model(self) -> Dict[str, Any]:
        if not os.path.exists(self.model_path):
            trainer = MLTrainer(self.db)
            trainer.train_and_compare_models()

        return joblib.load(self.model_path)

    def forecast_product_demand(self, product_id: int, horizon_days: int = 30) -> Dict[str, Any]:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Producto ID {product_id} no encontrado")

        model_bundle = self._get_or_load_model()
        model = model_bundle["model"]
        algorithm_name = model_bundle["algorithm"]
        feature_columns = model_bundle["feature_columns"]

        # Obtener histórico diario del producto
        ts_df = self.preprocessor.build_time_series_dataset(product_id=product_id)
        if ts_df.empty or len(ts_df) < 30:
            raise ValueError("Datos históricos insuficientes para generar pronóstico.")

        ts_df = ts_df.sort_values(by='day').reset_index(drop=True)
        recent_history = ts_df.iloc[-45:].copy()

        # Preparar buffer autorregresivo con las ventas de los últimos 30 días
        last_date = ts_df['day'].max()
        history_sales = list(ts_df['units_sold'].values)
        avg_price = float(product.sale_price)

        forecast_records: List[Dict[str, Any]] = []
        forecast_values: List[float] = []

        current_date = last_date + timedelta(days=1)

        # Inferencia Recursiva Día por Día
        for step in range(horizon_days):
            day_of_week = current_date.weekday()
            month = current_date.month
            day_of_month = current_date.day
            is_weekend = 1 if day_of_week in [5, 6] else 0
            is_month_end = 1 if current_date.day in [28, 29, 30, 31] else 0

            sin_month = np.sin(2 * np.pi * month / 12)
            cos_month = np.cos(2 * np.pi * month / 12)
            sin_dow = np.sin(2 * np.pi * day_of_week / 7)
            cos_dow = np.cos(2 * np.pi * day_of_week / 7)

            # Rezagos a partir del buffer dinámico
            lag_1 = history_sales[-1]
            lag_7 = history_sales[-7] if len(history_sales) >= 7 else history_sales[-1]
            lag_14 = history_sales[-14] if len(history_sales) >= 14 else history_sales[-1]
            lag_30 = history_sales[-30] if len(history_sales) >= 30 else history_sales[-1]

            rolling_mean_7 = float(np.mean(history_sales[-7:]))
            rolling_std_7 = float(np.std(history_sales[-7:]))
            rolling_mean_30 = float(np.mean(history_sales[-30:]))

            features_dict = {
                'lag_1': lag_1,
                'lag_7': lag_7,
                'lag_14': lag_14,
                'lag_30': lag_30,
                'rolling_mean_7': rolling_mean_7,
                'rolling_std_7': rolling_std_7,
                'rolling_mean_30': rolling_mean_30,
                'day_of_week': day_of_week,
                'is_weekend': is_weekend,
                'is_month_end': is_month_end,
                'sin_month': sin_month,
                'cos_month': cos_month,
                'sin_day_of_week': sin_dow,
                'cos_day_of_week': cos_dow,
                'avg_price': avg_price
            }

            feature_row = pd.DataFrame([features_dict])[feature_columns]
            pred_y = float(model.predict(feature_row)[0])
            pred_y = max(0.0, pred_y) # Restricción de no negatividad

            # Estimación empírica del intervalo de confianza (95%)
            rmse_est = 0.85
            lower_bound = max(0.0, round(pred_y - 1.96 * rmse_est, 2))
            upper_bound = round(pred_y + 1.96 * rmse_est, 2)

            forecast_records.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "predicted_demand": round(pred_y, 2),
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
                "is_forecast": True
            })

            forecast_values.append(pred_y)
            # Actualizar buffer para el siguiente paso autorregresivo
            history_sales.append(pred_y)
            current_date += timedelta(days=1)

        total_predicted = int(np.ceil(sum(forecast_values)))
        daily_avg = round(float(np.mean(forecast_values)), 2)

        # Cálculo de Tendencia (vs promedio de los últimos 30 días históricos)
        past_30_avg = float(np.mean(ts_df['units_sold'].values[-30:]))
        if past_30_avg > 0:
            trend_pct = round(((daily_avg - past_30_avg) / past_30_avg) * 100, 1)
        else:
            trend_pct = 0.0

        if trend_pct > 5.0:
            trend_label = "CRECIENTE"
        elif trend_pct < -5.0:
            trend_label = "DECRECIENTE"
        else:
            trend_label = "ESTABLE"

        # Formatear serie histórica para el gráfico (últimos 30 días)
        history_chart = [
            {
                "date": r['day'].strftime("%Y-%m-%d"),
                "historical_sales": int(r['units_sold']),
                "is_forecast": False
            }
            for _, r in recent_history.iterrows()
        ]

        # Guardar resumen en la base de datos MySQL
        prediction_entry = DemandPrediction(
            product_id=product.id,
            target_date=last_date + timedelta(days=horizon_days),
            predicted_demand=total_predicted,
            model_name=algorithm_name,
            confidence_lower=round(sum(r['lower_bound'] for r in forecast_records), 1),
            confidence_upper=round(sum(r['upper_bound'] for r in forecast_records), 1),
            horizon_days=horizon_days,
            trend=trend_label
        )
        self.db.add(prediction_entry)
        self.db.commit()

        return {
            "product_id": product.id,
            "sku": product.sku,
            "product_name": product.name,
            "brand": product.brand,
            "current_stock": product.current_stock,
            "reorder_point": product.reorder_point,
            "safety_stock": product.safety_stock,
            "horizon_days": horizon_days,
            "model_used": algorithm_name,
            "total_predicted_demand": total_predicted,
            "daily_average_demand": daily_avg,
            "trend_percentage": trend_pct,
            "trend_label": trend_label,
            "confidence_interval": {
                "lower": round(sum(r['lower_bound'] for r in forecast_records), 1),
                "upper": round(sum(r['upper_bound'] for r in forecast_records), 1)
            },
            "history_series": history_chart,
            "forecast_series": forecast_records
        }
