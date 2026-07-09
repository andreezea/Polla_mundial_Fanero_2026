import { getPartidos, getPredicciones, getResultado } from "@/lib/data";
import { calcularPuntajeUsuario } from "@/lib/scoring";
import { SLOT_IDS } from "@/lib/types";
import { conBandera } from "@/lib/flags";
import VisualizacionesClient from "@/components/VisualizacionesClient";

export const dynamic = "force-dynamic";

export default async function VisualizacionesPage() {
  const partidos = getPartidos();
  const predicciones = await getPredicciones();
  const resultado = await getResultado();

  const etiqueta = (p: { usuario: string; emoji?: string | null }) =>
    p.emoji ? `${p.emoji} ${p.usuario}` : p.usuario;

  const usuarios = predicciones.map((p) => etiqueta(p));

  const etiquetasEtapa: Record<1 | 2 | 3, string> = {
    1: "Tras Cuartos",
    2: "Tras Semifinal",
    3: "Tras Final",
  };

  const evolutionData = ([1, 2, 3] as const).map((etapaN) => {
    const fila: Record<string, string | number> = { etapa: etiquetasEtapa[etapaN] };
    predicciones.forEach((pred) => {
      const det = calcularPuntajeUsuario(pred, resultado, etapaN);
      fila[etiqueta(pred)] = det.puntaje;
    });
    return fila;
  });

  const distribuciones = SLOT_IDS.map((slotId) => {
    const partido = partidos.find((p) => p.id === slotId)!;
    const titulo =
      partido.equipo1 && partido.equipo2
        ? `${conBandera(partido.equipo1)} vs ${conBandera(partido.equipo2)}`
        : slotId.toUpperCase();

    const conteo: Record<string, number> = {};
    predicciones.forEach((pred) => {
      const g = pred.picks[slotId]?.ganador;
      if (g) conteo[g] = (conteo[g] ?? 0) + 1;
    });

    return {
      slotId,
      etapa: partido.etapa,
      titulo,
      data: Object.entries(conteo).map(([equipo, predicciones]) => ({ equipo: conBandera(equipo), predicciones })),
    };
  }).filter((d) => d.data.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="section-title">Visualizaciones</h1>
      {predicciones.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">Aún no hay predicciones registradas.</div>
      ) : (
        <VisualizacionesClient evolutionData={evolutionData} usuarios={usuarios} distribuciones={distribuciones} />
      )}
    </div>
  );
}
