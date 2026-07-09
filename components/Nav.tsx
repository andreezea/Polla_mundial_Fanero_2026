"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, ShieldCheck, Trophy, BarChart3, Database, Lock } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/predicciones", label: "Registrar Predicción", icon: ClipboardList },
  { href: "/resultados", label: "Resultados Reales", icon: ShieldCheck, admin: true },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/visualizaciones", label: "Visualizaciones", icon: BarChart3 },
  { href: "/api/export", label: "Exportar Excel", icon: Database, external: true, admin: true },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-surface-border bg-navy-800/95 backdrop-blur supports-[backdrop-filter]:bg-navy-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:block font-extrabold text-white tracking-tight">
              Polla Mundialista <span className="text-gold">2026</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {LINKS.map(({ href, label, icon: Icon, external, admin }) => {
              const active = !external && (href === "/" ? pathname === "/" : pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  target={external ? "_blank" : undefined}
                  title={admin ? "Solo administrador (pide usuario y contraseña)" : undefined}
                  className={clsx(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/15 text-gold border border-gold/40"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{label}</span>
                  {admin && <Lock size={12} className="text-slate-500" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
