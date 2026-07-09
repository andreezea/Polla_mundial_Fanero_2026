// =============================================================================
// Tipos centrales de la Polla Mundialista 2026
// =============================================================================

export type SlotId = "qf1" | "qf2" | "qf3" | "qf4" | "sf1" | "sf2" | "final";

export const SLOT_IDS: SlotId[] = ["qf1", "qf2", "qf3", "qf4", "sf1", "sf2", "final"];

export const QF_SLOTS: SlotId[] = ["qf1", "qf2", "qf3", "qf4"];
export const SF_SLOTS: SlotId[] = ["sf1", "sf2"];

export type Etapa = "Cuartos de Final" | "Semifinal" | "Final";

export interface Partido {
  id: SlotId;
  etapa: Etapa;
  orden: number;
  equipo1: string | null;
  equipo2: string | null;
  depende1: SlotId | null;
  depende2: SlotId | null;
  fecha: string;
  sede: string;
}

export interface SlotPick {
  ganador: string | null;
  golesLocal: number | null;
  golesVisitante: number | null;
}

export type PicksMap = Partial<Record<SlotId, SlotPick>>;

export interface Prediccion {
  usuario: string;
  timestamp: string;
  picks: PicksMap;
}

export interface Resultado {
  picks: PicksMap;
}

export interface RankingRow {
  posicion: number;
  usuario: string;
  puntajeTotal: number;
  aciertosGanador: number;
  aciertosMarcador: number;
  aciertosFinalista: number;
  campeonAcertado: boolean;
  pctAciertos: number;
}
