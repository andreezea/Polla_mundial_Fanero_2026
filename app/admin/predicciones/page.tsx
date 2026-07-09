import { getPartidos, getPredicciones } from "@/lib/data";
import AdminPrediccionForm from "@/components/AdminPrediccionForm";

export const dynamic = "force-dynamic";

export default async function AdminPrediccionesPage() {
  const partidos = getPartidos();
  const predicciones = await getPredicciones();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="section-title">✏️ Editar Predicciones (Admin)</h1>
        <p className="mt-2 text-sm text-slate-400">
          Corrige o completa la predicción de cualquier participante, incluso si el partido ya empezó o venció
          el plazo del Campeón/Subcampeón. Útil cuando alguien se olvidó de marcar algo o no entendió bien las
          instrucciones.
        </p>
      </div>
      <AdminPrediccionForm partidos={partidos} predicciones={predicciones} />
    </div>
  );
}
