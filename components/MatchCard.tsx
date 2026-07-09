"use client";

import clsx from "clsx";
import { SlotPick } from "@/lib/types";
import FlagIcon from "@/components/FlagIcon";

interface MatchCardProps {
  titulo: string;
  equipo1: string;
  equipo2: string;
  fecha?: string;
  sede?: string;
  pick: SlotPick;
  onChange: (pick: SlotPick) => void;
  deshabilitado?: boolean;
  /** true si ya pasó el límite de tiempo (5 min antes del inicio): se ve el pick pero no se puede tocar. */
  bloqueado?: boolean;
  colorAcento?: "gold" | "navy";
}

export default function MatchCard({
  titulo,
  equipo1,
  equipo2,
  fecha,
  sede,
  pick,
  onChange,
  deshabilitado = false,
  bloqueado = false,
  colorAcento = "gold",
}: MatchCardProps) {
  const equiposDefinidos = equipo1 !== "Por definir" && equipo2 !== "Por definir";
  const seleccionable = equiposDefinidos && !deshabilitado;
  const inputsDeshabilitados = deshabilitado || bloqueado;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{titulo}</span>
        {(fecha || sede) && (
          <span className="text-xs text-slate-500">
            {fecha && `📅 ${fecha}`} {sede && `· 📍 ${sede}`}
          </span>
        )}
      </div>

      {bloqueado && equiposDefinidos && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
          🔒 Cerrado — este partido ya comenzó o está por comenzar. Ya no se puede modificar.
        </div>
      )}

      {!seleccionable ? (
        <p className="text-sm text-slate-500 italic">
          Se define automáticamente cuando completes las etapas anteriores.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[equipo1, equipo2].map((equipo) => {
            const activo = pick.ganador === equipo;
            return (
              <button
                key={equipo}
                type="button"
                title={activo ? "Click de nuevo para quitar esta selección" : undefined}
                disabled={inputsDeshabilitados}
                onClick={() =>
                  activo
                    ? // Ya estaba elegido este equipo: un segundo clic lo deselecciona.
                      onChange({ ganador: null, golesLocal: pick.golesLocal, golesVisitante: pick.golesVisitante })
                    : onChange({
                        ganador: equipo,
                        golesLocal: pick.golesLocal,
                        golesVisitante: pick.golesVisitante,
                      })
                }
                className={clsx(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left font-semibold transition",
                  activo
                    ? colorAcento === "gold"
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-navy-400 bg-navy-500/20 text-navy-200"
                    : "border-surface-border text-slate-200 hover:border-slate-500"
                )}
              >
                <span className="flex items-center gap-2">
                  <FlagIcon equipo={equipo} size={22} />
                  {equipo}
                </span>
                {activo && <span>✅</span>}
              </button>
            );
          })}

          <div className="flex items-center gap-2 sm:col-span-2 mt-1">
            <span className="text-xs text-slate-400 w-32 truncate">Marcador:</span>
            <input
              type="number"
              min={0}
              max={15}
              disabled={inputsDeshabilitados}
              value={pick.golesLocal ?? ""}
              onChange={(e) =>
                onChange({
                  ...pick,
                  golesLocal: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={equipo1}
              title={equipo1}
              className="input-field w-20 text-center"
            />
            <span className="text-slate-500">—</span>
            <input
              type="number"
              min={0}
              max={15}
              disabled={inputsDeshabilitados}
              value={pick.golesVisitante ?? ""}
              onChange={(e) =>
                onChange({
                  ...pick,
                  golesVisitante: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={equipo2}
              className="input-field w-20 text-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}
