// =============================================================================
// Lógica de bracket: resuelve qué equipos juegan cada partido (Cuartos son
// fijos; Semifinal y Final dependen de los ganadores elegidos en el contexto
// -ya sea una predicción de usuario o los resultados oficiales-).
// =============================================================================

import { Partido, PicksMap, SlotId } from "./types";

/** Devuelve [equipo1, equipo2] para un slot, resolviendo dependencias contra
 * un mapa de picks (predicción de un usuario o resultados oficiales). */
export function equiposDeSlot(
  slotId: SlotId,
  partidos: Partido[],
  contexto: PicksMap
): [string, string] {
  const partido = partidos.find((p) => p.id === slotId);
  if (!partido) return ["Por definir", "Por definir"];

  if (partido.equipo1 && partido.equipo2) {
    return [partido.equipo1, partido.equipo2];
  }

  const e1 = partido.depende1 ? contexto[partido.depende1]?.ganador : null;
  const e2 = partido.depende2 ? contexto[partido.depende2]?.ganador : null;

  return [e1 || "Por definir", e2 || "Por definir"];
}

export function nombrePartido(slotId: SlotId, partidos: Partido[], contexto: PicksMap): string {
  const [e1, e2] = equiposDeSlot(slotId, partidos, contexto);
  return `${e1} vs ${e2}`;
}
