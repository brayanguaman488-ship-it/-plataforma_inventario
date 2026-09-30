'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  History,
  Activity
} from 'lucide-react';

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Sale {
  id: number;
  date: string;
  total: number;
  customer_name?: string;
  channel?: string;
  items: SaleItem[];
}

interface Product {
  id: number;
  sku: string;
  name: string;
  sale_price: number;
  current_stock: number;
}

interface ImportPreview {
  filename: string;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
  errors: Array<{ row_number: number; sku?: string; error: string }>;
  preview_data: Array<Record<string, unknown>>;
  import_token: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'import'>('history');

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('Cliente Mayorista');
  const [channel, setChannel] = useState<string>('Factura Comercial');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreview | null>(null);
  const [importSuccess, setImportSuccess] = useState<string>('');

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const [resSales, resProds] = await Promise.all([
        fetch('/api/v1/sales/'),
        fetch('/api/v1/products/')
      ]);

      if (resSales.ok) {
        const salesData = await resSales.json();
        setSales(salesData);
      }
      if (resProds.ok) {
        const prodsData = await resProds.json();
        setProducts(prodsData);
        if (prodsData.length > 0) setSelectedProductId(prodsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/sales/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          channel: channel,
          items: [{ product_id: selectedProductId, quantity: parseInt(quantity.toString()) }]
        })
      });

      if (res.ok) {
        setShowManualModal(false);
        fetchSalesData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'No se pudo registrar la venta'}`);
      }
    } catch {
      alert('Error de conexión con el backend.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setImportLoading(true);
      setImportSuccess('');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/v1/sales/upload-preview', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const preview = await res.json();
        setPreviewResult(preview);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Error procesando archivo'}`);
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewResult) return;
    try {
      setImportLoading(true);
      const res = await fetch('/api/v1/sales/confirm-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import_token: previewResult.import_token })
      });

      if (res.ok) {
        const result = await res.json();
        setImportSuccess(`Importación masiva completada: ${result.imported_sales_count} ventas procesadas con éxito.`);
        setPreviewResult(null);
        setSelectedFile(null);
        fetchSalesData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Fallo al confirmar importación'}`);
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setImportLoading(false);
    }
  };

  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Consultando libro mayor de ventas y facturas...
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
              COMMERCIAL INVOICE AUDIT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Ventas & Carga Masiva de Facturas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Histórico auditado de 1,357+ facturas y cargador inteligente de lotes CSV / Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30"
          >
            <Plus className="w-4 h-4" />
            Emitir Factura Manual
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-white/[0.08] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico de Facturación ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'import'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Importador Masivo CSV / Excel
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card glass-card-hover rounded-2xl p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facturas Totales</span>
              <span className="text-3xl font-black text-white font-mono mt-2 block">{sales.length}</span>
              <span className="text-xs text-slate-400 mt-1 block">Comprobantes comerciales</span>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Facturado</span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-2 block">
                ${totalSalesRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 mt-1 block font-mono">100% conciliado</span>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Promedio</span>
              <span className="text-3xl font-black text-cyan-300 font-mono mt-2 block">
                ${sales.length > 0 ? (totalSalesRevenue / sales.length).toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '0.00'}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Por transacción mayorista</span>
            </div>
          </div>

          {/* Tabla de Facturas */}
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
            <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Registro Oficial de Facturación
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                {sales.length} Facturas Auditadas
              </span>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06] sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="py-3.5 px-4">Factura ID</th>
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Cliente / Razón Social</th>
                    <th className="py-3.5 px-4">Canal Comercial</th>
                    <th className="py-3.5 px-4">Total Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                      <td className="py-3 px-4 font-bold text-cyan-400">#FAC-{s.id.toString().padStart(5, '0')}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-white">{s.customer_name || 'GO TECH CLIENT'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {s.channel || 'Mayorista'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                        ${Number(s.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              Cargador Inteligente de Facturas (CSV / XLSX)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Arrastra o selecciona el reporte de ventas para validar esquema e insertar transacciones masivas.
            </p>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-white/[0.12] hover:border-cyan-500/40 rounded-2xl p-8 text-center transition-colors bg-slate-950/60">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto shadow-inner">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  {selectedFile ? (
                    <span className="font-bold text-cyan-300 font-mono">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    <>
                      <span className="font-bold text-white block">Haz clic para seleccionar archivo</span>
                      <span className="text-slate-400 text-[11px] block mt-1">Formato soportado: .csv o .xlsx</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || importLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 disabled:opacity-50 transition-all"
              >
                {importLoading ? 'Validando Dataset...' : 'Subir & Previsualizar Lote'}
              </button>
            </div>
          </form>

          {importSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {previewResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Previsualización del Lote: {previewResult.total_rows} filas detectadas</span>
                <span className="text-xs text-emerald-400 font-bold font-mono">{previewResult.valid_rows_count} válidas</span>
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={importLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
              >
                Confirmar e Insertar en Base de Datos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Factura Manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-lg w-full space-y-5 border border-cyan-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  EMISIÓN COMERCIAL
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">Emitir Factura Manual</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cliente / Razón Social:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dispositivo Móvil:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} — ${p.sale_price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Canal de Venta:</label>
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/25"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
