'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Cpu,
  Boxes,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('eduardo.lopez@gotech.com');
  const [password, setPassword] = useState('••••••••••••');
  const [branch, setBranch] = useState('matriz');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  const setRolePreset = (presetEmail: string, branchName: string) => {
    setEmail(presetEmail);
    setBranch(branchName);
  };

  return (
    <div className="min-h-screen w-full bg-[#080D1D] text-slate-100 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Luces Flotantes Vivas & Espectro Aurora (GPU-Accelerated Vivid Mesh) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Luz 1: Cian Eléctrico Intenso */}
        <div className="absolute -top-24 -left-20 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-400/50 via-sky-500/35 to-transparent blur-[85px] animate-aurora-1 mix-blend-screen"></div>

        {/* Luz 2: Índigo & Violeta Neón Radiante (Detrás del Login) */}
        <div className="absolute top-1/6 -right-24 w-[780px] h-[780px] rounded-full bg-gradient-to-tr from-indigo-500/55 via-purple-600/40 to-fuchsia-500/20 blur-[90px] animate-aurora-2 mix-blend-screen"></div>

        {/* Luz 3: Esmeralda & Turquesa Viva */}
        <div className="absolute -bottom-36 left-1/4 w-[680px] h-[680px] rounded-full bg-gradient-to-tl from-emerald-400/35 via-teal-500/30 to-cyan-500/20 blur-[80px] animate-aurora-3 mix-blend-screen"></div>

        {/* Luz 4: Núcleo Azul Zafiro Central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-cyan-500/20 blur-[100px] animate-aurora-4 mix-blend-screen"></div>

        {/* Malla Tecnológica de Micro-Puntos Translúcidos */}
        <div className="absolute inset-0 bg-dot-grid opacity-35"></div>
      </div>

      {/* Columna Izquierda: Hero Corporativo & Value Proposition con Espaciado Armónico */}
      <div className="lg:w-7/12 relative p-8 lg:p-14 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.1] z-10">
        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-300/50 transform hover:scale-105 transition-transform duration-300">
              <span className="font-black text-white text-xl tracking-tighter drop-shadow-md">GT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                  GO TECH™
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.35)]">
                  ENTERPRISE AI
                </span>
              </div>
              <span className="text-xs text-slate-300 font-medium block mt-0.5">
                Supply Chain & Demand Intelligence Suite
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium bg-slate-900/40 border border-white/[0.1] px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cluster Matriz Online</span>
          </div>
        </div>

        {/* Central Value Proposition - Espacio Optimizado y Relleno Armónico */}
        <div className="my-auto py-8 relative z-10 max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Sistema Logístico Empresarial Listo para Producción</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-5xl font-black tracking-tight text-white leading-[1.15] drop-shadow-lg">
              Predicción de demanda y control logístico asistido por{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Machine Learning
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl drop-shadow-sm text-justify hyphens-auto">
              Optimiza existencias, automatiza puntos de reorden y elimina quiebres de stock en el catálogo comercial de tecnología móvil con modelos estadísticos de regresión y series temporales auditados.
            </p>
          </div>

          {/* Tarjetas de Capacidades del Sistema - Rellenando el Espacio con Justificación y Diseño */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Capacidad 1 */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl backdrop-blur-2xl border border-white/[0.14] bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    ML ENGINE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Inferencia Predictiva</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Proyecciones multi-horizonte (7 a 90 días) con modelos autorregresivos calibrados.
                </p>
              </div>
            </div>

            {/* Capacidad 2 */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl backdrop-blur-2xl border border-white/[0.14] bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    SMART EOQ
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Control Logístico EOQ</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Cálculo autónomo de puntos de reorden, stock de seguridad y lote económico.
                </p>
              </div>
            </div>

            {/* Capacidad 3 */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl backdrop-blur-2xl border border-white/[0.14] bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    AUDIT READY
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">Auditoría & Kardex</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Trazabilidad inmutable de compras, ventas y conciliación de stock en almacén.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer con Espacio Adecuado */}
        <div className="relative z-10 pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encriptación TLS 1.3 • Base de Datos MySQL 8.0 • MLOps Activo</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            Build v2.4.0 (Enterprise)
          </span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Autenticación Corporativa Translúcido */}
      <div className="lg:w-5/12 p-8 lg:p-14 xl:p-16 flex flex-col justify-center relative z-10">
        <div className="max-w-md w-full mx-auto space-y-7 glass-card rounded-3xl p-8 border border-white/[0.16] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-slate-900/45 relative overflow-hidden">
          {/* Specular Top Line Highlight Luminosa */}
          <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              Acceso a la Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Ingresa tus credenciales autorizadas por la Dirección de Operaciones.
            </p>
          </div>

          {/* Role Presets */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.1] space-y-2.5 backdrop-blur-md">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Roles Corporativos Autorizados:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRolePreset('eduardo.lopez@gotech.com', 'matriz')}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.1] hover:border-cyan-400/60 text-left transition-all group hover:bg-slate-800/90 shadow-sm"
              >
                <span className="text-xs font-bold text-white block group-hover:text-cyan-300">Director Operaciones</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Eduardo López</span>
              </button>
              <button
                type="button"
                onClick={() => setRolePreset('analista.logistica@gotech.com', 'norte')}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.1] hover:border-sky-400/60 text-left transition-all group hover:bg-slate-800/90 shadow-sm"
              >
                <span className="text-xs font-bold text-white block group-hover:text-sky-300">Analista de Stock</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Hub Mayorista</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">Correo Electrónico Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium shadow-inner placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">Contraseña</label>
                <span className="text-[11px] text-cyan-300 hover:text-cyan-200 hover:underline cursor-pointer font-medium">¿Olvidaste tu clave?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">Sede / Centro de Distribución</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium appearance-none shadow-inner"
                >
                  <option value="matriz">GO TECH S.A. — Matriz Hub Central</option>
                  <option value="norte">Centro de Distribución Norte</option>
                  <option value="sur">Bodega Regional Sur</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] border border-cyan-300/40"
            >
              {loading ? (
                <span>Validando Credenciales...</span>
              ) : (
                <>
                  <span>Iniciar Sesión en Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
