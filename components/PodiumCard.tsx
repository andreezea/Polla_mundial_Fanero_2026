interface PodiumCardProps {
  posicion: number;
  usuario: string;
  puntaje: number;
}

const MEDALLAS = ["🥇", "🥈", "🥉"];

export default function PodiumCard({ posicion, usuario, puntaje }: PodiumCardProps) {
  return (
    <div className="card p-5 text-center">
      <div className="text-4xl">{MEDALLAS[posicion - 1]}</div>
      <div className="mt-2 font-bold text-white text-lg truncate">{usuario}</div>
      <div className="text-gold font-extrabold text-xl">{puntaje} pts</div>
    </div>
  );
}
