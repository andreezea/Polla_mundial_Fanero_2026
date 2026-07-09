"use client";

import { useMemo, useState } from "react";
import { Partido, PicksMap, Resultado, SlotId } from "@/lib/types";
import { equiposDeSlot } from "@/lib/bracket";
import MatchCard from "@/components/MatchCard";
import { Save, Loader2, ShieldCheck } from "lucide-react";

const TITULOS: Record<SlotId, string> = {
  qf1: "Cuartos de Final · Partido 1",
  qf2: "Cuartos de Final · Partido 2",
  qf3: "Cuartos de Final · Partido 3",
  qf4: "Cuartos de Final · Partido 4",
  sf1: "Semifinal 1",
  sf2: "Semifinal 2",
  final: "🏆 Gran Final",
};

interface ResultadosFormProps {
  partidos: Partido[];
  resultadoInicial: Resultado;
}

export default function ResultadosForm({ partidos, resultadoInicial }: ResultadosFormProps) {
  const [picks, setPicks] = useState<PicksMap>(resultadoInicial.picks ?? {});
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
      if (slot === "qf1" || slot === "qf2") delete next.sf1;
      if (slot === "qf3" || slot === "qf4") delete next.sf2;
      if (slot === "sf1" || slot === "sf2") delete next.final;
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/resultados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picks } as Resultado),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setMensaje({ tipo: "ok", texto: "✅ Resultados oficiales actualizados. El ranking se recalculó automáticamente." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudieron guardar los resultados. Intenta nuevamente." });
    } finally {
      setGuardando(false);
    }
  }

  function renderSlot(slot: SlotId) {
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
        colorAcento="navy"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold">
        <ShieldCheck size={18} />
        Completa los resultados a medida que se juegan los partidos. Semifinal y Final se habilitan automáticamente
        cuando definas la etapa anterior.
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
        {renderSlot("final")}
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
        Guardar resultados oficiales
      </button>
    </div>
  );
}
