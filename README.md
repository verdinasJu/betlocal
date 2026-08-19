# BetLocal

Herramienta de análisis cuantitativo de mercados de fútbol (LaLiga). Cruza las cuotas del mercado con modelos propios para estimar **cuotas justas**, **valor esperado (EV)** y un **score** por mercado.

> BetLocal **no** es una casa de apuestas, **no** acepta apuestas y **no** garantiza resultados. Es una herramienta de información estadística. +18. Apostar implica riesgo de pérdida total.

---

## Índice

1. [Qué hace](#qué-hace)
2. [Stack](#stack)
3. [Estructura](#estructura)
4. [Setup local](#setup-local)
5. [Migraciones Supabase](#migraciones-supabase)
6. [Deploy en Vercel](#deploy-en-vercel)
7. [Documentación](#documentación)
8. [Roadmap](#roadmap)

---

## Qué hace

| Zona | Cuenta | Estado | Qué hace |
|------|--------|--------|----------|
| **Hoy** | No | ✅ | Recomendaciones con cuota justa, EV, score y stake calculado |
| **Ajustes** | No | ✅ | Bankroll, fracción de Kelly, tope por apuesta, filtros de EV y cuota |
| **Onboarding** | No | ✅ | Configuración guiada inicial |
| **Login / registro** | — | ✅ | Auth con email + contraseña (Supabase) |
| **Mis apuestas** | Sí | 🚧 | Registro de apuestas y cuota tomada (para calcular CLV) |
| **Rendimiento** | Sí | 🚧 | ROI, yield, CLV medio, Brier score y RPS del modelo |

El flujo previsto: ingesta de cuotas y estadísticas → modelo → cuota justa y EV → tú consultas y decides → registras la apuesta → se compara con la cuota de cierre.

### Modelo de acceso

Las recomendaciones y los ajustes de riesgo funcionan **sin registro**: se guardan en el `localStorage` del dispositivo. La cuenta solo es necesaria para lo que tiene que persistir en servidor:

- **Historial de apuestas**, que es el dato que tarda meses en acumularse y el único que permite demostrar si hay ventaja real.
- **Sincronizar el bankroll** entre móvil y ordenador (`SettingsSync`: el perfil del servidor manda en la primera carga, después cada cambio se replica arriba).

`PROTECTED_PREFIXES` en `src/lib/supabase/middleware.ts` define qué rutas exigen sesión. Si faltan las variables de Supabase, el middleware deja pasar todo y la app funciona en modo local.

---

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** Auth + Postgres + RLS
- **Vercel** hosting y cron jobs
- **Recharts** gráficas

El registro replica el patrón de [que-desastre](https://github.com/verdinasJu/que-desastre): middleware de sesión con `@supabase/ssr` y tabla `profiles` creada por trigger al dar de alta el usuario. La diferencia es que aquí la sesión no se exige para navegar, solo para las rutas que leen o escriben en la base de datos.

---

## Estructura

```
src/app/
  login/              Auth (entrar / crear cuenta)
  onboarding/         Bankroll y perfil de riesgo
  (app)/              Shell con nav inferior
    page.tsx          Hoy: recomendaciones
    apuestas/         Requiere cuenta
    rendimiento/      Requiere cuenta
    ajustes/

src/lib/
  odds.ts             Margen, cuota justa (Shin), EV, Kelly, CLV
  poisson.ts          Matriz de resultados, Dixon-Coles, derivación de mercados
  metrics.ts          Brier, RPS, log loss, calibración
  recommendations.ts  Lectura de partido anclada al mercado
  demo-fixtures.ts    Datos de demo hasta conectar proveedores
  settings.ts         Ajustes de riesgo en localStorage
  supabase/           client, server y middleware de sesión

scripts/
  generate-icons.mjs  Regenera los PNG de la PWA (npm run icons)

supabase/migrations/  001 (auth) → 002 (dominio deportivo)
docs/                 Investigación y decisiones técnicas
```

---

## Setup local

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. **Settings → API**: copia Project URL y `anon` key
3. **SQL Editor**: ejecuta las migraciones de `supabase/migrations/` **en orden**
4. Auth Email activo (en desarrollo puedes desactivar la confirmación de email)

### 2. Entorno

```bash
cp .env.example .env.local
```

Rellena como mínimo:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Las claves de proveedores de datos son opcionales hasta implementar la ingesta.

### 3. Arrancar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

```bash
npm run build   # comprobar producción
npm run lint
```

---

## Migraciones Supabase

Aplicar **en orden** (SQL Editor o CLI):

| Archivo | Contenido |
|---------|-----------|
| `001_initial.sql` | `profiles` (bankroll, Kelly, filtros), trigger de alta, RLS |
| `002_domain.sql` | `competitions`, `teams`, `matches`, `odds_snapshots`, `model_versions`, `predictions`, `bets` + RLS |

Diseño de permisos: el catálogo (partidos, cuotas, predicciones) es de **lectura** para usuarios autenticados y solo la ingesta (`service_role`) escribe. Las apuestas son privadas por usuario.

---

## Deploy en Vercel

1. Push a `main` en GitHub
2. En [vercel.com](https://vercel.com): importar el repo
3. Variables de entorno: las mismas de `.env.local` (más `SUPABASE_SERVICE_ROLE_KEY` y `CRON_SECRET` cuando exista ingesta)
4. Deploy

---

## Documentación

- [docs/INVESTIGACION.md](./docs/INVESTIGACION.md) — APIs de cuotas y estadísticas, metodología de las casas de apuestas, modelos, gestión de bankroll, análisis de competencia y marco legal.

---

## Roadmap

1. ✅ Auth, onboarding y esquema de base de datos
2. Ingesta de cuotas (snapshots periódicos + detección de cuota de cierre)
3. Ingesta de estadísticas y xG histórico
4. Modelo v1: eliminación de margen sobre casa sharp → cuota justa → EV
5. Modelo v2: Dixon-Coles / xG con decaimiento temporal, mezclado con el prior de mercado
6. Backtesting con cuotas de cierre y métricas de calibración (Brier, RPS)
7. Registro de apuestas y cálculo de CLV
8. Sellado de predicciones antes del kickoff (verificabilidad)
