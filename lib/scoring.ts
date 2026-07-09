// =============================================================================
// Sistema de puntaje de la Polla Mundialista 2026
//   - Acierto de ganador (cualquier partido):        +3
//   - Acierto de marcador exacto (cualquier partido): +5 (además del ganador)
//   - Acierto de finalista (cada uno, hasta 2):        +2
//   - Acierto del campeón:                            +10
// =============================================================================

import { Prediccion, RankingRow, Resultado, SlotId, SF_SLOTS, QF_SLOTS } from "./types";

export const PTS_GANADOR = 3;
export const PTS_MARCADOR = 5;
export const PTS_FINALISTA = 2;
export const PTS_CAMPEON = 10;

const TOTAL_PARTIDOS = 7; // qf1-4, sf1-2, final

interface MatchScore {
  puntos: number;
  aciertoGanador: boolean;
  aciertoMarcador: boolean;
}

function puntajePartido(
  pred: { ganador: string | null; golesLocal: number | null; golesVisitante: number | null } | undefined,
  real: { ganador: string | null; golesLocal: number | null; golesVisitante: number | null } | undefined
): MatchScore {
  let puntos = 0;
  let aciertoGanador = false;
  let aciertoMarcador = false;

  if (!pred || !real || !real.ganador) {
    return { puntos, aciertoGanador, aciertoMarcador };
  }

  if (pred.ganador && pred.ganador === real.ganador) {
    puntos += PTS_GANADOR;
    aciertoGanador = true;
  }

  if (
    pred.golesLocal !== null &&
    pred.golesVisitante !== null &&
    real.golesLocal !== null &&
    real.golesVisitante !== null &&
    pred.golesLocal === real.golesLocal &&
    pred.golesVisitante === real.golesVisitante
  ) {
    puntos += PTS_MARCADOR;
    aciertoMarcador = true;
  }

  return { puntos, aciertoGanador, aciertoMarcador };
}

export interface DetallePuntaje {
  puntaje: number;
  aciertosGanador: number;
  aciertosMarcador: number;
  aciertosFinalista: number;
  campeonAcertado: boolean;
  partidosEvaluados: number;
}

/**
 * Calcula el puntaje de un usuario hasta cierta "etapa" (útil para graficar
 * la evolución de puntos: 1 = solo cuartos, 2 = cuartos+semis, 3 = todo).
 */
export function calcularPuntajeUsuario(
  pred: Prediccion,
  resultado: Resultado,
  hastaEtapa: 1 | 2 | 3 = 3
): DetallePuntaje {
  const detalle: DetallePuntaje = {
    puntaje: 0,
    aciertosGanador: 0,
    aciertosMarcador: 0,
    aciertosFinalista: 0,
    campeonAcertado: false,
    partidosEvaluados: 0,
  };

  const slotsEtapa1 = QF_SLOTS;
  const slotsEtapa2 = SF_SLOTS;
  const slotsEtapa3: SlotId[] = ["final"];

  let slotsActivos: SlotId[] = [...slotsEtapa1];
  if (hastaEtapa >= 2) slotsActivos = [...slotsActivos, ...slotsEtapa2];
  if (hastaEtapa >= 3) slotsActivos = [...slotsActivos, ...slotsEtapa3];

  for (const slot of slotsActivos) {
    const real = resultado.picks[slot];
    if (real?.ganador) detalle.partidosEvaluados += 1;
    const { puntos, aciertoGanador, aciertoMarcador } = puntajePartido(pred.picks[slot], real);
    detalle.puntaje += puntos;
    if (aciertoGanador) detalle.aciertosGanador += 1;
    if (aciertoMarcador) detalle.aciertosMarcador += 1;
  }

  if (hastaEtapa >= 2) {
    const realFinalistas = new Set(
      SF_SLOTS.map((s) => resultado.picks[s]?.ganador).filter((x): x is string => Boolean(x))
    );
    const predFinalistas = new Set(
      SF_SLOTS.map((s) => pred.picks[s]?.ganador).filter((x): x is string => Boolean(x))
    );
    let aciertos = 0;
    predFinalistas.forEach((f) => {
      if (realFinalistas.has(f)) aciertos += 1;
    });
    detalle.aciertosFinalista = realFinalistas.size > 0 ? aciertos : 0;
    detalle.puntaje += detalle.aciertosFinalista * PTS_FINALISTA;
  }

  if (hastaEtapa >= 3) {
    const realCampeon = resultado.picks.final?.ganador;
    const predCampeon = pred.picks.final?.ganador;
    if (realCampeon && predCampeon && realCampeon === predCampeon) {
      detalle.campeonAcertado = true;
      detalle.puntaje += PTS_CAMPEON;
    }
  }

  return detalle;
}

export function construirRanking(predicciones: Prediccion[], resultado: Resultado): RankingRow[] {
  const filas = predicciones.map((pred) => {
    const det = calcularPuntajeUsuario(pred, resultado, 3);
    return {
      usuario: pred.usuario,
      puntajeTotal: det.puntaje,
      aciertosGanador: det.aciertosGanador,
      aciertosMarcador: det.aciertosMarcador,
      aciertosFinalista: det.aciertosFinalista,
      campeonAcertado: det.campeonAcertado,
      pctAciertos: Math.round((det.aciertosGanador / TOTAL_PARTIDOS) * 1000) / 10,
    };
  });

  filas.sort((a, b) => {
    if (b.puntajeTotal !== a.puntajeTotal) return b.puntajeTotal - a.puntajeTotal;
    return b.aciertosMarcador - a.aciertosMarcador;
  });

  return filas.map((f, i) => ({ posicion: i + 1, ...f }));
}
