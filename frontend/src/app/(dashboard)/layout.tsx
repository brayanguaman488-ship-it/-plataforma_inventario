'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  Package,
  Receipt,
  BellRing,
  FileSpreadsheet,
  Microscope,
  Cpu,
  LineChart,
  Lightbulb,
  LogOut,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  tagColor?: string;
  isAi?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard Ejecutivo', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Catálogo de Dispositivos', href: '/products', icon: Smartphone },
  { name: 'Inventario & Kardex', href: '/inventory', icon: Package },
  { name: 'Ventas & Facturación', href: '/sales', icon: Receipt },
  { name: 'Centro de Alertas', href: '/alerts', icon: BellRing, tag: '50 Alertas', tagColor: 'amber' },
  { name: 'Reportes & Auditoría', href: '/reports', icon: FileSpreadsheet },
  // Sección IA
  { name: 'Analítica Exploratoria (EDA)', href: '/analytics', icon: Microscope, isAi: true },
  { name: 'Gobernanza de Modelos ML', href: '/ml-models', icon: Cpu, isAi: true, tag: 'Champion', tagColor: 'cyan' },
  { name: 'Predicción de Demanda', href: '/predictions', icon: LineChart, isAi: true },
  { name: 'Recomendaciones IA & EOQ', href: '/recommendations', icon: Lightbulb, isAi: true, tag: 'Smart EOQ', tagColor: 'emerald' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const d = new Date();
    setCurrentDate(d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
  }, []);

  const operationalNav = navItems.filter(i => !i.isAi);
  const aiNav = navItems.filter(i => i.isAi);

  return (
    <div className="flex h-screen bg-[#06080F] text-slate-100 font-sans antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Corporativo Ultra-Premium */}
      <aside className="w-72 bg-[#0A0E18]/90 border-r border-white/[0.07] flex flex-col shrink-0 backdrop-blur-2xl z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between h-20 bg-gradient-to-b from-white/[0.03] to-transparent">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40 group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-white text-base tracking-tighter">GT</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent block">
                  GO TECH™
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 block tracking-tight">
                Enterprise Intelligence
              </span>
            </div>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PROD
          </span>
        </div>

        {/* Organization / Tenant Switcher */}
        <div className="px-3.5 py-2.5 mx-3 mt-3 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-200 block truncate max-w-[150px]">GO TECH S.A. Matriz</span>
              <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-wider">Hub Mayorista Latam</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            #01
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Módulo Operacional */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Gestión Operacional
            </span>
            {operationalNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-blue-600/25 font-bold border border-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      item.tagColor === 'amber'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Módulo Machine Learning & IA */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Inteligencia Artificial & MLOps
            </span>
            {aiNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 via-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-indigo-600/25 font-bold border border-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-cyan-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      item.tagColor === 'cyan'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer del Usuario & Conexión */}
        <div className="p-4 border-t border-white/[0.07] bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-cyan-600/20">
                EL
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 block">Eduardo López</span>
                <span className="text-[10px] text-cyan-400 font-semibold block">Dir. de Operaciones</span>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 relative" title="Conexión MySQL & ML Activa">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión Corporativa
          </Link>
        </div>
      </aside>

      {/* Área Principal de Contenido (Full Fluid Width) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#06080F] overflow-hidden relative">
        {/* Ambient Top Glow Mesh */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none"></div>

        {/* Top Header Navbar */}
        <header className="h-20 bg-[#0A0E18]/60 border-b border-white/[0.07] backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar SKU, dispositivo o transacción... (Ctrl+K)"
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-white/[0.08] pl-4">
              <span className="text-[11px] font-semibold text-slate-400">Cluster:</span>
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                Latam North-1 (Production)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentDate && (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline capitalize">
                {currentDate}
              </span>
            )}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Base MySQL & Modelo ML Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative z-10">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
