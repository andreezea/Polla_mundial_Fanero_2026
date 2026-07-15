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
│       └── export/route.ts       # GET -> descarga .xlsx
├── components/                  # UI reutilizable (KpiCard, MatchCard, RankingTable, charts/...)
├── lib/
│   ├── types.ts                 # Tipos TS
│   ├── bracket.ts                # Resolución de dependencias del bracket
│   ├── scoring.ts                # Sistema de puntaje
│   └── data.ts                   # Acceso a los JSON (lectura/escritura)
├── data/
│   ├── partidos.json             # Fixture fijo (bracket real 2026)
│   ├── predicciones.json         # Predicciones (8 jugadores de ejemplo)
│   └── resultados.json           # Resultados oficiales (vacío hasta cargarlos)
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Sistema de puntaje

Definido en `lib/scoring.ts`:

```ts
export const PTS_GANADOR = 3;
export const PTS_MARCADOR = 5;
export const PTS_CAMPEON = 10;
export const PTS_SUBCAMPEON = 6;
```

- Acierto de ganador (cualquier partido): **+3**
- Acierto de marcador exacto (además del ganador): **+5**
- Acierto del campeón: **+10**
- Acierto del subcampeón: **+6**

## Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para probar el build de producción localmente:

```bash
npm run build
npm run start
```

## ⚠️ Limitación importante: JSON como base de datos en Vercel

El sistema de archivos de las funciones serverless de Vercel es **de solo lectura en producción**, excepto el
directorio efímero `/tmp`. Por eso `lib/data.ts` detecta `process.env.VERCEL` y:

- En **local** (`npm run dev` / `npm run start`) escribe directamente sobre `data/*.json` — persistencia real.
- En **Vercel** escribe sobre `/tmp`, que **no persiste** entre invocaciones frías ni se comparte entre instancias
  o regiones. Es decir: la app funciona (no se rompe), pero cada cierto tiempo (o si Vercel enruta a otra instancia)
  los datos guardados pueden "resetearse" al estado original del repo.

**Para una polla real en producción con varios usuarios simultáneos**, se recomienda migrar `lib/data.ts` a una
base de datos persistente — por ejemplo Vercel KV, Vercel Postgres o Supabase. El resto de la app (páginas,
componentes, API routes) solo llama a las funciones exportadas por `lib/data.ts`, así que la migración implica
reescribir únicamente ese archivo.

Para una demo, presentación a gerencia, o una polla pequeña donde todos cargan sus predicciones en una sola sesión
seguida (por ejemplo, todos entran el mismo día antes de Cuartos), el almacenamiento en JSON funciona bien.

## 🚀 Desplegar en Vercel

### 1. Subir el proyecto a GitHub

```bash
cd polla-mundial-2026
git init
git add .
git commit -m "Polla Mundialista 2026"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/polla-mundial-2026.git
git push -u origin main
```

(También puedes crear el repo vacío en GitHub y usar "uploading an existing file" para arrastrar la carpeta
completa sin usar la terminal.)

### 2. Conectar con Vercel

1. Ve a [vercel.com/new](https://vercel.com/new) e inicia sesión con tu cuenta de GitHub.
2. Elige **"Import Project"** y selecciona el repositorio `polla-mundial-2026`.
3. Vercel detecta automáticamente que es un proyecto Next.js — no necesitas cambiar ningún ajuste de build
   (Build Command: `next build`, Output: automático).

### 3. Deploy

1. Haz clic en **"Deploy"**.
2. En 1-2 minutos tendrás tu URL pública tipo `https://polla-mundial-2026.vercel.app`.
3. Cada `git push` a `main` vuelve a desplegar automáticamente.

## Funcionalidades incluidas

- Dashboard ejecutivo con KPIs (jugadores, promedio de puntos, partidos con resultado, puntaje máximo) y banner de líder.
- Registro de predicciones tipo bracket: Cuartos fijos (equipos reales) → Semifinal y Final se arman solos según
  los ganadores que elige cada usuario.
- Carga masiva de predicciones vía Excel (.xlsx).
- Panel admin para cargar resultados oficiales, con recálculo automático del ranking.
- Ranking con posición, puntaje, aciertos de ganador/marcador/finalista, acierto de campeón y % de aciertos.
- Podio (🥇🥈🥉) y leaderboard en gráfico de barras.
- Evolución de puntos por etapa (Cuartos → Semifinal → Final) en gráfico de líneas.
- Distribución de predicciones por partido (gráfico de torta), con filtro por etapa.
- Exportar ranking + predicciones a Excel desde la página de Ranking.
- Filtro por jugador en la tabla de ranking.
- Diseño responsive, tema oscuro corporativo (navy + dorado).
