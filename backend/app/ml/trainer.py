import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.core.database import Base, engine
from app.ml.data_prep.preprocessor import DataPreprocessor
from app.models.ml_model import MLModelRecord

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

class MLTrainer:
    """
    Motor de Entrenamiento, Evaluación y Comparación de Modelos de Machine Learning.
    Entrena múltiples algoritmos, calcula métricas formales y selecciona el modelo campeón.
    """

    def __init__(self, db: Session):
        Base.metadata.create_all(bind=engine)
        self.db = db
        self.preprocessor = DataPreprocessor(db)
        self.feature_columns = [
            'lag_1', 'lag_7', 'lag_14', 'lag_30',
            'rolling_mean_7', 'rolling_std_7', 'rolling_mean_30',
            'day_of_week', 'is_weekend', 'is_month_end',
            'sin_month', 'cos_month', 'sin_day_of_week', 'cos_day_of_week',
            'avg_price'
        ]

    def train_and_compare_models(self) -> Dict[str, Any]:
        # 1. Obtener dataset procesado
        dataset = self.preprocessor.apply_feature_engineering(
            self.preprocessor.build_time_series_dataset()
        )

        if dataset.empty or len(dataset) < 50:
            raise ValueError("No hay suficientes datos históricos para entrenar los modelos (mínimo 50 registros).")

        # 2. División cronológica de Series Temporales (80% Train, 20% Test) para evitar Data Leakage
        dataset = dataset.sort_values(by='day').reset_index(drop=True)
        split_idx = int(len(dataset) * 0.8)
        
        train_df = dataset.iloc[:split_idx]
        test_df = dataset.iloc[split_idx:]

        X_train = train_df[self.feature_columns]
        y_train = train_df['units_sold']

        X_test = test_df[self.feature_columns]
        y_test = test_df['units_sold']

        # 3. Definición de algoritmos a experimentar
        models_to_train = {
            "Regresión Lineal": {
                "instance": LinearRegression(),
                "params": {"fit_intercept": True}
            },
            "Decision Tree": {
                "instance": DecisionTreeRegressor(max_depth=6, random_state=42),
                "params": {"max_depth": 6, "criterion": "squared_error"}
            },
            "Random Forest": {
                "instance": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42),
                "params": {"n_estimators": 100, "max_depth": 8}
            },
            "Gradient Boosting": {
                "instance": GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42),
                "params": {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5}
            }
        }

        results: List[Dict[str, Any]] = []
        best_score = -float('inf')
        champion_name = None
        champion_model = None

        # Resetear estado MEJOR anterior en la base de datos
        self.db.query(MLModelRecord).filter(MLModelRecord.status == "MEJOR").update({"status": "EVALUADO"})

        # 4. Entrenamiento y Evaluación
        for name, config in models_to_train.items():
            model = config["instance"]
            model.fit(X_train, y_train)

            # Inferencia sobre conjunto de prueba
            y_pred = model.predict(X_test)
            # Evitar predicciones de demanda negativas
            y_pred = np.maximum(0, y_pred)

            # Cálculo de Métricas Matemáticas Formales
            mae = float(mean_absolute_error(y_test, y_pred))
            mse = float(mean_squared_error(y_test, y_pred))
            rmse = float(np.sqrt(mse))
            r2 = float(r2_score(y_test, y_pred))

            # Obtener Importancia de Características si el modelo lo soporta
            feature_importance = {}
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                feature_importance = {
                    col: round(float(imp), 4)
                    for col, imp in sorted(zip(self.feature_columns, importances), key=lambda x: x[1], reverse=True)
                }

            is_best = False
            # Criterio de Selección: Mayor R² y menor RMSE
            if r2 > best_score:
                best_score = r2
                champion_name = name
                champion_model = model

            results.append({
                "algorithm": name,
                "mae": round(mae, 4),
                "mse": round(mse, 4),
                "rmse": round(rmse, 4),
                "r2": round(r2, 4),
                "params": config["params"],
                "feature_importance": feature_importance,
                "trained_records": len(X_train),
                "test_records": len(X_test)
            })

        # 5. Persistir el Modelo Campeón en disco (.joblib)
        champion_path = os.path.join(SAVED_MODELS_DIR, "champion_model.joblib")
        joblib.dump({
            "model": champion_model,
            "algorithm": champion_name,
            "feature_columns": self.feature_columns,
            "trained_at": pd.Timestamp.now().isoformat()
        }, champion_path)

        # 6. Registrar todos los modelos en la Base de Datos MySQL
        for r in results:
            status = "MEJOR" if r["algorithm"] == champion_name else "EVALUADO"
            record = MLModelRecord(
                name=f"Modelo Predicción {r['algorithm']}",
                algorithm=r["algorithm"],
                version="v1.0",
                mae=r["mae"],
                mse=r["mse"],
                rmse=r["rmse"],
                r2=r["r2"],
                status=status,
                model_file_path=champion_path if status == "MEJOR" else None,
                hyperparameters=json.dumps(r["params"]),
                feature_names=json.dumps(self.feature_columns)
            )
            self.db.add(record)

        self.db.commit()

        # Ordenar tabla comparativa: El mejor modelo primero
        results = sorted(results, key=lambda x: x["r2"], reverse=True)

        return {
            "status": "success",
            "champion_model": champion_name,
            "champion_r2_score": round(best_score, 4),
            "total_models_evaluated": len(results),
            "leaderboard": results,
            "dataset_info": {
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "features_used": self.feature_columns
            }
        }

    def get_champion_metadata(self) -> Dict[str, Any]:
        best_record = self.db.query(MLModelRecord).filter(MLModelRecord.status == "MEJOR").first()
        if not best_record:
            return {"status": "uninitialized", "message": "No hay modelo entrenado aún"}

        return {
            "id": best_record.id,
            "name": best_record.name,
            "algorithm": best_record.algorithm,
            "version": best_record.version,
            "mae": best_record.mae,
            "mse": best_record.mse,
            "rmse": best_record.rmse,
            "r2": best_record.r2,
            "training_date": best_record.training_date,
            "status": best_record.status
        }
