import { getPartidos, getResultado } from "@/lib/data";
import ResultadosForm from "@/components/ResultadosForm";

export const dynamic = "force-dynamic";

export default function ResultadosPage() {
  const partidos = getPartidos();
  const resultado = getResultado();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="section-title">Cargar Resultados Oficiales</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sección administrativa: aquí se ingresan los resultados reales del torneo. La app compara automáticamente
          cada predicción contra estos resultados para calcular el ranking.
        </p>
      </div>
      <ResultadosForm partidos={partidos} resultadoInicial={resultado} />
    </div>
  );
}
