// =============================================================================
// Bloqueo de predicciones cerca del inicio de cada partido.
//
// Regla: nadie puede crear ni modificar su pick (ganador o marcador) de un
// partido desde 5 minutos antes de su hora de inicio (horaInicio en
// data/partidos.json). Se aplica tanto en la UI (deshabilita los botones)
// como del lado del servidor en app/api/predicciones/route.ts, para que no
// se pueda saltar el bloqueo llamando directamente a la API.
// =============================================================================

import { Partido, PicksMap } from "./types";

export const MINUTOS_BLOQUEO = 5;

/** true si, a la hora indicada (por defecto ahora), el partido ya no admite cambios. */
export function estaBloqueado(partido: Partido | undefined | null, ahora: Date = new Date()): boolean {
  if (!partido?.horaInicio) return false;
  const inicio = new Date(partido.horaInicio).getTime();
  if (Number.isNaN(inicio)) return false;
  const limite = inicio - MINUTOS_BLOQUEO * 60 * 1000;
  return ahora.getTime() >= limite;
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
    if (!estaBloqueado(partido, ahora)) continue;
    const previo = picksAnteriores[partido.id];
    if (previo) {
      resultado[partido.id] = previo;
    } else {
      delete resultado[partido.id];
    }
  }
  return resultado;
}
