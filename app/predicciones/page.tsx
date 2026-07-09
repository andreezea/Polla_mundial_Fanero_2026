import { getPartidos } from "@/lib/data";
import PrediccionForm from "@/components/PrediccionForm";

export const dynamic = "force-dynamic";

export default function PrediccionesPage() {
  const partidos = getPartidos();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="section-title">Registrar mi Predicción</h1>
        <p className="mt-2 text-sm text-slate-400">
          Completa tu bracket para los 7 partidos de las etapas finales. El marcador es opcional, pero acertarlo
          exactamente suma +5 puntos extra. Puedes editar y volver a guardar tu predicción cuando quieras.
        </p>
      </div>
      <PrediccionForm partidos={partidos} />
    </div>
  );
}
