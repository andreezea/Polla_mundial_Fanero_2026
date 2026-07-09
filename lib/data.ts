// =============================================================================
// Capa de acceso a datos (JSON como base de datos ligera).
//
// IMPORTANTE — Limitación conocida en Vercel:
// El sistema de archivos de las funciones serverless de Vercel es de solo
// lectura en producción, excepto el directorio efímero /tmp. Por eso, en
// producción (VERCEL=1) las escrituras se hacen en /tmp, que NO persiste
// entre invocaciones frías ni se comparte entre instancias/regiones.
// Es decir: funciona para una demo o sesión corta, pero para una polla real
// con muchos usuarios en producción se recomienda migrar esta capa a una
// base de datos persistente (Vercel KV, Vercel Postgres, Supabase, etc.).
// Todo el resto de la app solo llama a las funciones de este archivo, así
// que migrar de backend implica reescribir únicamente este módulo.
// =============================================================================

import fs from "fs";
import path from "path";
import { Partido, Prediccion, Resultado } from "./types";

const SEED_DIR = path.join(process.cwd(), "data");
const RUNTIME_DIR = process.env.VERCEL ? path.join("/tmp", "polla-mundial-2026-data") : SEED_DIR;

function ensureRuntimeFile(filename: string) {
  if (RUNTIME_DIR === SEED_DIR) return; // local/dev: escribimos directo sobre /data
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  const target = path.join(RUNTIME_DIR, filename);
  if (!fs.existsSync(target)) {
    const seed = path.join(SEED_DIR, filename);
    fs.copyFileSync(seed, target);
  }
}

function readJSON<T>(filename: string): T {
  ensureRuntimeFile(filename);
  const file = path.join(RUNTIME_DIR, filename);
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  ensureRuntimeFile(filename);
  const file = path.join(RUNTIME_DIR, filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Partidos (fixture fijo, solo lectura)
// ---------------------------------------------------------------------------
export function getPartidos(): Partido[] {
  return readJSON<Partido[]>("partidos.json");
}

// ---------------------------------------------------------------------------
// Predicciones
// ---------------------------------------------------------------------------
export function getPredicciones(): Prediccion[] {
  return readJSON<Prediccion[]>("predicciones.json");
}

export function upsertPrediccion(pred: Prediccion): Prediccion[] {
  const actuales = getPredicciones();
  const nombreNormalizado = pred.usuario.trim().toLowerCase();
  const filtradas = actuales.filter((p) => p.usuario.trim().toLowerCase() !== nombreNormalizado);
  const nuevas = [...filtradas, pred];
  writeJSON("predicciones.json", nuevas);
  return nuevas;
}

export function importarPredicciones(nuevas: Prediccion[]): Prediccion[] {
  const actuales = getPredicciones();
  const nombresNuevos = new Set(nuevas.map((p) => p.usuario.trim().toLowerCase()));
  const conservadas = actuales.filter((p) => !nombresNuevos.has(p.usuario.trim().toLowerCase()));
  const resultado = [...conservadas, ...nuevas];
  writeJSON("predicciones.json", resultado);
  return resultado;
}

// ---------------------------------------------------------------------------
// Resultados oficiales
// ---------------------------------------------------------------------------
export function getResultado(): Resultado {
  return readJSON<Resultado>("resultados.json");
}

export function guardarResultado(resultado: Resultado): Resultado {
  writeJSON("resultados.json", resultado);
  return resultado;
}
