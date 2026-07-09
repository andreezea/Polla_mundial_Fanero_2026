import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Polla Mundialista 2026",
  description: "Dashboard ejecutivo de predicciones para Cuartos, Semifinal y Final del Mundial 2026",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Nav />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
          {children}
        </main>
        <footer className="border-t border-surface-border py-4 text-center text-xs text-slate-500">
          Polla Mundialista 2026 · Cuartos de Final · Semifinales · Final
        </footer>
      </body>
    </html>
  );
}
