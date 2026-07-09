import { NextResponse } from "next/server";
import { getPredicciones, getResultado } from "@/lib/data";
import { construirRanking } from "@/lib/scoring";

// Evita que Next.js pre-renderice esta ruta como estática en build time:
// el ranking depende de datos que cambian en tiempo real.
export const dynamic = "force-dynamic";

export async function GET() {
  const predicciones = getPredicciones();
  const resultado = getResultado();
  const ranking = construirRanking(predicciones, resultado);
  return NextResponse.json(ranking);
}
