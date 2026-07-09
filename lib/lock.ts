// =============================================================================
// Bloqueo de predicciones cerca del inicio de cada partido.
//
// Regla: nadie puede crear ni modificar su pick (ganador o marcador) de un
// partido desde 5 minutos antes de su hora de inicio (horaInicio en
// data/partidos.json). Se aplica tanto en la UI (deshabilita los botones)
// como del lado del servidor en app/api/predicciones/route.ts, para que no
// se pueda saltar el bloqueo llamando directamente a la API.
// =============================================================================

import { Partido, PicksMap, Prediccion } from "./types";

export const MINUTOS_BLOQUEO = 5;

// Fecha límite fija para elegir Campeón / Subcampeón (pick del slot "final"),
// independiente de la hora real de la Gran Final: se cierra antes para que
// nadie elija su campeón ya sabiendo los resultados de semifinales.
// 10/07/2026, 12:00 pm hora Perú (UTC-5).
export const FECHA_LIMITE_CAMPEON = "2026-07-10T12:00:00-05:00";

/** true si, a la hora indicada (por defecto ahora), el partido ya no admite cambios. */
export function estaBloqueado(partido: Partido | undefined | null, ahora: Date = new Date()): boolean {
  if (!partido?.horaInicio) return false;
  const inicio = new Date(partido.horaInicio).getTime();
  if (Number.isNaN(inicio)) return false;
  const limite = inicio - MINUTOS_BLOQUEO * 60 * 1000;
  return ahora.getTime() >= limite;
}

/** true si ya pasó la fecha límite fija para elegir Campeón / Subcampeón. */
export function haPasadoLimiteCampeon(ahora: Date = new Date()): boolean {
  return ahora.getTime() >= new Date(FECHA_LIMITE_CAMPEON).getTime();
}

/** true si, para este partido puntual, ya no se admiten cambios (incluye el límite especial del slot "final"). */
export function bloqueoEfectivo(partido: Partido | undefined | null, ahora: Date = new Date()): boolean {
  if (estaBloqueado(partido, ahora)) return true;
  if (partido?.id === "final" && haPasadoLimiteCampeon(ahora)) return true;
  return false;
}

/**
 * Server-side: para cada partido ya bloqueado, ignora lo que venga del
 * cliente y conserva el valor previamente guardado (o nada, si no había
 * nada guardado). Así, aunque alguien llame a la API directamente con un
 * payload manipulado, no puede cambiar un pick después del cierre.
 */
export function sanearPicksBloqueados(
  picksNuevos: PicksMap,
  picksAnteriores: PicksMap,
  partidos: Partido[],
  ahora: Date = new Date()
): PicksMap {
  const resultado: PicksMap = { ...picksNuevos };
  for (const partido of partidos) {
    if (!bloqueoEfectivo(partido, ahora)) continue;
    const previo = picksAnteriores[partido.id];
    if (previo) {
      resultado[partido.id] = previo;
    } else {
      delete resultado[partido.id];
    }
  }
  return resultado;
}

/**
 * Server-side: si ya pasó la fecha límite para elegir Campeón/Subcampeón,
 * ignora lo que venga del cliente para esos dos campos y conserva lo que
 * ya estaba guardado (igual que sanearPicksBloqueados, pero para estos
 * campos independientes del bracket).
 */
export function sanearCampeonBloqueado(
  pred: Prediccion,
  anterior: Prediccion | undefined,
  ahora: Date = new Date()
): Prediccion {
  if (!haPasadoLimiteCampeon(ahora)) return pred;
  return {
    ...pred,
    campeon: anterior?.campeon ?? null,
    subcampeon: anterior?.subcampeon ?? null,
  };
}
