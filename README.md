# 🏆 Polla Mundialista 2026

Aplicación web (Next.js 14 + App Router + TypeScript + Tailwind CSS) para gestionar una polla del Mundial 2026,
enfocada en Cuartos de Final, Semifinales y Final. Incluye el bracket real de cuartos (Francia-Marruecos,
España-Bélgica, Noruega-Inglaterra, Argentina-Suiza) y 8 predicciones de ejemplo para que el dashboard no se vea vacío.

## Stack

- **Next.js 14** (App Router, Route Handlers para la API)
- **React 18** + **TypeScript**
- **Tailwind CSS 3** (tema ejecutivo oscuro, navy + dorado)
- **Recharts** (gráficos de barras, líneas y torta)
- **xlsx (SheetJS)** para exportar el ranking a Excel
- **JSON como base de datos** (ver limitación importante más abajo)

## Estructura del proyecto

```
polla-mundial-2026/
├── app/
│   ├── page.tsx                 # Dashboard (KPIs, líder, top 5)
│   ├── predicciones/page.tsx    # Registro de predicciones (bracket)
│   ├── resultados/page.tsx      # Carga de resultados oficiales (admin)
│   ├── ranking/page.tsx         # Ranking, podio, leaderboard
│   ├── visualizaciones/page.tsx # Evolución de puntos y distribución
│   └── api/
│       ├── partidos/route.ts     # GET fixture
│       ├── predicciones/route.ts # GET / POST (incluye carga masiva)
│       ├── resultados/route.ts   # GET / POST
│       ├── ranking/route.ts      # GET ranking calculado
│      