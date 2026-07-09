"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Partido, PicksMap, Prediccion, SlotId, SLOT_IDS, EMOJIS_SUGERIDOS } from "@/lib/types";
import { equiposDeSlot } from "@/lib/bracket";
import { estaBloqueado, haPasadoLimiteCampeon } from "@/lib/lock";
import MatchCard from "@/components/MatchCard";
import FlagIcon from "@/components/FlagIcon";
import { Save, Upload, Loader2, Info, Search } from "lucide-react";

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
  predicciones: Prediccion[];
}

export default function PrediccionForm({ partidos, predicciones }: PrediccionFormProps) {
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [picks, setPicks] = useState<PicksMap>({});
  const [campeon, setCampeon] = useState<string | null>(null);
  const [subcampeon, setSubcampeon] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error" | "info"; texto: string } | null>(null);
  const [yaExisteOtro, setYaExisteOtro] = useState(false);

  const partidoPorId = useMemo(() => {
    const map: Record<string, Partido> = {};
    partidos.forEach((p) => (map[p.id] = p));
    return map;
  }, [partidos]);

  // Equipos que juegan cuartos de final: son los únicos que pueden llegar a
  // ser Campeón/Subcampeón, así que son las opciones para elegirlos — sin
  // necesidad de completar cuartos ni semifinales primero.
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

  const limiteCampeonPasado = haPasadoLimiteCampeon();

  function elegirCampeon(equipo: string) {
    if (limiteCampeonPasado) return;
    setCampeon((prev) => (prev === equipo ? null : equipo));
    setSubcampeon((prev) => (prev === equipo ? null : prev));
  }

  function elegirSubcampeon(equipo: string) {
    if (limiteCampeonPasado) return;
    setSubcampeon((prev) => (prev === equipo ? null : equipo));
    setCampeon((prev) => (prev === equipo ? null : prev));
  }

  function buscarPrediccionExistente(nombreBuscado: string): Prediccion | undefined {
    const normalizado = nombreBuscado.trim().toLowerCase();
    if (!normalizado) return undefined;
    return predicciones.find((p) => p.usuario.trim().toLowerCase() === normalizado);
  }

  function cargarPrediccion(encontrada: Prediccion) {
    setPicks(encontrada.picks ?? {});
    setEmoji(encontrada.emoji ?? null);
    // Compatibilidad: predicciones guardadas antes de este cambio no tenían
    // el campo "campeon" propio, así que usamos el ganador de la Gran Final
    // del bracket (si lo habían elegido) como respaldo.
    setCampeon(encontrada.campeon ?? encontrada.picks.final?.ganador ?? null);
    setSubcampeon(encontrada.subcampeon ?? null);
    const faltan = SLOT_IDS.filter((s) => !encontrada.picks[s]?.ganador).length;
    setMensaje({
      tipo: "info",
      texto:
        faltan > 0
          ? `📋 Cargamos tu predicción guardada. Te faltan ${faltan} partido(s) por completar.`
          : "📋 Cargamos tu predicción guardada. Puedes revisarla y modificarla si quieres.",
    });
    setYaExisteOtro(false);
  }

  function alSalirDelNombre() {
    const encontrada = buscarPrediccionExistente(nombre);
    if (!encontrada) {
      setYaExisteOtro(false);
      return;
    }
    const formularioVacio = Object.keys(picks).length === 0 && !emoji && !campeon && !subcampeon;
    if (formularioVacio) {
      // Primera vez que escribe este nombre en esta visita: cargamos su avance guardado.
      cargarPrediccion(encontrada);
    } else {
      // Ya había algo escrito en el formulario: no lo pisamos, solo avisamos.
      setYaExisteOtro(true);
    }
  }

  function buscarManualmente() {
    setMensaje(null);
    if (!nombre.trim()) {
      setMensaje({ tipo: "error", texto: "Escribe tu nombre para buscar tu predicción." });
      return;
    }
    const encontrada = buscarPrediccionExistente(nombre);
    if (!encontrada) {
      setMensaje({
        tipo: "error",
        texto: `No encontramos ninguna predicción guardada con el nombre "${nombre.trim()}". Si es tu primera vez, elige tus partidos y guarda.`,
      });
      setYaExisteOtro(false);
      return;
    }
    // Búsqueda explícita: siempre carga lo guardado, aunque haya algo escrito en el formulario.
    cargarPrediccion(encontrada);
  }

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
      setMensaje({ tipo: "error", texto: "Ingresa tu nombre para guardar tu registro." });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const prediccion: Prediccion = {
        usuario: nombre.trim(),
        emoji,
        timestamp: new Date().toISOString(),
        picks,
        campeon,
        subcampeon,
      };
      const res = await fetch("/api/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prediccion),
      });
      if (!res.ok) throw new Error("Error al guardar");

      const faltantes = SLOT_IDS.filter((s) => !picks[s]?.ganador).length;
      setYaExisteOtro(false);
      if (faltantes === 0) {
        setMensaje({ tipo: "ok", texto: `✅ Predicción completa guardada para ${nombre.trim()}. ¡Mucha suerte! 🍀` });
      } else if (faltantes === SLOT_IDS.length) {
        setMensaje({
          tipo: "ok",
          texto: `✅ Te registraste como ${nombre.trim()}. Vuelve cuando quieras (con el mismo nombre) para elegir tus partidos.`,
        });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `✅ Guardamos tu avance, ${nombre.trim()}. Te faltan ${faltantes} partido(s) — puedes volver a esta página más tarde con el mismo nombre para completarlos.`,
        });
      }
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
          emoji: fila["emoji"] ? String(fila["emoji"]) : null,
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

  const resumenPicks = useMemo(
    () =>
      SLOT_IDS.map((slot) => ({
        slot,
        titulo: TITULOS[slot].replace("🏆 ", ""),
        pick: picks[slot],
      })),
    [picks]
  );
  const hayAlgunPick = SLOT_IDS.some((s) => picks[s]?.ganador) || !!campeon || !!subcampeon;

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
        bloqueado={estaBloqueado(partido)}
        colorAcento={colorAcento}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <label className="mb-2 block text-sm font-semibold text-slate-300">👤 Tu nombre o apodo</label>
        <div className="flex flex-wrap gap-2 max-w-lg">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={alSalirDelNombre}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                buscarManualmente();
              }
            }}
            placeholder="Ej: Andree"
            className="input-field flex-1 min-w-[180px]"
          />
          <button type="button" onClick={buscarManualmente} className="btn-secondary shrink-0">
            <Search size={16} />
            Ver / editar mi predicción
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          ¿Ya te registraste? Escribe tu nombre exactamente igual y dale "Ver / editar mi predicción" para
          revisar y cambiar lo que elegiste.
        </p>
        {yaExisteOtro && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gold">
            <Info size={14} />
            Ya existe una predicción guardada con este nombre. Si guardas ahora, se reemplazará por lo que elijas
            aquí.
          </p>
        )}

        <label className="mb-2 mt-4 block text-sm font-semibold text-slate-300">
          🙂 Elige un emoji para tu nombre (opcional)
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
                (emoji === e
                  ? "border-gold bg-gold/10"
                  : "border-surface-border hover:border-slate-500")
              }
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 border border-gold/30">
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">🏆 Campeón y Subcampeón del Mundial</h3>
        <p className="mb-1 text-xs text-slate-500">
          Elige directamente quién crees que será el Campeón y el Subcampeón — no necesitas completar cuartos ni
          semifinales primero. Acertar el Campeón suma <strong>+10 puntos</strong> y acertar el Subcampeón suma{" "}
          <strong>+6 puntos</strong>.
        </p>
        <p className="mb-3 text-xs font-semibold text-red-300">
          ⏰ Tienes hasta el 10/07/2026, 12:00 pm (hora Perú) para elegir o cambiar esta predicción.
        </p>

        {limiteCampeonPasado && (
          <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
            🔒 Cerrado — venció el plazo para elegir Campeón y Subcampeón. Ya no se puede modificar.
          </div>
        )}

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
                    disabled={limiteCampeonPasado}
                    onClick={() => elegirCampeon(equipo)}
                    className={
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition disabled:opacity-50 " +
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
                    disabled={limiteCampeonPasado}
                    onClick={() => elegirSubcampeon(equipo)}
                    className={
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition disabled:opacity-50 " +
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

      {hayAlgunPick && (
        <div className="card p-5 border border-gold/30">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">📋 Resumen de tu predicción</h3>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
              <span className="block text-xs font-semibold text-gold mb-1">🏆 Campeón del Mundial</span>
              {campeon ? (
                <span className="flex items-center gap-2 text-base font-bold text-white">
                  <FlagIcon equipo={campeon} size={24} />
                  {campeon}
                </span>
              ) : (
                <span className="text-sm text-slate-500 italic">Aún no elegido — elígelo arriba</span>
              )}
            </div>
            <div className="rounded-lg border border-surface-border bg-white/5 px-4 py-3">
              <span className="block text-xs font-semibold text-slate-300 mb-1">🥈 Subcampeón</span>
              {subcampeon ? (
                <span className="flex items-center gap-2 text-base font-bold text-slate-200">
                  <FlagIcon equipo={subcampeon} size={24} />
                  {subcampeon}
                </span>
              ) : (
                <span className="text-sm text-slate-500 italic">Aún no elegido — elígelo arriba</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {resumenPicks.map(({ slot, titulo, pick }) => (
              <div key={slot} className="flex items-center justify-between border-b border-surface-border/50 py-1.5">
                <span className="text-slate-400">{titulo}</span>
                {pick?.ganador ? (
                  <span className="flex items-center gap-1.5 font-medium text-slate-200">
                    <FlagIcon equipo={pick.ganador} size={16} />
                    {pick.ganador}
                    {pick.golesLocal !== null && pick.golesVisitante !== null && (
                      <span className="text-xs text-slate-500">
                        ({pick.golesLocal}-{pick.golesVisitante})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs italic text-slate-500">Sin elegir</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <Info size={16} className="shrink-0" />
        No es necesario completar todos los partidos ahora. Puedes registrarte solo con tu nombre, guardar, y volver
        más tarde (con el mismo nombre) para completar o modificar tu predicción.
      </div>

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
        <Info size={16} className="shrink-0" />
        Cada partido se bloquea automáticamente 5 minutos antes de su hora de inicio: después de ese momento ya no
        se puede elegir ni cambiar el ganador ni el marcador de ese partido.
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
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">🏆 Gran Final</h2>
        <p className="mb-3 text-xs text-slate-500">
          Este resultado es para el partido de la Final en sí (ganador + marcador exacto, para esos puntos). Tu
          Campeón y Subcampeón ya los elegiste arriba, sin depender de este partido.
        </p>
        {renderSlot("final", "navy")}
      </div>

      {mensaje && (
        <div
          className={
            mensaje.tipo === "ok"
              ? "rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300"
              : mensaje.tipo === "info"
                ? "rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold"
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
          Sube un .xlsx con columnas <code>usuario</code>, <code>emoji</code> (opcional) y{" "}
          <code>&#123;slot&#125;_ganador / _gl / _gv</code> (ej. <code>qf1_ganador</code>) para registrar varios
          jugadores a la vez.
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
