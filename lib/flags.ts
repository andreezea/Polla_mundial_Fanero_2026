// =============================================================================
// Banderas de los equipos
// -----------------------------------------------------------------------------
// NOTA IMPORTANTE: usamos imágenes reales (flagcdn.com) en vez de emoji Unicode
// de bandera (🇫🇷, 🇪🇸, etc). En Windows, muchos navegadores/versiones NO
// componen el emoji de bandera en una imagen: en su lugar muestran las dos
// letras del código de país sueltas, que es justo el problema de
// "abreviaciones" reportado. Usando una <img> normal el resultado se ve igual
// en cualquier sistema operativo y navegador.
// =============================================================================

export interface InfoBandera {
  codigo: string; // código usado por flagcdn.com (ISO 3166-1 alpha-2, o subdivisión)
  alt: string;
  // Bandera de respaldo si el código de subdivisión no existiera en el CDN.
  respaldo?: string;
}

export const BANDERAS: Record<string, InfoBandera> = {
  Francia: { codigo: "fr", alt: "Bandera de Francia" },
  Marruecos: { codigo: "ma", alt: "Bandera de Marruecos" },
  España: { codigo: "es", alt: "Bandera de España" },
  Bélgica: { codigo: "be", alt: "Bandera de Bélgica" },
  Noruega: { codigo: "no", alt: "Bandera de Noruega" },
  Inglaterra: { codigo: "gb-eng", alt: "Bandera de Inglaterra", respaldo: "gb" },
  Argentina: { codigo: "ar", alt: "Bandera de Argentina" },
  Suiza: { codigo: "ch", alt: "Bandera de Suiza" },
};

export function infoBandera(equipo: string | null | undefined): InfoBandera | null {
  if (!equipo) return null;
  return BANDERAS[equipo] ?? null;
}

export function urlBandera(codigo: string): string {
  return `https://flagcdn.com/w40/${codigo}.png`;
}

// Se mantiene por compatibilidad (usado en textos planos, ej. Excel/labels de
// gráficos SVG donde no se puede insertar una <img>). Ya no antepone emoji.
export function conBandera(equipo: string | null | undefined): string {
  return equipo ?? "";
}
