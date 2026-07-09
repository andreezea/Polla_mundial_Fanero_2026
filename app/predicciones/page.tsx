import { getPartidos, getPredicciones } from "@/lib/data";
import PrediccionForm from "@/components/PrediccionForm";

export const dynamic = "force-dynamic";

export default function PrediccionesPage() {
  const partidos = getPartidos();
  const predicciones = getPredicciones();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="section-title">Registrar mi Predicción</h1>
        <p className="mt-2 text-sm text-slate-400">
          Escribe tu nombre y elige un emoji — no hace falta completar todos los partidos ahora. Puedes guardar
          solo tu registro y volver más tarde (con el mismo nombre) para completar o modificar tu predicción. El
          marcador es opcional, pero acertarlo exactamente suma +5 puntos extra.
        </p>
      </div>
      <PrediccionForm partidos={partidos} predicciones={predicciones} />
    </div>
  );
}
