import { NextResponse } from "next/server";
import { getPartidos, getPredicciones, upsertPrediccion, importarPredicciones } from "@/lib/data";
import { sanearPicksBloqueados } from "@/lib/lock";
import { Prediccion } from "@/lib/types";

export async function GET() {
  const predicciones = await getPredicciones();
  return NextResponse.json(predicciones);
}

export async function POST(request: Request) {
  const body = await request.json();
  const partidos = getPartidos();

  // Carga masiva (array de predicciones, ej. import desde Excel ya parseado).
  // Uso administrativo: no se aplica el bloqueo por horario aquí.
  if (Array.isArray(body)) {
    const nuevas = await importarPredicciones(body as Prediccion[]);
    return NextResponse.json(nuevas);
  }

  const pred = body as Prediccion;
  if (!pred.usuario || !pred.usuario.trim()) {
    return NextResponse.json({ error: "El nombre del participante es obligatorio." }, { status: 400 });
  }

  // Bloqueo de partidos que ya comenzaron o están a menos de 5 minutos de
  // empezar: se ignora lo que venga del cliente para esos partidos y se
  // conserva el valor que ya estaba guardado. Esto se hace en el servidor
  // (no solo en la UI) para que no se pueda saltar llamando a la API directo.
  const actuales = await getPredicciones();
  const anterior = actuales.find((p) => p.usuario.trim().toLowerCase() === pred.usuario.trim().toLowerCase());
  pred.picks = sanearPicksBloqueados(pred.picks ?? {}, anterior?.picks ?? {}, partidos);

  pred.timestamp = new Date().toISOString();
  const nuevas = await upsertPrediccion(pred);
  return NextResponse.json(nuevas);
}
