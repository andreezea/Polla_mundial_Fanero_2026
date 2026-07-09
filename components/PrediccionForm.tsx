"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Partido, PicksMap, Prediccion, SlotId, SLOT_IDS } from "@/lib/types";
import { equiposDeSlot } from "@/lib/bracket";
import MatchCard from "@/components/MatchCard";
import { Save, Upload, Loader2 } from "lucide-react";

const TITULOS: Record<SlotId, string> = {
  qf1: "Cuartos de Final · Partido 1",
  qf2: "Cuartos de Final · Partido 2",
  qf3: "Cuartos de Final · Partido 3",
  qf4: "Cuartos de Final · Partido 4",
  sf1: "Semifinal 1",
  sf2: "Semifinal 2",
  final: "🏆 Gran Final",
};

interface PrediccionFormProps {
  partidos: Partido[];
}

export default function PrediccionForm({ partidos }: PrediccionFormProps) {
  const [nombre, setNombre] = useState("");
  const [picks, setPicks] = useState<PicksMap>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const partidoPorId = useMemo(() => {
    const map: Record<string, Partido> = {};
    partidos.forEach((p) => (map[p.id] = p));
    return map;
  }, [partidos]);

  function actualizarPick(slot: SlotId, pick: PicksMap[SlotId]) {
    setPicks((prev) => {
      const next = { ...prev, [slot]: pick };
      // Si cambia el ganador de un partido, limpiamos las etapas siguientes
      // que dependían de él para evitar inconsistencias.
      if (slot === "qf1" || slot === "qf2") delete next.sf1;
      if (slot === "qf3" || slot === "qf4") delete next.sf2;
      if (slot === "sf1" || slot === "sf2") delete next.final;
      return next;
    });
  }

  async function guardar() {
    if (!nombre.trim()) {
      setMensaje({ tipo: "error", texto: "Ingresa tu nombre para guardar la predicción." });
      return;
    }
    const faltantes = SLOT_IDS.filter((s) => !picks[s]?.ganador);
    if (faltantes.length > 0) {
      setMensaje({ tipo: "error", texto: "Completa el ganador de los 7 partidos antes de guardar." });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const prediccion: Prediccion = { usuario: nombre.trim(), timestamp: new Date().toISOString(), picks };
      const res = await fetch("/api/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prediccion),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setMensaje({ tipo: "ok", texto: `✅ Predicción guardada para ${nombre.trim()}. ¡Mucha suerte! 🍀` });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo guardar la predicción. Intenta nuevamente." });
    } finally {
      setGuardando(false);
    }
  }

  async function importarExcel(file: File) {
    setMensaje(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

      const nuevas: Prediccion[] = filas.map((fila) => {
        const picksImportados: PicksMap = {};
        SLOT_IDS.forEach((slot) => {
          const ganador = fila[`${slot}_ganador`];
          if (ganador) {
            picksImportados[slot] = {
              ganador: String(ganador),
              golesLocal: fila[`${slot}_gl`] !== undefined && fila[`${slot}_gl`] !== "" ? Number(fila[`${slot}_gl`]) : null,
              golesVisitante: fila[`${slot}_gv`] !== undefined && fila[`${slot}_gv`] !== "" ? Number(fila[`${slot}_gv`]) : null,
            };
          }
        });
        return {
          usuario: String(fila["usuario"] ?? "").trim(),
          timestamp: new Date().toISOString(),
          picks: picksImportados,
        };
      }).filter((p) => p.usuario);

      if (nuevas.length === 0) {
        setMensaje({ tipo: "error", texto: "No se encontraron filas válidas en el archivo." });
        return;
      }

      const res = await fetch("/api/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevas),
      });
      if (!res.ok) throw new Error("Error al importar");
      setMensaje({ tipo: "ok", texto: `✅ Se importaron ${nuevas.length} predicciones desde Excel.` });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo procesar el archivo. Verifica el formato." });
    }
  }

  function renderSlot(slot: SlotId, colorAcento: "gold" | "navy" = "gold") {
    const [e1, e2] = equiposDeSlot(slot, partidos, picks);
    const partido = partidoPorId[slot];
    return (
      <MatchCard
        key={slot}
        titulo={TITULOS[slot]}
        equipo1={e1}
        equipo2={e2}
        fecha={partido?.fecha}
        sede={partido?.sede}
        pick={picks[slot] ?? { ganador: null, golesLocal: null, golesVisitante: null }}
        onChange={(p) => actualizarPick(slot, p)}
        colorAcento={colorAcento}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <label className="mb-2 block text-sm font-semibold text-slate-300">👤 Tu nombre o apodo</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Andree"
          className="input-field max-w-sm"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">🥇 Cuartos de Final</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["qf1", "qf2", "qf3", "qf4"] as SlotId[]).map((s) => renderSlot(s))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">🥈 Semifinales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["sf1", "sf2"] as SlotId[]).map((s) => renderSlot(s))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">🏆 Gran Final</h2>
        {renderSlot("final", "navy")}
      </div>

      {mensaje && (
        <div
          className={
            mensaje.tipo === "ok"
              ? "rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300"
              : "rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          }
        >
          {mensaje.texto}
        </div>
      )}

      <button onClick={guardar} disabled={guardando} className="btn-primary w-full sm:w-auto">
        {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Guardar mi predicción
      </button>

      <div className="card p-5">
        <h3 className="mb-1 text-sm font-semibold text-slate-200">📤 Carga masiva vía Excel (opcional)</h3>
        <p className="mb-3 text-xs text-slate-400">
          Sube un .xlsx con columnas <code>usuario</code> y <code>&#123;slot&#125;_ganador / _gl / _gv</code> (ej.
          <code> qf1_ganador</code>) para registrar varios jugadores a la vez.
        </p>
        <label className="btn-secondary w-fit cursor-pointer">
          <Upload size={16} />
          Subir archivo Excel
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importarExcel(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}
