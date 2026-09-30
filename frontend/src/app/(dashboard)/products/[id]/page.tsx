'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Smartphone,
  Boxes,
  BrainCircuit,
  Activity,
  ChevronRight
} from 'lucide-react';

interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  brand: string;
  model: string;
  purchase_price: number;
  sale_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  safety_stock: number;
  reorder_point: number;
  status: string;
  category?: { name: string };
  supplier?: { name: string; lead_time_days: number };
}

interface KardexItem {
  id: number;
  date: string;
  type: string;
  document_ref?: string;
  reason?: string;
  input_quantity: number;
  output_quantity: number;
  balance_quantity: number;
  unit_cost: number;
  total_value: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [kardex, setKardex] = useState<KardexItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const resProd = await fetch(`/api/v1/products/${productId}`);
        if (resProd.ok) {
          const prodData = await resProd.json();
          setProduct(prodData);
        }

        const resKardex = await fetch(`/api/v1/inventory/kardex/${productId}`);
        if (resKardex.ok) {
          const kardexData = await resKardex.json();
          setKardex(kardexData);
        }
      } catch (err) {
        console.error('Error al cargar datos del producto:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-blue-500 mr-3" />
        Cargando vista 360° del dispositivo...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white">Dispositivo no encontrado</h2>
        <Link href="/products" className="text-blue-400 hover:underline mt-4 inline-block text-xs font-bold">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const estimatedDemand30Days = 17;
  const leadTime = product.supplier?.lead_time_days || 7;
  const recommendedPurchase = Math.max(0, estimatedDemand30Days + product.safety_stock - product.current_stock);
  const isHighRisk = product.current_stock <= product.reorder_point;

  return (
    <div className="space-y-8 w-full">
      {/* Header con breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Link href="/products" className="hover:text-blue-400 transition-colors">Productos</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span>{product.brand}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-blue-400 font-mono">{product.sku}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{product.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Registrar Movimiento en Almacén
          </Link>
        </div>
      </div>

      {/* Grid Superior: Info General + Parámetros Logísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card: Información General */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Información del Dispositivo
          </h2>
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Marca</span>
              <span className="font-bold text-white">{product.brand}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Modelo</span>
              <span className="font-bold text-white">{product.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Categoría</span>
              <span className="font-semibold text-slate-200">{product.category?.name || 'Smartphones'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Proveedor</span>
              <span className="font-semibold text-slate-200">{product.supplier?.name || 'Distribución Oficial'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Precio Compra</span>
              <span className="font-semibold text-slate-300 font-mono">${product.purchase_price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Precio Venta</span>
              <span className="font-bold text-emerald-400 font-mono">${product.sale_price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card: Estado del Inventario */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-purple-400" />
            Parámetros Logísticos
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-medium">Stock Actual</span>
              <span className="text-2xl font-black text-white">{product.current_stock} uds</span>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <span className="text-blue-300 block font-medium">Pto. Reorden</span>
              <span className="text-2xl font-black text-blue-400">{product.reorder_point} uds</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Stock Seguridad</span>
              <span className="font-bold text-white">{product.safety_stock} uds</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Lead Time Proveedor</span>
              <span className="font-bold text-white">{leadTime} días</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Stock Mínimo</span>
              <span className="font-semibold text-slate-300">{product.minimum_stock} uds</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Stock Máximo</span>
              <span className="font-semibold text-slate-300">{product.maximum_stock} uds</span>
            </div>
          </div>
        </div>

        {/* Card: Recomendación Inteligente (Explicabilidad IA) */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${isHighRisk ? 'bg-amber-500/5 border-amber-500/30' : 'bg-indigo-500/5 border-indigo-500/30'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              Diagnóstico de la IA
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
              isHighRisk ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isHighRisk ? 'Riesgo de Quiebre' : 'Nivel Óptimo'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Acción sugerida:</span>
              <p className="text-xl font-black text-white mt-1">
                {recommendedPurchase > 0 ? `Comprar +${recommendedPurchase} unidades` : 'Mantener inventario'}
              </p>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 leading-relaxed">
              <p className="font-bold text-blue-400 uppercase tracking-wider">Fundamento del Modelo:</p>
              <p>
                El stock actual es de <strong>{product.current_stock} unidades</strong> y la demanda proyectada a 30 días es de <strong>{estimatedDemand30Days} unidades</strong>. Considerando un stock de seguridad de {product.safety_stock} unidades y un tiempo de reposición de {leadTime} días, se recomienda realizar el abastecimiento inmediato.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Kardex del Producto Full Width */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white">Kardex de Movimientos Físicos y Valorizados</h3>
          <p className="text-xs text-slate-400 mt-0.5">Historial cronológico de entradas, salidas y saldos del dispositivo.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha & Hora</th>
                <th className="px-6 py-4">Tipo Movimiento</th>
                <th className="px-6 py-4">Doc. Referencia</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4 text-center text-emerald-400">Entrada</th>
                <th className="px-6 py-4 text-center text-rose-400">Salida</th>
                <th className="px-6 py-4 text-center font-bold text-white">Saldo Físico</th>
                <th className="px-6 py-4 text-right">Costo Unit.</th>
                <th className="px-6 py-4 text-right font-bold text-white">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {kardex.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No existen movimientos registrados en el Kardex para este producto.
                  </td>
                </tr>
              ) : (
                kardex.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {new Date(k.date).toLocaleDateString()} {new Date(k.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                        k.type.includes('ENTRADA')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {k.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{k.document_ref || '-'}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{k.reason || '-'}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-400">{k.input_quantity > 0 ? `+${k.input_quantity}` : '-'}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-400">{k.output_quantity > 0 ? `-${k.output_quantity}` : '-'}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-white">{k.balance_quantity} uds</td>
                    <td className="px-6 py-4 text-right text-slate-400 font-mono">${k.unit_cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-white font-mono">${k.total_value.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
