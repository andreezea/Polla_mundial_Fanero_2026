import { NextResponse } from "next/server";
import { getPartidos } from "@/lib/data";

export async function GET() {
  const partidos = getPartidos();
  return NextResponse.json(partidos);
}
