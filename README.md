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

  backtest.ts         Motor de backtest sobre histórico

scripts/
  generate-icons.mjs  Regenera los PNG de la PWA (npm run icons)
  backtest/           Descarga de histórico e informe (npm run backtest)

supabase/migrations/  auth/perfil → dominio deportivo
docs/                 Investigación y decisiones técnicas
```

---

## Setup local

### 1. Supabase

El proyecto ya existe (ref `vajjlrqvnwddpjfdxfev`, región `eu-west-1`). Para
trabajar contra él desde una máquina nueva:

```bash
npx supabase login
npx supabase link --project-ref vajjlrqvnwddpjfdxfev
npx supabase db push        # aplica las migraciones pendientes
npx supabase config push    # aplica supabase/config.toml (Auth)
```

La contraseña de la base de datos vive en `.supabase-db-password.txt`, fuera de
git. Si se pierde se regenera en **Settings → Database → Reset password**.

El alta de usuarios no pide confirmación de email, así que registrarse deja
sesión iniciada al momento. Eso se cambia en `config.toml`
(`auth.email.enable_confirmations`), no en el dashboard, para que quede versionado.

### 2. Entorno

```bash
cp .env.example .env.local
```

O, si ya tienes acceso al proyecto de Vercel, directamente:

```bash
npx vercel env pull .env.local
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

## Ingesta de cuotas

`GET /api/cron/odds`, protegida con `Authorization: Bearer $CRON_SECRET`. Trae
los partidos próximos con las cuotas de todas las casas disponibles y guarda un
snapshot solo de las que han cambiado.

El planificador es un **workflow de GitHub Actions**
([`ingest-odds.yml`](./.github/workflows/ingest-odds.yml)) y no un cron de
Vercel, porque el plan gratuito de Vercel solo ejecuta cron una vez al día y
aquí hace falta más frecuencia para capturar el movimiento de línea. Necesita
dos cosas configuradas en el repositorio: el secreto `CRON_SECRET` y la variable
`APP_URL`.

Sobre la cuota del proveedor: el plan gratuito son 500 peticiones al mes y **cada
llamada cuesta un crédito por mercado y por región**. Por eso la ruta lleva un
guardián que solo llama al proveedor si algún partido arranca en las próximas 14
horas o si toca el refresco diario de calendario. Para saltárselo:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://betlocal.vercel.app/api/cron/odds?force=1"
```

La cuota de cierre se marca con la función SQL `mark_closing_odds()`, sobre datos
que ya están en la base: gastar cuota de API en algo que ya sabemos sería
tirarla.

---

## Backtest

Valida la estrategia contra 14 temporadas de seis ligas europeas usando datos
gratuitos, reutilizando las mismas funciones que la app.

```bash
npm run backtest:data   # descarga los CSV a data/raw (no versionados)
npm run backtest        # imprime el informe completo
```

Conclusiones y límites en [`docs/BACKTEST.md`](./docs/BACKTEST.md). El resumen:
la ventaja fuera de muestra es de **+1,5% de ROI**, viene de comparar precios
entre casas (no de predecir partidos) y **no es estadísticamente
significativa**. De ahí salen los filtros de cuota por defecto (1,20–3,50) y la
decisión de priorizar la cobertura de casas sobre el modelado.

---

## Migraciones Supabase

Aplicar **en orden** (SQL Editor o CLI):

| Archivo | Contenido |
|---------|-----------|
| `..._initial.sql` | `profiles` (bankroll, Kelly, filtros), trigger de alta, RLS |
| `..._domain.sql` | `competitions`, `teams`, `matches`, `odds_snapshots`, `model_versions`, `predictions`, `bets` + RLS |
| `..._odds_filter_defaults.sql` | Filtros de cuota por defecto según el backtest |

Con el CLI ya enlazado basta con:

```bash
npx supabase db push
```

Diseño de permisos: el catálogo (partidos, cuotas, predicciones) es de **lectura pública** (también sin cuenta, igual que las recomendaciones) y solo la ingesta (`service_role`) escribe. Las apuestas son privadas por usuario vía RLS.

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
