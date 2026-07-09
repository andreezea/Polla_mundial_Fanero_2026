import { NextResponse } from "next/server";
import { getPredicciones, upsertPrediccion, importarPredicciones } from "@/lib/data";
import { Prediccion } from "@/lib/types";

export async function GET() {
  const predicciones = getPredicciones();
  return NextResponse.json(predicciones);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Carga masiva (array de predicciones, ej. import desde Excel ya parseado)
  if (Array.isArray(body)) {
    const nuevas = importarPredicciones(body as Prediccion[]);
    return NextResponse.json(nuevas);
  }

  const pred = body as Prediccion;
  if (!pred.usuario || !pred.usuario.trim()) {
    return NextResponse.json({ error: "El nombre del participante es obligatorio." }, { status: 400 });
  }

  pred.timestamp = new Date().toISOString();
  const nuevas = upsertPrediccion(pred);
  return NextResponse.json(nuevas);
}
