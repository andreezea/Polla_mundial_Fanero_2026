import { getPartidos, getPredicciones, getResultado } from "@/lib/data";
import { calcularPuntajeUsuario } from "@/lib/scoring";
import { SLOT_IDS } from "@/lib/types";
import VisualizacionesClient from "@/components/VisualizacionesClient";

export const dynamic = "force-dynamic";

export default function VisualizacionesPage() {
  const partidos = getPartidos();
  const predicciones = getPredicciones();
  const resultado = getResultado();

  const usuarios = predicciones.map((p) => p.usuario);

  const etiquetasEtapa: Record<1 | 2 | 3, string> = {
    1: "Tras Cuartos",
    2: "Tras Semifinal",
    3: "Tras Final",
  };

  const evolutionData = ([1, 2, 3] as const).map((etapaN) => {
    const fila: Record<string, string | number> = { etapa: etiquetasEtapa[etapaN] };
    predicciones.forEach((pred) => {
      const det = calcularPuntajeUsuario(pred, resultado, etapaN);
      fila[pred.usuario] = det.puntaje;
    });
    return fila;
  });

  const distribuciones = SLOT_IDS.map((slotId) => {
    const partido = partidos.find((p) => p.id === slotId)!;
    const titulo = partido.equipo1 && partido.equipo2 ? `${partido.equipo1} vs ${partido.equipo2}` : slotId.toUpperCase();

    const conteo: Record<string, number> = {};
    predicciones.forEach((pred) => {
      const g = pred.picks[slotId]?.ganador;
      if (g) conteo[g] = (conteo[g] ?? 0) + 1;
    });

    return {
      slotId,
      etapa: partido.etapa,
      titulo,
      data: Object.entries(conteo).map(([equipo, predicciones]) => ({ equipo, predicciones })),
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
