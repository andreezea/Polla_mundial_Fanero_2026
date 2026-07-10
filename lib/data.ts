// =============================================================================
// Capa de acceso a datos.
//
// PARTIDOS: es un fixture fijo (no lo edita nadie en producción), así que
// siempre se lee del JSON versionado en el repo (data/partidos.json).
//
// PREDICCIONES / RESULTADOS: necesitan persistir de verdad entre visitas.
//   - Si hay credenciales de Upstash Redis configuradas (variables de
//     entorno UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, o las
//     equivalentes KV_REST_API_URL / KV_REST_API_TOKEN que usa la
//     integración de Vercel Marketplace) se usa Redis. Esto es OBLIGATORIO
//     en producción/Vercel: el sistema de archivos de las funciones
//     serverless es de solo lectura fuera de /tmp, y /tmp NO persiste entre
//     invocaciones ni se comparte entre instancias — por eso los registros
//     nuevos "desaparecían" antes de este cambio.
//   - Si no hay credenciales (ej. estás probando en tu computador sin una
//     cuenta de Upstash) se usa un archivo JSON local en /data, solo para
//     desarrollo. En ese modo los datos NO persisten en Vercel.
// =============================================================================

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { Partido, Prediccion, Resultado } from "./types";

const SEED_DIR = path.join(process.cwd(), "data");

function leerSeed<T>(filename: string): T {
  const file = path.join(SEED_DIR, filename);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

// ---------------------------------------------------------------------------
// Partidos (fixture fijo, solo lectura)
// ---------------------------------------------------------------------------
export function getPartidos(): Partido[] {
  return leerSeed<Partido[]>("partidos.json");
}

// ---------------------------------------------------------------------------
// Cliente de Redis (si hay credenciales configuradas)
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

const KEY_PREDICCIONES = "polla2026:predicciones";
const KEY_RESULTADO = "polla2026:resultado";

// ---------------------------------------------------------------------------
// Respaldo por archivo JSON (solo para desarrollo local sin Redis)
// ---------------------------------------------------------------------------
const RUNTIME_DIR = process.env.VERCEL ? path.join("/tmp", "polla-mundial-2026-data") : SEED_DIR;

function ensureRuntimeFile(filename: string) {
  if (RUNTIME_DIR === SEED_DIR) return;
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  const target = path.join(RUNTIME_DIR, filename);
  if (!fs.existsSync(target)) fs.copyFileSync(path.join(SEED_DIR, filename), target);
}

function readJSONFallback<T>(filename: string): T {
  ensureRuntimeFile(filename);
  return JSON.parse(fs.readFileSync(path.join(RUNTIME_DIR, filename), "utf-8")) as T;
}

function writeJSONFallback<T>(filename: string, data: T): void {
  ensureRuntimeFile(filename);
  fs.writeFileSync(path.join(RUNTIME_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Predicciones
// ---------------------------------------------------------------------------
export async function getPredicciones(): Promise<Prediccion[]> {
  if (redis) {
    const data = await redis.get<Prediccion[]>(KEY_PREDICCIONES);
    return data ?? [];
  }
  return readJSONFallback<Prediccion[]>("predicciones.json");
}

export async function upsertPrediccion(pred: Prediccion): Promise<Prediccion[]> {
  const actuales = await getPredicciones();
  const nombreNormalizado = pred.usuario.trim().toLowerCase();
  const filtradas = actuales.filter((p) => p.usuario.trim().toLowerCase() !== nombreNormalizado);
  const nuevas = [...filtradas, pred];
  if (redis) await redis.set(KEY_PREDICCIONES, nuevas);
  else writeJSONFallback("predicciones.json", nuevas);
  return nuevas;
}

/**
 * Elimina por completo la predicción de un participante (ej. registros
 * duplicados por error). Solo se llama desde la ruta de administrador
 * /api/admin/predicciones, protegida con usuario y contraseña.
 */
export async function eliminarPrediccion(usuario: string): Promise<Prediccion[]> {
  const actuales = await getPredicciones();
  const nombreNormalizado = usuario.trim().toLowerCase();
  const filtradas = actuales.filter((p) => p.usuario.trim().toLowerCase() !== nombreNormalizado);
  if (redis) await redis.set(KEY_PREDICCIONES, filtradas);
  else writeJSONFallback("predicciones.json", filtradas);
  return filtradas;
}

export async function importarPredicciones(nuevas: Prediccion[]): Promise<Prediccion[]> {
  const actuales = await getPredicciones();
  const nombresNuevos = new Set(nuevas.map((p) => p.usuario.trim().toLowerCase()));
  const conservadas = actuales.filter((p) => !nombresNuevos.has(p.usuario.trim().toLowerCase()));
  const resultado = [...conservadas, ...nuevas];
  if (redis) await redis.set(KEY_PREDICCIONES, resultado);
  else writeJSONFallback("predicciones.json", resultado);
  return resultado;
}

// ---------------------------------------------------------------------------
// Resultados oficiales
// ---------------------------------------------------------------------------
export async function getResultado(): Promise<Resultado> {
  if (redis) {
    const data = await redis.get<Resultado>(KEY_RESULTADO);
    return data ?? { picks: {} };
  }
  return readJSONFallback<Resultado>("resultados.json");
}

export async function guardarResultado(resultado: Resultado): Promise<Resultado> {
  if (redis) await redis.set(KEY_RESULTADO, resultado);
  else writeJSONFallback("resultados.json", resultado);
  return resultado;
}

/** true si la app está usando Redis (persistencia real) en vez del respaldo JSON local. */
export function usandoRedis(): boolean {
  return redis !== null;
}
