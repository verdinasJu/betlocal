# BetLocal — Investigación

Documento de trabajo para decidir el stack de datos y la metodología del modelo.
Última actualización: 20 de agosto de 2026.

> Los precios se han verificado en las páginas oficiales en la fecha indicada y
> cambian con frecuencia. Contrasta antes de suscribirte.

---

## Índice

1. [El hallazgo que condiciona el diseño](#1-el-hallazgo-que-condiciona-el-diseño)
2. [Proveedores de cuotas](#2-proveedores-de-cuotas)
3. [Proveedores de estadísticas](#3-proveedores-de-estadísticas)
4. [Datos históricos gratuitos](#4-datos-históricos-gratuitos)
5. [Stacks recomendados](#5-stacks-recomendados)
6. [Cómo fijan precio las casas](#6-cómo-fijan-precio-las-casas)
7. [Modelos estadísticos](#7-modelos-estadísticos)
8. [Gestión de bankroll](#8-gestión-de-bankroll)
9. [Cómo medir si funciona](#9-cómo-medir-si-funciona)
10. [alphametri.co](#10-alphametrico)
11. [Riesgos y marco legal](#11-riesgos-y-marco-legal)
12. [Pendiente de investigar](#12-pendiente-de-investigar)

---

## 1. El hallazgo que condiciona el diseño

Todo el planteamiento de BetLocal (y de alphametri) se apoya en anclar el modelo
a una casa eficiente y detectar dónde el resto del mercado se desvía. La casa de
referencia por defecto es Pinnacle: margen ~2%, límites altos y no limita a los
ganadores, así que el dinero informado corrige su línea y su cuota de cierre es
el mejor estimador público de la probabilidad real.

**Pero hay un problema con la vía gratuita.** Football-Data.co.uk advierte que
**desde el 23/07/2025 la API pública de Pinnacle se ha vuelto poco fiable**: sus
cuotas quedan sistemáticamente desactualizadas respecto a otras casas, tanto las
de apertura como las de cierre. Han dejado de usar Pinnacle para calcular la
media y el máximo del mercado ([nota oficial](https://football-data.co.uk/downloadm.php)).

Consecuencias prácticas para nosotros:

- **No podemos raspar Pinnacle por la vía pública gratuita** y fiarnos del
  resultado. Una cuota justa calculada sobre una línea rancia es, en palabras de
  [pinnapi](https://pinnapi.com/blog/pinnacle-no-vig-fair-odds), "una respuesta
  equivocada dicha con seguridad".
- **Sí podemos usar Pinnacle vía agregador de pago** (The Odds API Business,
  OddsPapi, OpticOdds), que mantienen feeds propios.
- **Conviene un ancla secundaria**: Betfair Exchange, que al ser mercado real de
  contrapartida es muy eficiente en partidos líquidos como los de LaLiga. El
  consenso del sector es usar Pinnacle primero y Betfair cuando el mercado de
  Pinnacle es fino o sospechoso.

Decisión de arquitectura: el campo `bookmaker` de `odds_snapshots` y el
`sharpBookmaker` de cada partido ya están preparados para esto. El ancla debe
ser **configurable**, no cableada a Pinnacle.

---

## 2. Proveedores de cuotas

| Proveedor | LaLiga | Pinnacle | Mercados | Histórico | Precio | Free tier |
|---|---|---|---|---|---|---|
| [The Odds API](https://the-odds-api.com/) | Sí (`soccer_spain_la_liga`) | Solo plan Business | h2h, spreads, totals | Archivo completo (10× coste en créditos, gratis en Business) | 30 $/mes (20K créditos), 59 $ (100K), 249 $ (15M). Business 99 $ | 500 créditos/mes, sin casas sharp |
| [OddsPapi](https://oddspapi.io/) | Sí | Sí, + Singbet | Todos los del board | Incluido sin multiplicador | Volumen a medida | 250 peticiones/mes |
| [SportsGameOdds](https://sportsgameodds.com/) | Sí | Sí | Amplios | Cuotas de cierre | 99–499 $/mes | Sí + prueba 7 días |
| [OpticOdds](https://opticodds.com/) | Sí | Sí | 200+ operadores | No publicado | Solo con comercial | No |
| [Betfair Exchange](https://developer.betfair.com/) | Sí | — (es exchange) | Todos + Stream API | [Servicio aparte de pago](https://historicdata.betfair.com/) | App key retardada gratis; **live 499 £ un pago** | Sí (retardo 1–180 s) |
| [API-Football](https://www.api-football.com/) | Sí | Parcial | Pre-match e in-play | Según plan | 19–39 $/mes | 100 peticiones/día |

### Notas que importan

**El sistema de créditos de The Odds API engaña.** Un crédito no es una
petición: cuesta `mercados × regiones`. Pedir 3 mercados en 2 regiones son 6
créditos por llamada, así que los 500 gratuitos son unas 83 llamadas reales, y
solo 8 si son históricas (multiplicador ×10). Y lo más importante para nosotros:
**Pinnacle solo está en el plan Business de 99 $/mes**. El plan gratuito y el Pro
traen ~40 casas soft, sin ancla sharp, que es justo lo que necesitamos.

**Mercados limitados.** The Odds API cubre `h2h`, `spreads` y `totals`. No hay
BTTS ni córners ni tarjetas. Nuestro `poisson.ts` puede derivar BTTS de la matriz
de resultados, así que esto es salvable, pero conviene saberlo.

**Betfair es la opción infravalorada.** La app key retardada es gratis y sirve
para desarrollo, con retardo variable de 1 a 180 segundos. Para apuestas
prematch, que se colocan horas antes del partido, un retardo de segundos es
irrelevante. La clave live cuesta 499 £ de un solo pago y solo hace falta para
colocar apuestas por API, algo que no vamos a hacer. Ojo: el acceso de solo
lectura con clave live no está permitido, hay que quedarse en la retardada.

---

## 3. Proveedores de estadísticas

| Fuente | Qué da | xG | Histórico | Precio |
|---|---|---|---|---|
| [API-Football](https://www.api-football.com/pricing) | Fixtures, alineaciones, lesiones, sanciones, estadísticas, cuotas | Poco fiable | Según plan | 0 $ (100/día) → 19 $ Pro (7.500/día) → 29 $ Ultra |
| [Understat](https://understat.com/) | xG a nivel de disparo, top-5 ligas | Sí, el mejor gratis | Desde 2014/15 | Gratis (scraping) |
| [FBref](https://fbref.com/) | xG, xA, acciones de creación, stats avanzadas | Sí (datos StatsBomb) | Amplio | Gratis (scraping) |
| [StatsBomb Open Data](https://github.com/statsbomb/open-data) | Eventos completos con xG | Sí | Competiciones selectas | Gratis |
| [ClubElo](http://clubelo.com/API) | Ratings Elo diarios por club | — | Histórico completo | Gratis, sin key |
| [football-data.org](https://www.football-data.org/) | Fixtures, resultados, clasificaciones, alineaciones | No | Sí | Gratis (~10 req/min) |
| [TheStatsAPI](https://www.thestatsapi.com/) | 150 competiciones, xG, cuotas | Sí | 10 años | 50 $/mes, sin free tier |

### La herramienta clave

[`soccerdata`](https://github.com/probberechts/soccerdata) (Python) unifica el
scraping de FBref, Understat, ClubElo, Football-Data.co.uk, SoFIFA y WhoScored en
una sola librería con caché local. En R el equivalente es
[`worldfootballR`](https://jaseziv.github.io/worldfootballR/).

```python
import soccerdata as sd
understat = sd.Understat(leagues="ESP-La Liga", seasons=2025)
understat.read_league_table()
```

Esto significa que **el xG histórico de LaLiga sale gratis**, y que la parte de
pago solo hace falta para las cuotas en vivo. Es la asimetría que define el
presupuesto del proyecto.

Advertencia: FBref y Understat no ofrecen API oficial. Hay que limitar el ritmo
de peticiones y cachear en local. No es material para un cron agresivo en
producción; el patrón correcto es un backfill periódico a nuestra base de datos.

---

## 4. Datos históricos gratuitos

[Football-Data.co.uk](https://www.football-data.co.uk/data.php) es la pieza más
valiosa y no cuesta nada. CSVs de LaLiga desde 1993/94, con:

- Resultados a tiempo completo y descanso
- Estadísticas de partido desde 2000/01: tiros, tiros a puerta, córners, faltas,
  fueras de juego, tarjetas y árbitro
- Cuotas de hasta 10 casas desde 2000/01
- **Dos juegos de cuotas desde 2019/20**: apertura y cierre. Las de cierre llevan
  `C` en el nombre de la columna
- Cuotas de cierre de Pinnacle en 1X2 desde 2012/13

Columnas relevantes para nosotros:

| Columna | Significado |
|---|---|
| `PSH` / `PSD` / `PSA` | Pinnacle: local / empate / visitante (apertura) |
| `PSCH` / `PSCD` / `PSCA` | Pinnacle **de cierre** |
| `B365H` … | Bet365 |
| `MaxH` / `AvgH` | Máximo y media del mercado |

Con esto se puede hacer todo el backtesting del modelo contra cuotas de cierre
reales sin gastar un euro. Es el primer sitio donde hay que validar cualquier
idea antes de pagar una API.

Recordatorio: por la incidencia de julio de 2025, las columnas de Pinnacle en
temporadas recientes hay que tratarlas con desconfianza.

---

## 5. Stacks recomendados

### Stack MVP — 0 €/mes

| Necesidad | Solución |
|---|---|
| Backtesting con cuotas de cierre | Football-Data.co.uk (CSV) |
| xG histórico | Understat vía `soccerdata` |
| Ratings de fuerza | ClubElo API |
| Fixtures, alineaciones, lesiones | API-Football free (100 req/día) |
| Cuotas prematch | API-Football free + Betfair app key retardada |

Suficiente para construir el modelo, validarlo contra histórico y tener
recomendaciones diarias. La limitación real es que sin Pinnacle fiable el ancla
tiene que ser Betfair.

### Stack de producción — ~120 $/mes

| Necesidad | Solución |
|---|---|
| Cuotas en vivo con Pinnacle | The Odds API Business (99 $) |
| Estadísticas, alineaciones, lesiones | API-Football Pro (19 $) |
| xG | Understat / FBref vía backfill |
| Ancla secundaria | Betfair Exchange (gratis, retardada) |
| Backtesting | Football-Data.co.uk |

### Orden de gasto

No pagar nada hasta que el modelo demuestre CLV positivo sobre el histórico
gratuito. El coste solo se justifica cuando la única limitación sea la latencia
de las cuotas, no la calidad del modelo.

---

## 6. Cómo fijan precio las casas

### El margen

La cuota decimal no es una probabilidad: lleva el margen dentro. La suma de
probabilidades implícitas de un mercado (el *overround*) es mayor que 1:

$$O = \sum_i \frac{1}{o_i} > 1$$

Márgenes típicos en 1X2 de LaLiga: **~2% en Pinnacle**, **4–5% en casas
recreativas** como Bet365 o las españolas. En props de jugador sube al 6–15%.
Cuanto mayor el margen, más difícil que exista valor real.

### Quitar el margen

Aquí está la parte que casi nadie hace bien, y donde el método elegido cambia el
resultado de forma material:

| Método | Fórmula | Cuándo |
|---|---|---|
| Multiplicativo | $p_i = \frac{1/o_i}{O}$ | Rápido, aceptable en mercados equilibrados |
| Aditivo | $p_i = \frac{1}{o_i} - \frac{O-1}{n}$ | Casi nunca; puede dar negativos |
| Potencia / Odds Ratio | Resolver $k$ tal que $\sum p_i^k = 1$ | Mercados desequilibrados |
| **Shin** | Ver abajo | El más preciso para 1X2 |

El **método de Shin** modela el margen como consecuencia de la presencia de
apostantes informados (una proporción $z$ del dinero):

$$p_i = \frac{\sqrt{z^2 + 4(1-z)\dfrac{\pi_i^2}{O}} - z}{2(1-z)}$$

donde $\pi_i = 1/o_i$. Se resuelve $z$ numéricamente para que $\sum p_i = 1$.

La diferencia práctica no es cosmética. El multiplicativo reparte el margen de
forma proporcional, lo que **sobreestima a los longshots y subestima a los
favoritos**, porque las casas cargan más margen en las cuotas altas. Shin corrige
justo eso: quita más margen a los favoritos.

En un 1X2 de 1.90 / 3.60 / 4.20 (overround 4.2%), el multiplicativo da 50.50% al
favorito y Shin 51.04%. Medio punto de probabilidad sobre una cuota de 1.90 es
un punto entero de EV: la diferencia entre creer que tienes valor y tenerlo.

BetLocal usa Shin por defecto (`src/lib/odds.ts`), con los otros tres métodos
implementados para poder comparar.

### Sharp vs soft

- **Sharp** (Pinnacle, Betfair, Circa, casas asiáticas): margen bajo, límites
  altos, aceptan ganadores. Su línea la corrige el dinero informado. *Fijan* el
  precio.
- **Soft** (Bet365, Codere, Winamax y el resto del mercado español): margen alto,
  limitan o cierran cuentas ganadoras. *Copian* el precio con retardo.

El valor vive en ese retardo. La casa soft aún no ha corregido y ofrece una cuota
mejor que la justa. Cuando converge, el valor desaparece: hay que mover rápido.

---

## 7. Modelos estadísticos

### Anclado al mercado (el que usamos)

En lugar de predecir el partido mejor que el mercado, se toma la línea de la casa
sharp, se le quita el margen y se comparan las casas soft contra ese número.
Implementado en `src/lib/recommendations.ts`.

Ventaja: no compites contra Pinnacle, aprovechas que las demás van por detrás.
Es lo que hace alphametri y lo que hacen las herramientas comerciales de EV+.

Límite: solo encuentras valor donde alguien ya se ha equivocado. No genera
ventaja propia, la detecta.

### Poisson y Dixon-Coles

Con dos tasas de gol $\lambda$ (local) y $\mu$ (visitante) se construye la matriz
de resultados exactos y de ella salen todos los mercados de forma coherente:

$$P(X=x, Y=y) = \frac{\lambda^x e^{-\lambda}}{x!} \cdot \frac{\mu^y e^{-\mu}}{y!}$$

El Poisson independiente subestima los resultados bajos: 0-0, 1-1, 1-0, 0-1. Los
equipos ajustan su comportamiento en marcadores apretados, así que los goles no
son independientes. **Dixon-Coles (1997)** corrige con un factor $\tau$ para esos
cuatro resultados y añade decaimiento temporal exponencial para pesar más los
partidos recientes.

Verificado en `src/lib/poisson.ts`: con $\lambda=1.55$, $\mu=1.15$ y
$\rho=-0.05$, la probabilidad de empate sube de 25.22% a 26.42%. La corrección
funciona en la dirección esperada.

### Ideas para mejorar

- **Modelar xG en lugar de goles.** El xG es mejor predictor del rendimiento
  futuro que los goles marcados, porque elimina la varianza del remate. Con
  Understat gratis, no hay excusa.
- **Elo como feature.** ClubElo da ratings diarios gratis, sin scraping.
- **Ajuste inverso.** `fitLambdasTo1x2()` ya hace lo contrario: partir del 1X2
  del mercado y sacar las tasas de gol coherentes, para derivar mercados
  secundarios que la casa sharp no cotiza.
- **Bayesianos jerárquicos** (Baio & Blangiardo) si se quiere cuantificar la
  incertidumbre de cada estimación, algo que importa mucho al aplicar Kelly.

Sobre machine learning: raramente bate al mercado sin features informativas que
el mercado no tenga. Un XGBoost sobre estadísticas públicas aprende a reproducir
las cuotas, no a superarlas.

---

## 8. Gestión de bankroll

### Valor esperado

$$EV = p \cdot o - 1$$

Un EV de 0.04 significa +4% de retorno esperado por euro apostado.

### Kelly

$$f^* = \frac{p \cdot b - q}{b}, \quad b = o - 1, \quad q = 1-p$$

Kelly completo maximiza el crecimiento logarítmico **solo si $p$ es exacta**. Con
probabilidades estimadas, sobreapostar destruye bankroll más rápido de lo que el
EV lo construye. De ahí Kelly fraccional: 1/4 es el estándar razonable, y es el
valor por defecto de BetLocal, con un tope duro del 2% por apuesta.

### La realidad de la varianza

Un edge del 7% a cuota 2.10 **pierde el 49% de las veces**. Rachas de ocho, diez
o doce apuestas perdidas no son un fallo del modelo: son la distribución
binomial comportándose como debe. El modo de fallo habitual es psicológico —
tres semanas en rojo, conclusión de que el sistema no sirve, abandono justo antes
de la regresión a la media.

---

## 9. Cómo medir si funciona

### CLV es la métrica, no el ROI

El **Closing Line Value** compara la cuota que tomaste con la de cierre de la
casa sharp. Si sistemáticamente cierras mejor que el mercado, tienes ventaja real
independientemente de lo que diga el saldo este mes. **El CLV converge muchísimo
antes que el beneficio.**

Implementado en `clv()` y `clvDevigged()` (`src/lib/odds.ts`). La segunda versión
compara contra la cuota de cierre ya limpia de margen, que es lo correcto.

### Calibración

Si el modelo dice 30% y a la larga ocurre el 30%, está calibrado. Sin
calibración, el EV calculado es ficción aunque el modelo ordene bien los
partidos. En `src/lib/metrics.ts`: Brier score, log loss y curva de calibración.

### RPS

El **Ranked Probability Score** es la métrica estándar en fútbol porque penaliza
según la distancia ordinal: predecir victoria local cuando gana el visitante es
peor que predecir empate, y el RPS lo refleja mientras el Brier no.

$$RPS = \frac{1}{r-1}\sum_{i=1}^{r-1}\left(\sum_{j=1}^{i}(p_j - a_j)\right)^2$$

### Cuántas apuestas hacen falta

`betsNeededForSignificance()` calcula el tamaño de muestra necesario para que un
edge sea estadísticamente detectable. Con cuotas ~2.00 y un edge del 2%, salen
decenas de miles de apuestas. Por eso el ROI a corto plazo no dice nada.

---

## 10. alphametri.co

### Producto

| Elemento | Detalle |
|---|---|
| Propuesta | Cruzar cuotas eficientes de Pinnacle con modelos propios para aislar cuota justa, EV y score de cada mercado |
| Métricas | Odds, Fair Odds, EV%, Score por mercado, y *Match edge* 0–100 |
| Mercados | 1X2, Totals, Handicap, BTTS |
| Monetización | Tokens: 1 token = ver mercados de un partido, 3 tokens = "Alphλ Read". Prueba de 15 días con 5 tokens/día, sin tarjeta. Lo desbloqueado queda desbloqueado |
| Transparencia | Sellado criptográfico de cada lectura **antes** del partido, con histórico de acierto verificable sin cuenta |
| Postura | "El sistema no predice el resultado ni te dice qué hacer": radar, no oráculo |

Su *Match edge* agrega el EV de los mercados con desviación, ponderando más las
cuotas bajas con EV alto. Declaran que 65+ indica alta densidad de oportunidades.
BetLocal implementa la misma idea en `computeMatchEdge()`.

### Stack

Verificado por cabeceras HTTP y HTML público:

- **Hosting**: Vercel (`server: Vercel`, `x-vercel-id: cdg1::iad1`)
- **Framework**: SvelteKit (no Next.js)
- **Subdominio de app**: `app.alphametri.co`
- **i18n**: rutas `/en` y `/es`

No he podido determinar por medios públicos su base de datos, auth ni pasarela de
pago.

### Dónde se le puede mejorar

1. **CLV real, no solo acierto histórico.** Ellos publican precisión de las
   lecturas. Nadie publica el CLV medio de sus señales, que es la prueba dura.
2. **Registro de apuestas del usuario.** Su producto termina en la señal.
   Cerrando el ciclo (qué apostaste, a qué cuota, cómo cerró) el usuario mide su
   ventaja, no la del sistema.
3. **Dimensionamiento de la apuesta.** No dan stake. Un EV sin Kelly es media
   herramienta. BetLocal ya lo hace.
4. **Ancla configurable.** Dado el problema de Pinnacle de 2025, depender de una
   sola casa de referencia es frágil.
5. **Mercados menos eficientes.** Córners y tarjetas tienen márgenes más altos
   pero también modelos peores por parte de las casas.

---

## 11. Riesgos y marco legal

### Limitación de cuentas

Las casas soft limitan o cierran las cuentas que ganan de forma consistente. Es
el riesgo operativo principal de toda esta estrategia: el problema no es
encontrar valor, es poder seguir apostándolo. Pinnacle y los exchanges no
limitan, pero son precisamente los que no ofrecen valor.

### España

- BetLocal informa y analiza; no acepta apuestas ni actúa de intermediario, así
  que no requiere licencia de la DGOJ. La licencia es para operar juego.
- El **Real Decreto 958/2020** restringe con fuerza la publicidad del juego en
  España. Cualquier promoción pública del proyecto hay que revisarla con cuidado.
- Las advertencias de edad y de juego responsable deben estar visibles. Ya están
  en el login, en Ajustes y en la pantalla principal.

### Honestidad del sistema

El patrón de alphametri de sellar las predicciones antes del partido es la única
forma creíble de demostrar resultados. Sin sello previo, cualquier histórico de
acierto es una afirmación no verificable. El campo `payload_hash` y `sealed_at`
de la tabla `predictions` está para esto.

---

## 12. Pendiente de investigar

- Cobertura real de casas **españolas** (Codere, Bet365.es, Winamax.es) en cada
  agregador. Es determinante: una cuota que no puedo apostar no vale nada.
- Precio y condiciones exactas de OddsPapi por encima del free tier. Su
  comparativa es material de marketing propio y hay que contrastarla.
- Betfair Historical Data: coste real y granularidad.
- Márgenes observados por mercado en LaLiga, medidos con datos propios.
- Rho óptimo de Dixon-Coles y vida media del decaimiento temporal para LaLiga,
  ajustados sobre los CSV de Football-Data.
- Quién está detrás de alphametri y qué explica públicamente de su metodología.
- Benchmark de competencia: OddsJam, RebelBetting, BetBurger, Trademate.

---

## Bibliografía

- [Football-Data.co.uk — datos y notas](https://www.football-data.co.uk/data.php)
- [The Odds API — documentación](https://theoddsapi.com/docs/) y [FAQ de precios](https://theoddsapi.com/faq)
- [API-Football — precios](https://www.api-football.com/pricing)
- [Betfair Developer Program — costes de API](https://support.developer.betfair.com/hc/en-us/articles/115003864531-Are-there-any-costs-associated-with-API-access)
- [Betfair — Application Keys](https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687105/Application+Keys)
- [soccerdata (Python)](https://github.com/probberechts/soccerdata) · [worldfootballR (R)](https://jaseziv.github.io/worldfootballR/)
- [ClubElo API](http://clubelo.com/API)
- [StatsBomb Open Data](https://github.com/statsbomb/open-data)
- [Cálculo de cuotas justas sin margen desde Pinnacle](https://pinnapi.com/blog/pinnacle-no-vig-fair-odds)
- [Value betting contra casas soft](https://pinnapi.com/blog/value-betting-soft-bookmakers)
- [Casas sharp: Pinnacle y Betfair](https://www.sharkbetting.com/blog/sharp-books-explained)
- [Fuentes de datos de fútbol, junio 2026](https://gist.github.com/hungson175/b804219579b3c3f6deb53dd0421d071a)
