# PROYECTO DE TITULACIÓN DE MAESTRÍA

## PLATAFORMA INTELIGENTE PARA LA PREDICCIÓN DE DEMANDA, CONTROL Y OPTIMIZACIÓN DE INVENTARIO MEDIANTE TÉCNICAS DE APRENDIZAJE AUTOMÁTICO EN UNA EMPRESA DISTRIBUIDORA DE DISPOSITIVOS MÓVILES

---

### RESUMEN EJECUTIVO
El presente proyecto de desarrollo tecnológico y analítica avanzada implementa una solución integral que combina la gestión operacional de inventarios, analítica de negocios (Business Intelligence) y modelos de Aprendizaje Automático (*Machine Learning*) para la optimización de compras y abastecimiento en empresas comercializadoras y distribuidoras de dispositivos tecnológicos (smartphones, tablets y accesorios).

La plataforma no se limita a un registro transaccional tradicional de existencias (Kardex); integra un motor de inferencia estadística y aprendizaje supervisado capaz de predecir la demanda futura con horizontes de 7, 15, 30, 60 y 90 días, combinándolo con algoritmos clásicos de investigación de operaciones como el **Lote Económico de Pedido (EOQ - *Economic Order Quantity*)**, **Clasificación ABC basada en la Ley de Pareto** y **Puntos de Reorden Dinámicos**, con un componente de **Explicabilidad en Inteligencia Artificial (XAI)** que justifica ante la alta gerencia el porqué de cada recomendación de compra.

---

### 1. ARQUITECTURA DEL SISTEMA
El sistema fue diseñado bajo el patrón arquitectónico de **Microservicios Desacoplados / Monorepo**:

*   **Capa de Presentación (Frontend):** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts y Lucide Icons.
*   **Capa de Servicios & API RESTful (Backend):** FastAPI (Python 3.11), Pydantic v2, Uvicorn.
*   **Capa de Persistencia (Base de Datos):** MySQL Server 8.0 gestionado mediante SQLAlchemy ORM.
*   **Capa de Machine Learning & Analítica:** Scikit-Learn, Pandas, NumPy, Joblib, OpenPyXL.

```
[ Cliente Web (Next.js 14 + Tailwind) ]
                |  (HTTP / JSON REST)
                v
[ API RESTful (FastAPI + Pydantic) ]
        |                   |
        v                   v
[ MySQL Database ]   [ Pipeline ML (Scikit-Learn + Joblib) ]
 - products           - Data Preprocessing (Lags, Fourier)
 - inventory_movements- Model Training & Evaluation
 - sales & items      - Inferencia Recursiva Multi-Horizonte
 - demand_predictions - Optimización Logística (EOQ + ABC)
 - recommendations
```

---

### 2. MODELO DE DATOS Y DICCIONARIO DE ENTIDADES

1.  **`users`:** Control de acceso, autenticación mediante hashing y gestión de roles (*Administrador*, *Gerente*, *Analista*).
2.  **`categories`:** Clasificación de dispositivos tecnológicos (*Smartphones*, *Tablets*, *Audio & Wearables*).
3.  **`suppliers`:** Registro de distribuidores y proveedores oficiales, incluyendo el parámetro crítico de **Lead Time** (tiempo de entrega en días).
4.  **`products`:** Catálogo maestro de dispositivos móviles con SKU, marca, modelo, precios de compra/venta, stock físico actual, stock de seguridad, punto de reorden y stock máximo.
5.  **`inventory_movements`:** Registro cronológico de entradas, salidas, ajustes de inventario y devoluciones para alimentar el Kardex valorizado.
6.  **`sales` y `sale_items`:** Registro de transacciones comerciales con clientes, canales de distribución (*Tienda Física*, *E-Commerce*, *Mayorista*) y precios unitarios.
7.  **`ml_models`:** Bitácora de experimentos y versionado de modelos con métricas de evaluación ($MAE$, $MSE$, $RMSE$, $R^2$), hiperparámetros e hipervínculo al binario `.joblib`.
8.  **`demand_predictions`:** Pronósticos de demanda generados a 7, 15, 30, 60 y 90 días con intervalos de confianza al 95%.
9.  **`recommendations`:** Dictámenes logísticos sugeridos (*Compra Urgente*, *Comprar*, *Mantener*, *Sobreinventario*) con cantidad sugerida, lote EOQ y texto explicable.
10. **`alerts`:** Notificaciones operacionales categorizadas por severidad (*Crítica*, *Alta*, *Media*, *Informativa*).

---

### 3. METODOLOGÍA DE MACHINE LEARNING & PREPROCESAMIENTO

#### 3.1. Tratamiento de Series Temporales e Imputación Lógica
Las transacciones comerciales se agregan a nivel diario por SKU. Para evitar discontinuidades que invaliden los algoritmos autoregresivos, los días sin ventas registradas son imputados automáticamente con 0 unidades.

#### 3.2. Ingeniería de Características (Feature Engineering)
Se generan 14 variables predictivas derivadas para capturar patrones estacionales y tendencias:
*   **Variables de Calendario:** `day_of_week`, `day_of_month`, `month`, `is_weekend`, `is_month_end`.
*   **Transformaciones Cíclicas de Fourier:**
    $$\sin\left(\frac{2\pi \cdot \text{month}}{12}\right), \quad \cos\left(\frac{2\pi \cdot \text{month}}{12}\right), \quad \sin\left(\frac{2\pi \cdot \text{day\_of\_week}}{7}\right), \quad \cos\left(\frac{2\pi \cdot \text{day\_of\_week}}{7}\right)$$
*   **Rezagos Temporales (Lags):** $t-1$ (ayer), $t-7$ (hace 1 semana), $t-14$ y $t-30$.
*   **Ventanas Móviles (Rolling Statistics):** Medias móviles de 7 y 30 días ($\text{MA}_7$, $\text{MA}_{30}$) y desviación estándar móvil de 7 días.
*   **Prevención de Fuga de Datos (*Data Leakage*):** Aplicación estricta de desfase (`shift(1)`) para que las estadísticas móviles no incluyan el valor del día a predecir.

#### 3.3. División Cronológica (*Time-Series Split*)
Se aplica una partición 80% Entrenamiento y 20% Prueba respetando la flecha temporal, sin aleatorización (*shuffle=False*).

---

### 4. EVALUACIÓN Y COMPARACIÓN DE MODELOS

Se entrenan y contrastan empíricamente 4 familias algorítmicas bajo el principio *No-Free-Lunch*:

1.  **Regresión Lineal Múltiple:** Modelo lineal de base (*Baseline*).
2.  **Árbol de Decisión (*DecisionTreeRegressor*):** Regresión no lineal basada en particiones ortogonales.
3.  **Bosques Aleatorios (*RandomForestRegressor*):** Ensamble de *Bagging* con 100 estimadores.
4.  **Potenciación del Gradiente (*GradientBoostingRegressor*):** Ensamble de *Boosting* secuencial con tasa de aprendizaje $\eta=0.08$.

#### Ecuaciones Matemáticas de Evaluación:
*   **Error Absoluto Medio (MAE):**
    $$MAE = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$
*   **Error Cuadrático Medio (MSE):**
    $$MSE = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$
*   **Raíz del Error Cuadrático Medio (RMSE):**
    $$RMSE = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}$$
*   **Coeficiente de Determinación ($R^2$):**
    $$R^2 = 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2}$$

El modelo con menor $RMSE$ y mayor $R^2$ es seleccionado como **Modelo Campeón** y persistido en `champion_model.joblib`.

---

### 5. MODELOS LOGÍSTICOS Y DE INVESTIGACIÓN OPERATIVA

#### 5.1. Lote Económico de Pedido (EOQ de Wilson)
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
*   $D$: Demanda anualizada proyectada por el modelo de ML ($d_{\text{diaria}} \times 365$).
*   $S$: Costo fijo de emisión de la orden de compra (\$45.00).
*   $H$: Costo de mantenimiento y almacenamiento anual ($15\%$ del valor de adquisición del dispositivo).

#### 5.2. Punto de Reorden Dinámico y Stock de Seguridad
$$\text{Stock de Seguridad} = Z \cdot \sigma_{\text{diaria}} \cdot \sqrt{\text{Lead Time}}$$
$$\text{Punto de Reorden (ROP)} = (d_{\text{diaria}} \cdot \text{Lead Time}) + \text{Stock de Seguridad}$$
*(Para un nivel de servicio del 95%, $Z = 1.65$).*

#### 5.3. Clasificación ABC de Pareto
*   **Clase A:** Dispositivos que acumulan hasta el 80% del valor de facturación total.
*   **Clase B:** Dispositivos en el rango del 80% al 95% de facturación.
*   **Clase C:** Dispositivos que representan el último 5% de ingresos.

---

### 6. EXPLICABILIDAD DE INTELIGENCIA ARTIFICIAL (XAI)
Para cada sugerencia de aprovisionamiento, el sistema sintetiza un dictamen comprensible para el tomador de decisiones:

> **Ejemplo de Dictamen Gerencial:**
> *"El producto iPhone 16 Pro 256GB ha alcanzado su Punto de Reorden (12 unidades). Con un inventario actual de 8 unidades y una demanda estimada para los próximos 30 días de 18 unidades generada por el modelo Random Forest, se recomienda reabastecer 15 unidades. Clasificación ABC: Tipo A (Estratégico). Lote óptimo EOQ: 14 uds. Lead Time del proveedor: 10 días."*

---

### 7. GUÍA DE DESPLIEGUE Y EJECUCIÓN RÁPIDA

#### Backend (FastAPI):
```powershell
cd "D:\proyectos antigraviti\plataforma_inventario\backend"
.\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend (Next.js):
```powershell
cd "D:\proyectos antigraviti\plataforma_inventario\frontend"
npm run dev
```

*   **Dashboard Ejecutivo:** `http://localhost:3000/dashboard`
*   **Catálogo de Productos:** `http://localhost:3000/products`
*   **Inventario & Kardex:** `http://localhost:3000/inventory`
*   **Ventas & Carga Masiva:** `http://localhost:3000/sales`
*   **Analítica & EDA:** `http://localhost:3000/analytics`
*   **Modelos Predictivos (Leaderboard):** `http://localhost:3000/ml-models`
*   **Predicción de Demanda (Multi-Horizonte):** `http://localhost:3000/predictions`
*   **Recomendaciones Inteligentes IA:** `http://localhost:3000/recommendations`
*   **Centro de Alertas:** `http://localhost:3000/alerts`
*   **Reportes & Exportación:** `http://localhost:3000/reports`
*   **Documentación API Swagger:** `http://127.0.0.1:8000/docs`
