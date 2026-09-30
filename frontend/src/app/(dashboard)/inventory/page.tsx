'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  current_stock: number;
  purchase_price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [movementType, setMovementType] = useState<string>('ENTRADA');
  const [quantity, setQuantity] = useState<number>(1);
  const [documentRef, setDocumentRef] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/v1/products/');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await fetch('/api/v1/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProductId,
          type: movementType,
          quantity: parseInt(quantity.toString()),
          document_ref: documentRef || undefined,
          reason: reason || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Movimiento registrado con éxito. Nuevo stock: ${data.new_stock} unidades.`);
        setQuantity(1);
        setDocumentRef('');
        setReason('');
        fetchProducts();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'No se pudo registrar el movimiento'}`);
      }
    } catch {
      alert('Error de conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              PHYSICAL WAREHOUSE LOGISTICS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Gestión de Inventario & Kardex
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Registro auditable de entradas de importación, salidas operativas y ajustes físicos en almacén central.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Formulario de Registro + Resumen del Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Movimiento */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Nuevo Registro en Kardex
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ingresa los datos del movimiento físico.</p>
          </div>

          <form onSubmit={handleRegisterMovement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                Dispositivo Móvil:
              </label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-white font-medium focus:ring-2 focus:ring-cyan-500 appearance-none shadow-inner"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} — Stock: {p.current_stock} uds
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Tipo de Movimiento:
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-white font-bold"
                >
                  <option value="ENTRADA">📥 ENTRADA (Recepción / Compra)</option>
                  <option value="SALIDA">📤 SALIDA (Venta / Despacho)</option>
                  <option value="AJUSTE_POSITIVO">➕ AJUSTE POSITIVO</option>
                  <option value="AJUSTE_NEGATIVO">➖ AJUSTE NEGATIVO (Merma)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Cantidad de Unidades:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Nº Documento / Factura / Guía:
                </label>
                <input
                  type="text"
                  placeholder="FAC-2026-00892"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Motivo / Observación:
                </label>
                <input
                  type="text"
                  placeholder="Lote de reposición mayorista"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30 disabled:opacity-50"
              >
                {loading ? 'Procesando en Base de Datos...' : 'Confirmar & Asentar Movimiento'}
              </button>
            </div>
          </form>
        </div>

        {/* Ficha Resumen del Producto Seleccionado */}
        {selectedProduct && (
          <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4 border border-cyan-500/20">
            <div className="border-b border-white/[0.07] pb-4">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                FICHA TÉCNICA
              </span>
              <h3 className="text-base font-black text-white mt-0.5">{selectedProduct.name}</h3>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">{selectedProduct.sku}</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400 text-xs">Stock en Almacén:</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">{selectedProduct.current_stock} uds</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400 text-xs">Precio Unitario Compra:</span>
                <span className="text-lg font-bold text-white font-mono">
                  ${Number(selectedProduct.purchase_price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400 text-xs">Valor Total en Stock:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ${(Number(selectedProduct.purchase_price) * selectedProduct.current_stock).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/products/${selectedProduct.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/[0.08] transition-colors"
              >
                Ver Kardex Completo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
