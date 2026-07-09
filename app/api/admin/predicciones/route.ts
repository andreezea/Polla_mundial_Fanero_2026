import { NextResponse } from "next/server";
import { getPredicciones, upsertPrediccion } from "@/lib/data";
import { Prediccion } from "@/lib/types";

// =============================================================================
// Ruta exclusiva de administrador (protegida por middleware.ts con usuario y
// contraseña). A diferencia de /api/predicciones, aquí NO se aplican los
// bloqueos por horario (ni el de 5 minutos antes de cada partido, ni el
// plazo fijo de Campeón/Subcampeón): es para que el administrador pueda
// corregir o completar el registro de un participante que no marcó algo,
// aunque el partido ya haya empezado.
// =============================================================================

export async function GET() {
  const predicciones = await getPredicciones();
  return NextResponse.json(predicciones);
}

export async function POST(request: Request) {
  const body = await request.json();
  const pred = body as Prediccion;

  if (!pred.usuario || !pred.usuario.trim()) {
    return NextResponse.json({ error: "Falta el nombre del participante." }, { status: 400 });
  }

  pred.timestamp = new Date().toISOString();
  const nuevas = await upsertPrediccion(pred);
  return NextResponse.json(nuevas);
}
