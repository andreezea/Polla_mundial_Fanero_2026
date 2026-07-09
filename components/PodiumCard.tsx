interface PodiumCardProps {
  posicion: number;
  usuario: string;
  emoji?: string | null;
  puntaje: number;
}

const MEDALLAS = ["🥇", "🥈", "🥉"];

export default function PodiumCard({ posicion, usuario, emoji, puntaje }: PodiumCardProps) {
  return (
    <div className="card p-5 text-center">
      <div className="text-4xl">{MEDALLAS[posicion - 1]}</div>
      <div className="mt-2 font-bold text-white text-lg truncate">
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {usuario}
      </div>
      <div className="text-gold font-extrabold text-xl">{puntaje} pts</div>
    </div>
  );
}
