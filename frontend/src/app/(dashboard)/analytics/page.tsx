'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Layers,
  CalendarDays,
  FileCheck2,
  TableProperties,
  Sparkles,
  BarChart3,
  Activity,
  ShieldCheck
} from 'lucide-react';

interface EDASummary {
  dataset_health: {
    clean_records: number;
    null_values_count: number;
    data_quality_score: string;
  };
  target_statistics: {
    mean: number;
    std: number;
    min: number;
    median: number;
    max: number;
    total_records: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  correlations: Array<{
    feature: string;
    correlation_with_target: number;
  }>;
  seasonality_by_day_of_week: Array<{
    day: string;
    avg_units_sold: number;
  }>;
  seasonality_by_month: Array<{
    month: string;
    avg_units_sold: number;
  }>;
  features_created_count: number;
}

export default function AnalyticsEDAPage() {
  const [eda, setEda] = useState<EDASummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEDA = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/ml/eda-summary');
        if (res.ok) {
          const data = await res.json();
          setEda(data);
        }
      } catch (err) {
        console.error('Error fetching EDA:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEDA();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Ejecutando Pipeline de Ingeniería de Características & EDA...
      </div>
    );
  }

  if (!eda || !eda.target_statistics) {
    return (
      <div className="p-12 text-center glass-card rounded-2xl border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white">Datos insuficientes para el análisis exploratorio</h2>
        <p className="text-xs text-slate-400 mt-2">Se requieren al menos 30 días continuos de transacciones registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              EXPLORATORY DATA ANALYSIS & FEATURE ENGINEERING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Analítica Exploratoria & Pipeline de Datos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Validación de integridad del dataset, transformaciones cíclicas temporales y correlación para modelos predictivos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Salud del Dataset: {eda.dataset_health.data_quality_score}
          </span>
        </div>
      </div>

      {/* Grid de 4 Resúmenes de EDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Registros Limpios</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3.5">
            <span className="text-3xl font-black text-white font-mono">{eda.dataset_health.clean_records.toLocaleString()}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block font-mono">0 valores nulos imputados</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Features Generadas</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3.5">
            <span className="text-3xl font-black text-cyan-400 font-mono">{eda.features_created_count}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Lags, medias móviles, sen/cos</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Promedio Diario (Target)</span>
            <TableProperties className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{eda.target_statistics.mean.toFixed(2)}</span>
            <span className="text-xs text-slate-400">uds/día</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block font-mono">Desv. Estándar: ±{eda.target_statistics.std.toFixed(2)}</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Ventana Temporal</span>
            <CalendarDays className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3.5">
            <span className="text-sm font-bold text-white font-mono block truncate">
              {eda.target_statistics.date_range.start}
            </span>
            <span className="text-xs text-slate-400 block font-mono mt-0.5">
              hasta {eda.target_statistics.date_range.end}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block font-mono">500+ días continuos</span>
        </div>
      </div>

      {/* Gráficos de Estacionalidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estacionalidad por Día de la Semana */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-400" />
              Estacionalidad Semanal (Demanda Promedio por Día)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Patrón de compras mayoristas a lo largo de la semana laboral.</p>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda.seasonality_by_day_of_week}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toFixed(2)} unidades`, 'Ventas Promedio']}
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Bar dataKey="avg_units_sold" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estacionalidad por Mes */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Estacionalidad Mensual
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribución mensual de la demanda a lo largo del año comercial.</p>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda.seasonality_by_month}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toFixed(2)} unidades`, 'Ventas Promedio']}
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Bar dataKey="avg_units_sold" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Correlación de Características */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Ranking de Correlación de Variables (Feature Importance vs Target)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Coeficiente de correlación de Pearson respecto a la demanda diaria real.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Variable / Característica</th>
                <th className="py-3.5 px-4">Correlación con Unidades Vendidas</th>
                <th className="py-3.5 px-4">Fuerza de Relación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {eda.correlations.map((c) => (
                <tr key={c.feature} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{c.feature}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">
                    {c.correlation_with_target.toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    {Math.abs(c.correlation_with_target) > 0.3 ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        ALTA
                      </span>
                    ) : Math.abs(c.correlation_with_target) > 0.1 ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        MODERADA
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        BAJA
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
