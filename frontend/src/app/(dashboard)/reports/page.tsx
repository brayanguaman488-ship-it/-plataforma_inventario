'use client';

import React from 'react';
import {
  Download,
  Printer,
  Boxes,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function ReportsPage() {
  const handleDownloadCsv = (type: string) => {
    window.open(`/api/v1/reports/export-csv?report_type=${type}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              AUDIT & COMPLIANCE REPORTING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Centro de Reportes & Exportación Ejecutiva
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Generación de informes para auditoría fiscal, comités de compras y abastecimiento estratégico en formatos CSV, Excel y PDF.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/[0.08] shadow-sm transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          Imprimir / Guardar en PDF
        </button>
      </div>

      {/* Grid de Reportes Descargables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reporte 1: Inventario */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl w-fit shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Auditoría de Inventario & Kardex</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catálogo completo de dispositivos, existencias en almacén, valorización monetaria, stock de seguridad y puntos de reorden por SKU.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCsv('inventory')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" /> Exportar CSV / Excel
          </button>
        </div>

        {/* Reporte 2: Ventas */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl w-fit shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Consolidado Comercial de Ventas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transacciones auditadas por fecha, cliente mayorista/retail, número de documento fiscal, ticket promedio y facturación total.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCsv('sales')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" /> Exportar CSV / Excel
          </button>
        </div>

        {/* Reporte 3: Recomendaciones IA & EOQ */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl w-fit shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Plan de Abastecimiento IA & EOQ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plan sugerido de compras con lote económico (Wilson EOQ), clasificación ABC de Pareto y justificación probabilística del modelo ML.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCsv('recommendations')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" /> Exportar CSV / Excel
          </button>
        </div>
      </div>
    </div>
  );
}
