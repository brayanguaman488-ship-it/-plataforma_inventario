'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  Activity,
  Check
} from 'lucide-react';

interface AlertItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_sku: string;
  alert_type: string;
  severity: string; // CRITICA, ALTA, MEDIA, INFORMATIVA
  message: string;
  status: string;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('TODAS');
  const [resolvedMsg, setResolvedMsg] = useState<string>('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/alerts/');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (alertId: number) => {
    try {
      const res = await fetch(`/api/v1/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        setResolvedMsg('Alerta marcada como resuelta.');
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch {
      alert('Error al resolver alerta.');
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'TODAS') return true;
    return a.severity === severityFilter;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
            <AlertOctagon className="w-3.5 h-3.5" /> Crítica
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Alta
          </span>
        );
      case 'MEDIA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Media
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 font-mono">
            <Info className="w-3.5 h-3.5" /> Informativa
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Sincronizando telemetría de alertas y quiebres de stock...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              REAL-TIME RISK SURVEILLANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Centro de Alertas & Telemetría de Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Vigilancia continua de umbrales críticos de seguridad, quiebres de stock y desviaciones de demanda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30">
            {alerts.length} Alertas Activas
          </span>
        </div>
      </div>

      {resolvedMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{resolvedMsg}</span>
          </div>
          <button onClick={() => setResolvedMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filtros de Severidad con Taste Styling */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filtrar Severidad:
        </span>
        {['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'INFORMATIVA'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === sev
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500 text-sm">
            No hay alertas activas en esta categoría.
          </div>
        ) : (
          filteredAlerts.map((a) => (
            <div
              key={a.id}
              className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:scale-[1.005] ${
                a.severity === 'CRITICA' ? 'border-rose-500/30 bg-rose-950/10' :
                a.severity === 'ALTA' ? 'border-amber-500/30 bg-amber-950/10' : ''
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(a.severity)}
                  <span className="text-sm font-bold text-white">{a.product_name}</span>
                  <span className="text-xs font-mono text-slate-400">[{a.product_sku}]</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {a.message}
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Registrada el {new Date(a.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleResolveAlert(a.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-bold border border-white/[0.08] transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Marcar Resuelta
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
