import { Users, TrendingUp, Trophy, Target } from "lucide-react";
import { getPredicciones, getResultado } from "@/lib/data";
import { construirRanking } from "@/lib/scoring";
import KpiCard from "@/components/KpiCard";
import LeaderBanner from "@/components/LeaderBanner";
import RankingBarChart from "@/components/charts/RankingBarChart";
import RankingTable from "@/components/RankingTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const predicciones = await getPredicciones();
  const resultado = await getResultado();
  const ranking = construirRanking(predicciones, resultado);

  const totalJugadores = ranking.length;
  const promedioPuntos = totalJugadores
    ? Math.round((ranking.reduce((acc, r) => acc + r.puntajeTotal, 0) / totalJugadores) * 10) / 10
    : 0;
  const partidosConResultado = Object.values(resultado.picks).filter((p) => p?.ganador).length;
  const lider = ranking[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title">Resumen Ejecutivo</h1>
      </div>

      {totalJugadores === 0 ? (
        <div className="card p-8 text-center text-slate-400">
          Aún no hay predicciones registradas.{" "}
          <Link href="/predicciones" className="text-gold underline">
            Registra la primera predicción
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Users} label="Total Jugadores" value={totalJugadores} />
            <KpiCard icon={TrendingUp} label="Promedio de Puntos" value={promedioPuntos} />
            <KpiCard icon={Target} label="Partidos con Resultado" value={`${partidosConResultado} / 7`} />
            <KpiCard icon={Trophy} label="Puntaje Máximo" value={lider?.puntajeTotal ?? 0} />
          </div>

          {lider && (
            <LeaderBanner
              usuario={lider.usuario}
              emoji={lider.emoji}
              puntaje={lider.puntajeTotal}
              pctAciertos={lider.pctAciertos}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <RankingTable ranking={ranking} mostrarFiltro />
            </div>
            <div className="lg:col-span-2 card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                Top 5 Jugadores
              </h2>
              <RankingBarChart
                data={ranking
                  .slice(0, 5)
                  .map((r) => ({ usuario: `${r.emoji ? r.emoji + " " : ""}${r.usuario}`, puntaje: r.puntajeTotal }))
                  .reverse()}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
