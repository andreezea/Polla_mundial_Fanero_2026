import { NextResponse } from "next/server";
import { getResultado, guardarResultado } from "@/lib/data";
import { Resultado } from "@/lib/types";

export async function GET() {
  const resultado = getResultado();
  return NextResponse.json(resultado);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Resultado;
  const guardado = guardarResultado(body);
  return NextResponse.json(guardado);
}
