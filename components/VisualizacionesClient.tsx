"use client";

import { useMemo, useState } from "react";
import EvolutionLineChart from "@/components/charts/EvolutionLineChart";
import DistributionPieChart from "@/components/charts/DistributionPieChart";

interface DistribucionSlot {
  slotId: string;
  etapa: "Cuartos de Final" | "Semifinal" | "Final";
  titulo: string;
  data: { equipo: string; predicciones: number }[];
}

interface VisualizacionesClientProps {
  evolutionData: Record<string, string | number>[];
  usuarios: string[];
  distribuciones: DistribucionSlot[];
}

const ETAPAS = ["Todas", "Cuartos de Final", "Semifinal", "Final"] as const;

export default function VisualizacionesClient({
  evolutionData,
  usuarios,
  distribuciones,
}: VisualizacionesClientProps) {
  const [etapaFiltro, setEtapaFiltro] = useState<(typeof ETAPAS)[number]>("Todas");

  const distribucionesFiltradas = useMemo(
    () => (etapaFiltro === "Todas" ? distribuciones : distribuciones.filter((d) => d.etapa === etapaFiltro)),
    [distribuciones, etapaFiltro]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-300">
          📈 Evolución de puntos por jugador
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Puntaje acumulado a medida que se resuelven las etapas: Cuartos → Semifinal → Final.
        </p>
        <EvolutionLineChart data={evolutionData} usuarios={usuarios} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            🥧 Distribución de predicciones
          </h2>
          <select
            value={etapaFiltro}
            onChange={(e) => setEtapaFiltro(e.target.value as (typeof ETAPAS)[number])}
            className="input-field w-52"
          >
            {ETAPAS.map((et) => (
              <option key={et} value={et}>
                {et}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {distribucionesFiltradas.map((d) => (
            <DistributionPieChart key={d.slotId} title={d.titulo} data={d.data} />
          ))}
        </div>
      </div>
    </div>
  );
}
