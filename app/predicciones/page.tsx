import { getPartidos, getPredicciones } from "@/lib/data";
import PrediccionForm from "@/components/PrediccionForm";

export const dynamic = "force-dynamic";

export default async function PrediccionesPage() {
  const partidos = getPartidos();
  const predicciones = await getPredicciones();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="section-title">Registrar mi Predicción</h1>
        <p className="mt-2 text-sm text-slate-400">
          Escribe tu nombre y elige un emoji — no hace falta completar todos los partidos ahora. Puedes guardar
          solo tu registro y volver más tarde (con el mismo nombre) para completar o modificar tu predicción.
          Acertar el marcador exacto suma +5 puntos extra. El marcador que elijas se compara solo contra el
          resultado de los 90 minutos (tiempo regular); el equipo que marques como ganador es el que clasifica a
          la siguiente ronda, sin importar si fue en los 90 minutos, tiempo extra o penales.
        </p>
      </div>
      <PrediccionForm partidos={partidos} predicciones={predicciones} />
    </div>
  );
}
