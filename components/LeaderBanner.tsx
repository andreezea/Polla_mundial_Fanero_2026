interface LeaderBannerProps {
  usuario: string;
  emoji?: string | null;
  puntaje: number;
  pctAciertos: number;
}

export default function LeaderBanner({ usuario, emoji, puntaje, pctAciertos }: LeaderBannerProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-gold to-gold-200 px-5 py-4 text-navy-800 shadow-gold flex items-center gap-3 flex-wrap">
      <span className="text-2xl">🏆</span>
      <p className="font-bold text-base sm:text-lg">
        Líder actual:{" "}
        <span className="underline decoration-2">
          {emoji && <span className="mr-1">{emoji}</span>}
          {usuario}
        </span>{" "}
        con {puntaje} puntos
        <span className="font-medium"> · {pctAciertos}% de aciertos en ganadores</span>
      </p>
    </div>
  );
}
