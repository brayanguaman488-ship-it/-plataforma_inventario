'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  PackageX,
  Info,
  DollarSign,
  Boxes,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';

interface RecommendationItem {
  product_id: number;
  sku: string;
  name: string;
  brand: string;
  purchase_price: number;
  current_stock: number;
  safety_stock: number;
  reorder_point: number;
  lead_time_days: number;
  predicted_demand_30d: number;
  days_of_inventory: number;
  abc_class: string;
  eoq_quantity: number;
  recommendation_type: string; // COMPRA_URGENTE, COMPRAR, SOBREINVENTARIO, MANTENER
  priority: string; // CRITICA, ALTA, MEDIA, BAJA
  recommended_quantity: number;
  estimated_purchase_cost: number;
  explanation: string;
}

interface ABCDistribution {
  total_products_classified: number;
  distribution: Array<{
    class: string;
    count: number;
    revenue: number;
    color: string;
  }>;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [abcData, setAbcData] = useState<ABCDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const [resRecs, resAbc] = await Promise.all([
        fetch('/api/v1/recommendations/'),
        fetch('/api/v1/recommendations/abc-summary')
      ]);

      if (resRecs.ok) setRecommendations(await resRecs.json());
      if (resAbc.ok) setAbcData(await resAbc.json());
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const totalRecommendedCost = recommendations.reduce((acc, r) => acc + r.estimated_purchase_cost, 0);
  const totalUnitsToBuy = recommendations.reduce((acc, r) => acc + r.recommended_quantity, 0);
  const criticalCount = recommendations.filter(r => r.recommendation_type === 'COMPRA_URGENTE').length;
  const overstockCount = recommendations.filter(r => r.recommendation_type === 'SOBREINVENTARIO').length;

  const getPriorityBadge = (type: string) => {
    switch (type) {
      case 'COMPRA_URGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
            <AlertOctagon className="w-3.5 h-3.5" /> Compra Urgente
          </span>
        );
      case 'COMPRAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Comprar
          </span>
        );
      case 'SOBREINVENTARIO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 font-mono">
            <PackageX className="w-3.5 h-3.5" /> Sobreinventario
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
            <CheckCircle className="w-3.5 h-3.5" /> Óptimo / Mantener
          </span>
        );
    }
  };

  const getAbcBadge = (abc: string) => {
    switch (abc) {
      case 'A':
        return <span className="px-2 py-0.5 text-xs font-black rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">Clase A</span>;
      case 'B':
        return <span className="px-2 py-0.5 text-xs font-black rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">Clase B</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-black rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">Clase C</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Calculando Cantidad Económica de Pedido (EOQ) y Puntos de Reorden...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              SMART INVENTORY DECISION ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Recomendaciones Inteligentes de Reabastecimiento
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Optimización estocástica de compras basada en demanda proyectada por Machine Learning, clasificación ABC y fórmula EOQ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {abcData && (
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-950 border border-white/[0.08] rounded-xl text-[11px] font-mono font-bold">
              {abcData.distribution.map(d => (
                <span key={d.class} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-white/[0.06]">
                  Clase {d.class}: <strong className="text-cyan-300">{d.count}</strong>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30"
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            Recalcular Sugerencias IA
          </button>
        </div>
      </div>

      {/* Grid de 4 Resúmenes de Decisión */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Compras Urgentes</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{criticalCount}</span>
            <span className="text-xs text-slate-400">productos</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Riesgo inminente de quiebre</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Unidades a Pedir</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{totalUnitsToBuy}</span>
            <span className="text-xs text-slate-400">unidades totales</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block font-mono">Calculado con modelo EOQ</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Presupuesto Estimado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3.5">
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${totalRecommendedCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Inversión requerida sugerida</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Sobreinventario</span>
            <PackageX className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-300 font-mono">{overstockCount}</span>
            <span className="text-xs text-slate-400">productos</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Capital inmovilizado excesivo</span>
        </div>
      </div>

      {/* Tabla Principal de Recomendaciones */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Matriz Prescriptiva de Reabastecimiento
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Listado inteligente de acciones preventivas ordenadas por prioridad de negocio.</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            {recommendations.length} Dispositivos Evaluados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Dispositivo</th>
                <th className="py-3.5 px-4">Clasificación ABC</th>
                <th className="py-3.5 px-4">Stock Actual</th>
                <th className="py-3.5 px-4">Demanda ML (30d)</th>
                <th className="py-3.5 px-4">Sugerencia de Pedido</th>
                <th className="py-3.5 px-4">Costo Estimado</th>
                <th className="py-3.5 px-4">Tipo de Acción</th>
                <th className="py-3.5 px-4">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {recommendations.map((r) => (
                <tr key={r.product_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{r.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{r.sku} • {r.brand}</span>
                  </td>
                  <td className="py-3.5 px-4">{getAbcBadge(r.abc_class)}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white">{r.current_stock}</span> uds
                    <span className="block text-[10px] text-slate-400 mt-0.5">Reorden: {r.reorder_point} uds</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{r.predicted_demand_30d} uds</td>
                  <td className="py-3.5 px-4 font-mono">
                    {r.recommended_quantity > 0 ? (
                      <span className="font-extrabold text-emerald-400">+{r.recommended_quantity} uds</span>
                    ) : (
                      <span className="text-slate-400">0 uds</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white font-semibold">
                    ${r.estimated_purchase_cost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">{getPriorityBadge(r.recommendation_type)}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedRec(r)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-white/[0.08] transition-colors inline-flex items-center gap-1"
                    >
                      <Info className="w-3 h-3 text-cyan-400" />
                      Auditar Razón
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Explicación de IA & EOQ */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-lg w-full space-y-5 border border-cyan-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  AUDITORÍA EXPLICATIVA IA
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">{selectedRec.name}</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-white/[0.06]">
              <p className="font-semibold text-white">{selectedRec.explanation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px]">Punto de Reorden:</span>
                <span className="font-bold text-white text-sm">{selectedRec.reorder_point} uds</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px]">Stock de Seguridad:</span>
                <span className="font-bold text-white text-sm">{selectedRec.safety_stock} uds</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px]">Lote Óptimo EOQ:</span>
                <span className="font-bold text-cyan-300 text-sm">{selectedRec.eoq_quantity} uds</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px]">Lead Time Proveedor:</span>
                <span className="font-bold text-white text-sm">{selectedRec.lead_time_days} días</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
