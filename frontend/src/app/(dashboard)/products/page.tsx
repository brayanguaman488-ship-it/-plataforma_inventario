'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Activity,
  ChevronDown
} from 'lucide-react';

interface Product {
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
  supplier?: { name: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand: 'Apple',
    model: '',
    category_id: 1,
    supplier_id: 1,
    purchase_price: 0,
    sale_price: 0,
    current_stock: 0,
    minimum_stock: 5,
    maximum_stock: 50,
    safety_stock: 5,
    reorder_point: 10
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/products/');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'No se pudo crear el producto'}`);
      }
    } catch {
      alert('Error de conexión con el backend.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
            <CheckCircle className="w-3.5 h-3.5" /> Disponible
          </span>
        );
      case 'Stock Bajo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Stock Bajo
          </span>
        );
      case 'Agotado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/25 font-mono">
            <AlertOctagon className="w-3.5 h-3.5" /> Agotado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 font-mono">
            {status}
          </span>
        );
    }
  };

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === '' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Consultando catálogo de dispositivos móviles GO TECH...
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
              HARDWARE CATALOG MASTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Catálogo de Dispositivos Móviles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestión integral de smartphones, tablets y accesorios inteligentes auditados en inventario.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Dispositivo
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros con Taste Styling */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo, SKU o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-white/[0.08] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-white/[0.08] rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none shadow-inner"
            >
              <option value="">Todas las Marcas</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-2 rounded-xl border border-cyan-500/20 whitespace-nowrap">
            {filteredProducts.length} Dispositivos
          </span>
        </div>
      </div>

      {/* Tabla de Productos con Estilo Glassmorphic */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Dispositivo / SKU</th>
                <th className="py-3.5 px-4">Marca & Modelo</th>
                <th className="py-3.5 px-4">Precio Compra</th>
                <th className="py-3.5 px-4">Precio Venta</th>
                <th className="py-3.5 px-4">Stock Actual</th>
                <th className="py-3.5 px-4">Pto. Reorden</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{p.sku}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {p.brand} {p.model}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    ${Number(p.purchase_price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${Number(p.sale_price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-cyan-300">{p.current_stock}</span> uds
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {p.reorder_point} uds
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(p.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      Ver Ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-xl w-full space-y-5 border border-cyan-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  ALTA EN INVENTARIO
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">Registrar Dispositivo Móvil</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">SKU Único:</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="IPHONE-16-128"
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Marca:</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre Comercial del Dispositivo:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 16 Pro 128GB Black Titanium"
                  className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Precio Compra:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Precio Venta:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Stock Inicial:</label>
                  <input
                    type="number"
                    required
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pto. Reorden:</label>
                  <input
                    type="number"
                    required
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/25"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
