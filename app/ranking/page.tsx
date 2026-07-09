import { getPredicciones, getResultado } from "@/lib/data";
import { construirRanking } from "@/lib/scoring";
import RankingTable from "@/components/RankingTable";
import PodiumCard from "@/components/PodiumCard";
import RankingBarChart from "@/components/charts/RankingBarChart";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const predicciones = await getPredicciones();
  const resultado = await getResultado();
  const ranking = construirRanking(predicciones, resultado);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Ranking General</h1>
        <a href="/api/export" className="btn-secondary">
          <Download size={16} />
          Exportar a Excel
        </a>
      </div>

      {ranking.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">Aún no hay predicciones registradas.</div>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">🥇🥈🥉 Podio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ranking.slice(0, 3).map((r) => (
                <PodiumCard
                  key={r.usuario}
                  posicion={r.posicion}
                  usuario={r.usuario}
                  emoji={r.emoji}
                  puntaje={r.puntajeTotal}
                />
              ))}
            </div>
          </div>

          <RankingTable ranking={ranking} />

          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Leaderboard Completo
            </h2>
            <RankingBarChart
              data={ranking
                .map((r) => ({ usuario: `${r.emoji ? r.emoji + " " : ""}${r.usuario}`, puntaje: r.puntajeTotal }))
                .reverse()}
            />
          </div>
        </>
      )}
    </div>
  );
}
