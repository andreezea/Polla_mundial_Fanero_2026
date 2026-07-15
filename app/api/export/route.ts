import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getPredicciones, getResultado } from "@/lib/data";
import { construirRanking } from "@/lib/scoring";

// El Excel exportado debe reflejar siempre los datos más recientes.
export const dynamic = "force-dynamic";

export async function GET() {
  const predicciones = await getPredicciones();
  const resultado = await getResultado();
  const ranking = construirRanking(predicciones, resultado);

  const rankingSheet = XLSX.utils.json_to_sheet(
    ranking.map((r) => ({
      Posición: r.posicion,
      Usuario: r.usuario,
      Emoji: r.emoji ?? "",
      "Puntaje Total": r.puntajeTotal,
      "Ganadores Acertados": r.aciertosGanador,
      "Marcadores Exactos": r.aciertosMarcador,
      "Campeón Acertado": r.campeonAcertado ? "Sí" : "No",
      "Subcampeón Acertado": r.subcampeonAcertado ? "Sí" : "No",
      "% Aciertos": r.pctAciertos,
    }))
  );

  const prediccionesSheet = XLSX.utils.json_to_sheet(
    predicciones.map((p) => ({
      Usuario: p.usuario,
      Emoji: p.emoji ?? "",
      Fecha: p.timestamp,
      Campeón: p.campeon ?? "",
      Subcampeón: p.subcampeon ?? "",
      ...Object.fromEntries(
        Object.entries(p.picks).flatMap(([slot, pick]) => [
          [`${slot}_ganador`, pick?.ganador ?? ""],
          [`${slot}_gl`, pick?.golesLocal ?? ""],
          [`${slot}_gv`, pick?.golesVisitante ?? ""],
        ])
      ),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, rankingSheet, "Ranking");
  XLSX.utils.book_append_sheet(workbook, prediccionesSheet, "Predicciones");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="ranking_polla_mundial_2026.xlsx"`,
    },
  });
}
