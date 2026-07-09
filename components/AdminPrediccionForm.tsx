"use client";

import { useMemo, useState } from "react";
import { Partido, PicksMap, Prediccion, SlotId, EMOJIS_SUGERIDOS } from "@/lib/types";
import { equiposDeSlot } from "@/lib/bracket";
import MatchCard from "@/components/MatchCard";
import FlagIcon from "@/components/FlagIcon";
import { Save, Loader2, Info, UserCog } from "lucide-react";

const TITULOS: Record<SlotId, string> = {
  qf1: "Cuartos de Final · Partido 1",
  qf2: "Cuartos de Final · Partido 2",
  qf3: "Cuartos de Final · Partido 3",
  qf4: "Cuartos de Final · Partido 4",
  sf1: "Semifinal 1",
  sf2: "Semifinal 2",
  final: "🏆 Gran Final",
};

interface AdminPrediccionFormProps {
  partidos: Partido[];
  predicciones: Prediccion[];
}

export default function AdminPrediccionForm({ partidos, predicciones }: AdminPrediccionFormProps) {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [picks, setPicks] = useState<PicksMap>({});
  const [campeon, setCampeon] = useState<string | null>(null);
  const [subcampeon, setSubcampeon] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const partidoPorId = useMemo(() => {
    const map: Record<string, Partido> = {};
    partidos.forEach((p) => (map[p.id] = p));
    return map;
  }, [partidos]);

  const equiposCuartos = useMemo(() => {
    const nombres: string[] = [];
    partidos
      .filter((p) => p.etapa === "Cuartos de Final")
      .forEach((p) => {
        if (p.equipo1) nombres.push(p.equipo1);
        if (p.equipo2) nombres.push(p.equipo2);
      });
    return nombres;
  }, [partidos]);

  const predicionesOrdenadas = useMemo(
    () => [...predicciones].sort((a, b) => a.usuario.localeCompare(b.usuario, "es")),
    [predicciones]
  );

  function seleccionarUsuario(nombre: string) {
    setUsuarioSeleccionado(nombre);
    setMensaje(null);
    const encontrada = predicciones.find((p) => p.usuario === nombre);
    if (encontrada) {
      setPicks(encontrada.picks ?? {});
      setEmoji(encontrada.emoji ?? null);
      setCampeon(encontrada.campeon ?? encontrada.picks.final?.ganador ?? null);
      setSubcampeon(encontrada.subcampeon ?? null);
    } else {
      setPicks({});
      setEmoji(null);
      setCampeon(null);
      setSubcampeon(null);
    }
  }

  function actualizarPick(slot: SlotId, pick: PicksMap[SlotId]) {
    setPicks((prev) => {
      const next = { ...prev, [slot]: pick };
      if (slot === "qf1" || slot === "qf2") delete next.sf1;
      if (slot === "qf3" || slot === "qf4") delete next.sf2;
      if (slot === "sf1" || slot === "sf2") delete next.final;
      return next;
    });
  }

  function elegirCampeon(equipo: string) {
    setCampeon((prev) => (prev === equipo ? null : equipo));
    setSubcampeon((prev) => (prev === equipo ? null : prev));
  }

  function elegirSubcampeon(equipo: string) {
    setSubcampeon((prev) => (prev === equipo ? null : equipo));
    setCampeon((prev) => (prev === equipo ? null : prev));
  }

  async function guardar() {
    if (!usuarioSeleccionado) {
      setMensaje({ tipo: "error", texto: "Selecciona un participante primero." });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      const prediccion: Prediccion = {
        usuario: usuarioSeleccionado,
        emoji,
        timestamp: new Date().toISOString(),
        picks,
        campeon,
        subcampeon,
      };
      const res = await fetch("/api/admin/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prediccion),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setMensaje({ tipo: "ok", texto: `✅ Predicción de ${usuarioSeleccionado} actualizada correctamente.` });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo guardar. Intenta nuevamente." });
    } finally {
      setGuardando(false);
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
        bloqueado={false}
        colorAcento={colorAcento}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
          <UserCog size={16} />
          Selecciona el participante a corregir
        </label>
        <select
          value={usuarioSeleccionado}
          onChange={(e) => seleccionarUsuario(e.target.value)}
          className="input-field w-full max-w-sm"
        >
          <option value="">— Elige un participante —</option>
          {predicionesOrdenadas.map((p) => (
            <option key={p.usuario} value={p.usuario}>
              {p.emoji ? `${p.emoji} ` : ""}
              {p.usuario}
            </option>
          ))}
        </select>
        {predicionesOrdenadas.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">Todavía no hay participantes registrados.</p>
        )}
      </div>

      {usuarioSeleccionado && (
        <>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            Modo administrador: aquí puedes elegir o cambiar cualquier partido aunque ya haya empezado, y el
            Campeón/Subcampeón aunque venció el plazo. Úsalo solo para corregir o completar lo que{" "}
            {usuarioSeleccionado} no marcó — no para cambiar predicciones después de conocer resultados.
          </div>

          <div>
            <label className="mb-2 mt-1 block text-sm font-semibold text-slate-300">
              🙂 Emoji de {usuarioSeleccionado}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEmoji(null)}
                className={
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition " +
                  (emoji === null
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-surface-border text-slate-400 hover:border-slate-500")
                }
                title="Sin emoji"
              >
                —
              </button>
              {EMOJIS_SUGERIDOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition " +
                    (emoji === e ? "border-gold bg-gold/10" : "border-surface-border hover:border-slate-500")
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">🏆 Campeón y Subcampeón</h2>
            <div className="card p-5 border border-gold/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <span className="mb-2 block text-xs font-semibold text-gold">Campeón</span>
                  <div className="grid grid-cols-2 gap-2">
                    {equiposCuartos.map((equipo) => {
                      const activo = campeon === equipo;
                      return (
                        <button
                          key={equipo}
                          type="button"
                          onClick={() => elegirCampeon(equipo)}
                          className={
                            "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition " +
                            (activo
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-surface-border text-slate-200 hover:border-slate-500")
                          }
                        >
                          <span className="flex items-center gap-1.5">
                            <FlagIcon equipo={equipo} size={18} />
                            {equipo}
                          </span>
                          {activo && <span>✅</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-xs font-semibold text-slate-300">Subcampeón</span>
                  <div className="grid grid-cols-2 gap-2">
                    {equiposCuartos.map((equipo) => {
                      const activo = subcampeon === equipo;
                      return (
                        <button
                          key={equipo}
                          type="button"
                          onClick={() => elegirSubcampeon(equipo)}
                          className={
                            "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition " +
                            (activo
                              ? "border-navy-400 bg-navy-500/20 text-navy-200"
                              : "border-surface-border text-slate-200 hover:border-slate-500")
                          }
                        >
                          <span className="flex items-center gap-1.5">
                            <FlagIcon equipo={equipo} size={18} />
                            {equipo}
                          </span>
                          {activo && <span>✅</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
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
            Guardar corrección
          </button>
        </>
      )}
    </div>
  );
}
