'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  AlertTriangle,
  BrainCircuit,
  DollarSign,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  ArrowRight,
  Layers,
  Cpu
} from 'lucide-react';

interface KPIs {
  monthly_revenue: number;
  monthly_revenue_growth_pct: number;
  monthly_transactions: number;
  total_units_sold: number;
  total_stock_units: number;
  total_inventory_value: number;
  products_low_stock: number;
  products_critical: number;
  products_out_of_stock: number;
  products_overstock: number;
  estimated_next_month_demand: number;
  ml_model_accuracy: string;
}

interface TimelineItem {
  period: string;
  revenue: number;
  transactions: number;
}

interface CategoryItem {
  category: string;
  units_sold: number;
  revenue: number;
}

interface TopProductItem {
  id: number;
  sku: string;
  name: string;
  brand: string;
  units_sold: number;
  revenue: number;
}

interface CriticalAlertItem {
  id: number;
  sku: string;
  name: string;
  brand: string;
  current_stock: number;
  reorder_point: number;
  safety_stock: number;
  status: string;
  suggested_reorder_units: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlertItem[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [resKpis, resCat, resTop, resAlerts] = await Promise.all([
          fetch('/api/v1/analytics/kpis'),
          fetch('/api/v1/analytics/sales-by-category'),
          fetch('/api/v1/analytics/top-products'),
          fetch('/api/v1/analytics/critical-stock-alerts')
        ]);

        if (resKpis.ok) setKpis(await resKpis.json());
        if (resCat.ok) setCategoryData(await resCat.json());
        if (resTop.ok) setTopProducts(await resTop.json());
        if (resAlerts.ok) setCriticalAlerts(await resAlerts.json());
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`/api/v1/analytics/sales-timeline?group_by=${timelineFilter}`);
        if (res.ok) setTimelineData(await res.json());
      } catch (err) {
        console.error('Error fetching timeline:', err);
      }
    };
    fetchTimeline();
  }, [timelineFilter]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Sincronizando Business Intelligence en tiempo real...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Executive Commercial Hero Banner */}
      <div className="glass-card specular-border rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#0D1424] via-[#10182E] to-[#0A0F1C] border border-white/[0.08]">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Ecosistema GO TECH™ en Vivo
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Hub Logístico Mayorista</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Dashboard Ejecutivo & Business Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitoreo en tiempo real del rendimiento comercial, rotación de stock y proyecciones de demanda asistidas por el modelo campeón de Machine Learning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs border border-white/[0.08] shadow-sm transition-all hover:scale-[1.02]"
            >
              Exportar Auditoría
            </Link>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30"
            >
              <BrainCircuit className="w-4 h-4" />
              Recomendaciones IA & EOQ
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Superior: 4 KPIs Principales con Taste Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ingresos Auditados */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ingresos Auditados</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl shadow-inner">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-3xl font-black text-white tracking-tight font-mono">
              ${kpis?.monthly_revenue ? kpis.monthly_revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="mt-2.5 flex items-center text-xs">
            {kpis && kpis.monthly_revenue_growth_pct >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{kpis.monthly_revenue_growth_pct}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 font-mono">
                <ArrowDownRight className="w-3.5 h-3.5" /> {kpis?.monthly_revenue_growth_pct}%
              </span>
            )}
            <span className="text-slate-400 ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Valor del Inventario */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Valor en Catálogo</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl shadow-inner">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-3xl font-black text-white tracking-tight font-mono">
              ${kpis?.total_inventory_value ? kpis.total_inventory_value.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-medium flex items-center gap-1">
            <strong className="text-slate-200 font-bold font-mono">{kpis?.total_stock_units || 0} unidades</strong>
            <span>disponibles en almacén</span>
          </div>
        </div>

        {/* KPI 3: Dispositivos en Riesgo */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dispositivos en Riesgo</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shadow-inner">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 tracking-tight font-mono">
              {(kpis?.products_low_stock || 0) + (kpis?.products_out_of_stock || 0)}
            </span>
            <span className="text-xs text-slate-400">requieren atención</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 font-mono">
              {kpis?.products_out_of_stock || 0} agotados
            </span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
              {kpis?.products_low_stock || 0} stock bajo
            </span>
          </div>
        </div>

        {/* KPI 4: Machine Learning Accuracy & Demanda */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden border-cyan-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Modelo Campeón ML</span>
            <div className="p-2.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl shadow-inner">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight font-mono">
              {kpis?.ml_model_accuracy || 'R² 0.11'}
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-300">
            Demanda proyectada: <strong className="text-cyan-300 font-bold font-mono">{kpis?.estimated_next_month_demand || 0} uds</strong> (30d)
          </div>
        </div>
      </div>

      {/* Grid de Gráficos: Ventas Históricas vs Distribución de Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Línea de Tiempo de Ventas */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Evolución Histórica de Facturación
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Comportamiento temporal de ingresos comerciales reales.</p>
            </div>
            {/* Filtros Diario / Semanal / Mensual */}
            <div className="flex items-center p-1 bg-slate-950 border border-white/[0.08] rounded-xl text-xs font-bold">
              <button
                onClick={() => setTimelineFilter('daily')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${timelineFilter === 'daily' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                Diario
              </button>
              <button
                onClick={() => setTimelineFilter('weekly')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${timelineFilter === 'weekly' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTimelineFilter('monthly')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${timelineFilter === 'monthly' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Ingresos']}
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ventas por Categoría */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Ingresos por Categoría
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Participación en ventas por familia de producto.</p>
          </div>
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Ingresos']}
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Bar dataKey="revenue" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Ranking Top 10 Productos + Alertas de Stock Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Productos Más Vendidos */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top 10 Dispositivos de Mayor Facturación</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranking por volumen de ingresos y rotación de unidades.</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              Ranking Oficial
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900/80 transition-all border border-white/[0.05] hover:border-cyan-500/30">
                <div className="flex items-center gap-3.5">
                  <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center border font-mono ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    idx === 1 ? 'bg-slate-700 text-white border-slate-600' :
                    idx === 2 ? 'bg-orange-600/20 text-orange-300 border-orange-500/40' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <Link href={`/products/${p.id}`} className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors block">
                      {p.name}
                    </Link>
                    <span className="text-xs text-slate-400 block font-mono mt-0.5">{p.sku} • {p.brand}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block tracking-tight font-mono">
                    ${p.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono">{p.units_sold} uds vendidas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Stock Crítico & Puntos de Reorden */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Dispositivos en Stock Crítico</h3>
              <p className="text-xs text-slate-400 mt-0.5">Por debajo del punto de reorden o stock agotado.</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Atención Inmediata
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {criticalAlerts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No hay productos en estado crítico actualmente.
              </div>
            ) : (
              criticalAlerts.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md font-mono ${
                        p.status === 'Agotado' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Stock: <strong className="text-white font-mono">{p.current_stock} uds</strong></span>
                      <span>•</span>
                      <span>Pto. Reorden: <strong className="text-slate-200 font-mono">{p.reorder_point} uds</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      Reponer +{p.suggested_reorder_units}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
