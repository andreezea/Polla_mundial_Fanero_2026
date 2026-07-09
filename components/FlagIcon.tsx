"use client";

import { useState } from "react";
import { infoBandera, urlBandera } from "@/lib/flags";

interface FlagIconProps {
  equipo: string | null | undefined;
  size?: number;
}

/**
 * Bandera del equipo como imagen real (no emoji), para que se vea igual en
 * cualquier sistema operativo/navegador. Si el código de subdivisión falla
 * (ej. Inglaterra), cae automáticamente a la bandera de respaldo.
 */
export default function FlagIcon({ equipo, size = 20 }: FlagIconProps) {
  const info = infoBandera(equipo);
  const [codigo, setCodigo] = useState(info?.codigo ?? null);

  if (!info || !codigo) return null;

  return (
    <img
      src={urlBandera(codigo)}
      alt={info.alt}
      width={size}
      height={Math.round((size * 3) / 4)}
      className="inline-block rounded-[2px] object-cover shrink-0 align-middle"
      style={{ width: size, height: Math.round((size * 3) / 4) }}
      onError={() => {
        if (info.respaldo && codigo !== info.respaldo) setCodigo(info.respaldo);
      }}
    />
  );
}
