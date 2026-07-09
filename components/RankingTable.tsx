"use client";

import { useMemo, useState } from "react";
import { RankingRow } from "@/lib/types";
import clsx from "clsx";

interface RankingTableProps {
  ranking: RankingRow[];
  mostrarFiltro?: boolean;
}

export default function RankingTable({ ranking, mostrarFiltro = true }: RankingTableProps) {
  const [usuarioFiltro, setUsuarioFiltro] = useState("Todos");

  const usuarios = useMemo(() => ["Todos", ...ranking.map((r) => r.usuario)], [ranking]);
  const filas = usuarioFiltro === "Todos" ? ranking : ranking.filter((r) => r.usuario === usuarioFiltro);

  return (
    <div className="card overflow-hidden">
      {mostrarFiltro && (
        <div className="flex items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
          <span className="text-sm font-semibold text-slate-300">Filtrar por jugador</span>
          <select
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            className="input-field w-48"
          >
            {usuarios.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-navy-800/60">
              <th className="table-header">#</th>
              <th className="table-header">Jugador</th>
              <th className="table-header">Puntaje</th>
              <th className="table-header">Ganadores</th>
              <th className="table-header">Marcadores</th>
              <th className="table-header">Finalistas</th>
              <th className="table-header">Campeón</th>
              <th className="table-header">% Aciertos</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((r) => (
              <tr
                key={r.usuario}
                className={clsx(r.posicion === 1 && "bg-gold/10")}
              >
                <td className="table-cell font-bold text-gold">{r.posicion}</td>
                <td className="table-cell font-semibold text-white">
                  {r.emoji && <span className="mr-1.5">{r.emoji}</span>}
                  {r.usuario}
                  {r.posicion === 1 && <span className="badge-gold ml-2">🏆 Líder</span>}
                </td>
                <td className="table-cell font-bold">{r.puntajeTotal} pts</td>
                <td className="table-cell">{r.aciertosGanador}</td>
                <td className="table-cell">{r.aciertosMarcador}</td>
                <td className="table-cell">{r.aciertosFinalista}</td>
                <td className="table-cell">{r.campeonAcertado ? "🏆 Sí" : "—"}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-navy-800 overflow-hidden">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${Math.min(100, r.pctAciertos)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{r.pctAciertos}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell text-center text-slate-500 py-8">
                  No hay predicciones registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
