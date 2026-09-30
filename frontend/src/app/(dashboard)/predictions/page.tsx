'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Layers,
  LineChart,
  Activity,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  current_stock: number;
}

interface ForecastResponse {
  product_id: number;
  sku: string;
  product_name: string;
  brand: string;
  current_stock: number;
  reorder_point: number;
  safety_stock: number;
  horizon_days: number;
  model_used: string;
  total_predicted_demand: number;
  daily_average_demand: number;
  trend_percentage: number;
  trend_label: string;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  history_series: Array<{
    date: string;
    historical_sales: number;
    is_forecast: boolean;
  }>;
  forecast_series: Array<{
    date: string;
    predicted_demand: number;
    lower_bound: number;
    upper_bound: number;
    is_forecast: boolean;
  }>;
}

export default function PredictionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/v1/products/');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          if (data.length > 0) setSelectedProductId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;

    const fetchForecast = async () => {
      try {
        setForecastLoading(true);
        const res = await fetch(`/api/v1/predictions/forecast?product_id=${selectedProductId}&horizon_days=${horizonDays}`);
        if (res.ok) {
          const data = await res.json();
          setForecast(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setForecastLoading(false);
      }
    };

    fetchForecast();
  }, [selectedProductId, horizonDays]);

  const chartData = React.useMemo(() => {
    if (!forecast || !forecast.history_series || !forecast.forecast_series) return [];

    const history = forecast.history_series.map(h => ({
      date: h.date,
      historico: h.historical_sales,
      prediccion: null as number | null,
      limiteInferior: null as number | null,
      limiteSuperior: null as number | null
    }));

    const future = forecast.forecast_series.map(f => ({
      date: f.date,
      historico: null as number | null,
      prediccion: f.predicted_demand,
      limiteInferior: f.lower_bound,
      limiteSuperior: f.upper_bound
    }));

    // Conectar el último punto histórico con el inicio del pronóstico
    if (history.length > 0 && future.length > 0) {
      history[history.length - 1].prediccion = history[history.length - 1].historico;
      history[history.length - 1].limiteInferior = history[history.length - 1].historico;
      history[history.length - 1].limiteSuperior = history[history.length - 1].historico;
    }

    return [...history, ...future];
  }, [forecast]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Inicializando motor de inferencia neuronal y series temporales...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              ML INFERENCE ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Pronóstico de Demanda Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Proyección multi-horizonte de unidades demandadas generada de forma recursiva por el modelo campeón de Machine Learning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            Inferencia: {forecast?.model_used || 'Regresión Lineal Campeón'}
          </span>
        </div>
      </div>

      {/* Barra de Control: Selector de Producto y Horizontes */}
      <div className="glass-card rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="w-full md:w-[450px]">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Seleccionar Dispositivo Móvil:
          </label>
          <div className="relative">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 text-xs bg-slate-950/90 border border-white/[0.08] rounded-xl text-white font-medium focus:ring-2 focus:ring-cyan-500 appearance-none shadow-inner"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Stock: {p.current_stock} uds)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Horizonte de Pronóstico:
          </label>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-white/[0.08] rounded-xl">
            {[7, 15, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonDays(h)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  horizonDays === h
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} días
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de 4 Cards de Métricas de Pronóstico */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Demanda Total Proyectada */}
          <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/30">
            <div className="flex items-center justify-between text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <span>Demanda Estimada</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{forecast.total_predicted_demand}</span>
              <span className="text-xs text-indigo-300 font-semibold">unidades en {horizonDays} días</span>
            </div>
            <span className="text-xs text-slate-400 mt-2 block font-mono">
              Promedio: <strong className="text-white">{forecast.daily_average_demand} uds/día</strong>
            </span>
          </div>

          {/* Card 2: Tendencia de Demanda */}
          <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Tendencia Proyectada</span>
              {forecast.trend_label === 'CRECIENTE' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : forecast.trend_label === 'DECRECIENTE' ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${
                forecast.trend_label === 'CRECIENTE' ? 'text-emerald-400' : forecast.trend_label === 'DECRECIENTE' ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {forecast.trend_percentage > 0 ? `+${forecast.trend_percentage}%` : `${forecast.trend_percentage}%`}
              </span>
              <span className="text-xs font-bold text-slate-400">{forecast.trend_label}</span>
            </div>
            <span className="text-xs text-slate-400 mt-2 block">Comparado con histórico</span>
          </div>

          {/* Card 3: Intervalo de Confianza (95%) */}
          <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Intervalo Confianza (95%)</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold text-white font-mono">
                [{forecast.confidence_interval.lower} - {forecast.confidence_interval.upper}]
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-2 block">Banda de dispersión probabilística</span>
          </div>

          {/* Card 4: Cobertura de Stock */}
          <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Stock vs Demanda</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{forecast.current_stock} uds</span>
              <span className="text-xs text-slate-400">en almacén</span>
            </div>
            <div className="mt-2">
              {forecast.current_stock < forecast.total_predicted_demand ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20 font-mono">
                  <AlertCircle className="w-3 h-3" /> Riesgo de Quiebre
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                  Stock Suficiente
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico Comparativo: Demanda Histórica vs Pronóstico ML */}
      <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.07] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              Curva Temporal: Histórico Real vs Demanda Predicha ({horizonDays} días)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Línea continua cyan: Ventas reales registradas • Línea punteada índigo: Inferencia generada por ML.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] inline-block"></span>
              Histórico Real
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] inline-block"></span>
              Pronóstico ML
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          {forecastLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
              Calculando proyecciones autorregresivas recursivas...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value) => {
                    if (value === null || value === undefined) return ['', ''];
                    const num = Number(value);
                    const formatted = num % 1 !== 0 ? num.toFixed(2) : num.toString();
                    return [`${formatted} unidades`, 'Demanda'];
                  }}
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Area type="monotone" dataKey="historico" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHistory)" name="Histórico Real" />
                <Area type="monotone" dataKey="prediccion" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" name="Pronóstico ML" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabla Desglosada del Pronóstico */}
      {forecast && (
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Desglose Diario del Pronóstico</h3>
              <p className="text-xs text-slate-400 mt-0.5">Estimación puntual y límites del intervalo de confianza para cada fecha futura.</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {forecast.forecast_series.length} Fechas Proyectadas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Demanda Esperada</th>
                  <th className="py-3 px-4">Límite Inferior (95%)</th>
                  <th className="py-3 px-4">Límite Superior (95%)</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {forecast.forecast_series.slice(0, 15).map((f, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors font-mono">
                    <td className="py-2.5 px-4 font-semibold text-white">{f.date}</td>
                    <td className="py-2.5 px-4 text-cyan-300 font-bold">
                      {f.predicted_demand > 0 ? f.predicted_demand : 0} uds
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{f.lower_bound} uds</td>
                    <td className="py-2.5 px-4 text-slate-400">{f.upper_bound} uds</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        Inferencia ML
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
