// =============================================================================
// Banderas de los equipos que juegan Cuartos de Final del Mundial 2026.
// Fácil de actualizar: solo agrega o cambia entradas en este mapa.
// =============================================================================

export const BANDERAS: Record<string, string> = {
  Francia: "🇫🇷",
  Marruecos: "🇲🇦",
  España: "🇪🇸",
  Bélgica: "🇧🇪",
  Noruega: "🇳🇴",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Argentina: "🇦🇷",
  Suiza: "🇨🇭",
};

/** Antepone la bandera al nombre del equipo, si existe en el mapa. */
export function conBandera(equipo: string | null | undefined): string {
  if (!equipo) return "";
  const bandera = BANDERAS[equipo];
  return bandera ? `${bandera} ${equipo}` : equipo;
}
