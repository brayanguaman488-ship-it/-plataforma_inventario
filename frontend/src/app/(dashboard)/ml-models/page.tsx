'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckCircle2,
  Award,
  Activity,
  Zap
} from 'lucide-react';

interface ModelResult {
  algorithm: string;
  version?: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  status: string;
  training_date?: string;
  feature_importance?: Record<string, number>;
}

interface TrainingResponse {
  status: string;
  champion_model: string;
  champion_r2_score: number;
  total_models_evaluated: number;
  leaderboard: ModelResult[];
  dataset_info: {
    train_samples: number;
    test_samples: number;
    features_used: string[];
  };
}

export default function MLModelsPage() {
  const [leaderboard, setLeaderboard] = useState<ModelResult[]>([]);
  const [champion, setChampion] = useState<ModelResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingSuccessMsg, setTrainingSuccessMsg] = useState<string>('');

  const fetchModelsData = async () => {
    try {
      setLoading(true);
      const [resModels, resChamp] = await Promise.all([
        fetch('/api/v1/ml/models'),
        fetch('/api/v1/ml/champion')
      ]);

      if (resModels.ok) {
        const data = await resModels.json();
        setLeaderboard(data);
      }
      if (resChamp.ok) {
        const champData = await resChamp.json();
        setChampion(champData);
      }
    } catch (err) {
      console.error('Error fetching ML models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelsData();
  }, []);

  const handleRunTraining = async () => {
    setTrainingLoading(true);
    setTrainingSuccessMsg('');
    try {
      const res = await fetch('/api/v1/ml/train', {
        method: 'POST'
      });
      if (res.ok) {
        const result: TrainingResponse = await res.json();
        setTrainingSuccessMsg(`Entrenamiento completado con éxito. Se evaluaron ${result.total_models_evaluated} modelos. Modelo campeón seleccionado: ${result.champion_model}.`);
        fetchModelsData();
      } else {
        const err = await res.json();
        alert(`Error al entrenar modelos: ${err.detail || 'Fallo en pipeline'}`);
      }
    } catch {
      alert('Error de conexión con el servidor.');
    } finally {
      setTrainingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-3" />
        Consultando registro MLOps y métricas de validación cruzada...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              MLOPS GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Gobernanza & Experimentación de Modelos ML
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Pipeline automatizado de entrenamiento, evaluación con Time-Series Split y selección del modelo campeón para inferencia.
          </p>
        </div>

        <button
          onClick={handleRunTraining}
          disabled={trainingLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] border border-cyan-400/30 disabled:opacity-50"
        >
          {trainingLoading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Entrenando & Evaluando Algoritmos...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-cyan-300" />
              Re-entrenar Pipeline ML
            </>
          )}
        </button>
      </div>

      {trainingSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{trainingSuccessMsg}</span>
        </div>
      )}

      {/* Card del Modelo Campeón en Producción */}
      {champion && (
        <div className="glass-card specular-border rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#0D1424] via-[#10182E] to-[#0A0F1C] border border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.15)]">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Modelo Campeón Activo en Producción
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {champion.algorithm}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Seleccionado de forma autónoma por obtener el menor RMSE y mayor capacidad de generalización sobre la demanda mayorista de GO TECH.
              </p>
            </div>

            {/* Grid de Métricas del Campeón */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coef. R²</span>
                <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                  {champion.r2.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400">Score de ajuste</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RMSE</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {champion.rmse.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400">Error cuadrático</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MAE</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {champion.mae.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400">Error absoluto</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado</span>
                <span className="text-sm font-black text-emerald-400 font-mono mt-2 block flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  EN LÍNEA
                </span>
                <span className="text-[10px] text-slate-400">Serving Live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Comparativo de Modelos */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Leaderboard de Algoritmos Evaluados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ranking de modelos según evaluación rigurosa con TimeSeriesSplit.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-white/[0.08] px-3 py-1 rounded-full">
            4 Modelos en Benchmark
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Posición / Algoritmo</th>
                <th className="py-3.5 px-4">R² Score</th>
                <th className="py-3.5 px-4">RMSE</th>
                <th className="py-3.5 px-4">MAE</th>
                <th className="py-3.5 px-4">MSE</th>
                <th className="py-3.5 px-4">Rol en Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {leaderboard.map((m, idx) => (
                <tr key={m.algorithm} className={`hover:bg-white/[0.02] transition-colors font-mono ${m.status === 'champion' ? 'bg-cyan-500/[0.03]' : ''}`}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white">{m.algorithm}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{m.r2.toFixed(4)}</td>
                  <td className="py-3.5 px-4 text-white font-semibold">{m.rmse.toFixed(4)}</td>
                  <td className="py-3.5 px-4 text-slate-400">{m.mae.toFixed(4)}</td>
                  <td className="py-3.5 px-4 text-slate-400">{m.mse.toFixed(4)}</td>
                  <td className="py-3.5 px-4">
                    {m.status === 'champion' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <Trophy className="w-3 h-3 text-cyan-400" />
                        CAMPEÓN (Inferencia)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        Candidato Evaluado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
