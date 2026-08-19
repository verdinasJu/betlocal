# Backtest — ¿tiene ventaja real la estrategia de BetLocal?

Ejecutado en agosto de 2026 sobre datos gratuitos de
[Football-Data.co.uk](https://www.football-data.co.uk). El informe completo con
todas las tablas está en [`backtest-informe.txt`](./backtest-informe.txt) y se
regenera con:

```bash
npm run backtest:data     # descarga los CSV a data/raw (no versionados)
npm run backtest          # imprime el informe
```

## Respuesta corta

La estrategia funciona, pero **el margen es mucho más pequeño de lo que parece
a primera vista y depende por completo de comparar precios entre muchas casas**,
no de predecir partidos.

| | ROI | Apuestas |
|---|---|---|
| LaLiga, configuración elegida mirando LaLiga | **+5,11%** | 1.453 |
| Cinco ligas que no se usaron para elegirla | **+1,53%** | 6.055 |
| Igual, pero apostando solo en Bet365 | **negativo** | 217 |

La caída de +5,1% a +1,5% al cambiar de liga es la medida de cuánto de aquel
número era sobreajuste. El +1,53% fuera de muestra es la estimación honesta, y
**no es estadísticamente significativo**: con esa ventaja harían falta unas
23.000 apuestas para descartar que sea suerte, y tenemos 6.055.

## Cómo está montado

El backtest usa **las mismas funciones que la app** (`src/lib/odds.ts`,
`src/lib/backtest.ts`). Validar una reimplementación paralela no habría servido
de nada: el objetivo es saber si el código que va a recomendar apuestas gana
dinero.

Dos precauciones contra el autoengaño:

- **Nada de mirar al futuro.** La probabilidad justa solo puede salir de cuotas
  existentes en el momento de apostar.
- **El stake de un día se calcula con el bankroll al empezar el día.** Si se
  recalculara apuesta a apuesta, el orden dentro de la jornada cambiaría el
  resultado y el backtest dejaría de ser reproducible.

Dos controles para verificar que el motor no fabrica valor de la nada:

| Control | Resultado | Qué demuestra |
|---|---|---|
| Devigar Pinnacle y apostar en Pinnacle | **0 apuestas** | El devig por sí solo nunca genera EV positivo contra su propia fuente |
| Devigar Pinnacle y apostar a la media del mercado | 63 apuestas, pierde | Sin comparar precios no hay negocio |

Datos: 14 temporadas (2012/13–2025/26), 31.725 partidos, seis ligas europeas.
Mercado 1X2 únicamente, que es lo que traen los CSV gratuitos.

## Lo que hemos aprendido

### 1. El método de devig da casi igual

Sobre el cierre de Pinnacle, los cuatro métodos quedan empatados en la cuarta
cifra decimal:

| Método | RPS | LogLoss |
|---|---|---|
| Multiplicativo | 0,19000 | 0,95258 |
| Aditivo | 0,18993 | 0,95239 |
| Potencia | **0,18993** | **0,95234** |
| Shin | 0,18994 | 0,95240 |

La literatura señala Shin como el mejor, y probablemente lo sea en mercados con
margen alto. Pero en 1X2 con una casa que cobra un 2,45%, no hay margen que
repartir mal. **Conclusión práctica: no merece la pena discutir el método de
devig.** Seguimos con Shin, pero el esfuerzo hay que ponerlo en otra parte.

### 2. El cierre de la casa sharp es el mejor predictor disponible

| Fuente | Momento | Margen | RPS |
|---|---|---|---|
| Pinnacle | cierre | 2,45% | **0,18994** |
| Pinnacle | apertura | 2,58% | 0,19106 |
| Media del mercado | cierre | 4,75% | 0,19207 |
| Bet365 | cierre | 5,58% | 0,19210 |

Esto justifica el enfoque anclado al mercado en lugar de un modelo propio: para
que un Dixon-Coles nuestro aportara algo tendría que bajar de 0,18994, y eso es
batir al consenso de todo el dinero profesional del mundo.

Además, **usar la media del mercado como ancla en vez de una casa sharp pierde
dinero de forma consistente** (entre −1,8% y −6,1% según el umbral). La calidad
del ancla no es un detalle: es la estrategia entera.

### 3. Las cuotas altas destruyen la ventaja

Aquí está el hallazgo que más cambia el producto. ROI por tramo de cuota:

| Cuota | ROI (cierre) | ROI (apertura) |
|---|---|---|
| 1,0–1,5 | +2,6% | +8,6% |
| 1,5–2,0 | −1,6% | +2,7% |
| 2,0–2,5 | +6,1% | +2,8% |
| 2,5–3,5 | **+8,1%** | **+6,0%** |
| 3,5–5,0 | −4,8% | −5,1% |
| 5,0–8,0 | −2,4% | −2,1% |
| más de 8 | −1,3% | −7,6% |

Las dos columnas, que son muestras distintas, coinciden en el corte: **por
encima de 3,5 se pierde dinero**. Es el sesgo favorito/longshot documentado
desde los años setenta: en cuotas largas las casas cargan más margen y, sobre
todo, un error pequeño en la probabilidad estimada se come una ventaja del 2%
entera.

Esto explica una anomalía que al principio parecía un fallo del backtest: **subir
el umbral de EV empeoraba el ROI**. No era el EV, eran las cuotas. Un umbral de
EV alto selecciona automáticamente cuotas altas, porque es donde el EV nominal
sale grande. Acotando la cuota, la anomalía desaparece:

| EV mínimo | cuota ≤ 2,5 | cuota ≤ 3,5 | cuota ≤ 5,0 | cuota ≤ 10 |
|---|---|---|---|---|
| 0% | +3,7% | **+5,9%** | +2,8% | +1,9% |
| 1% | +1,9% | +5,1% | +1,8% | +1,2% |
| 2% | +4,7% | +5,9% | +3,4% | +1,4% |
| 3% | −6,2% | +4,0% | −1,6% | −3,4% |
| 5% | +2,0% | −0,4% | −4,9% | −8,1% |

### 4. Las probabilidades están bien calibradas

Con el ancla sharp, lo que la app diría que es un 30% ocurre el 30%:

| Rango | N | Predicho | Observado | Sesgo |
|---|---|---|---|---|
| 10–20% | 348 | 15,9% | 14,9% | −1,0 pp |
| 20–30% | 823 | 25,9% | 23,9% | −1,9 pp |
| 30–40% | 667 | 33,4% | 33,4% | +0,1 pp |
| 40–50% | 252 | 44,9% | 48,8% | +3,9 pp |
| 50–60% | 215 | 54,8% | 52,1% | −2,7 pp |
| 60–70% | 141 | 64,8% | 65,2% | +0,5 pp |

Es una buena noticia con matiz: las probabilidades son fiables, así que el
cálculo de Kelly no está mintiendo sobre el stake. El problema no es estimar
mal, es que **los precios disponibles casi nunca superan a esa estimación por un
margen suficiente**.

### 5. Betfair Exchange puede sustituir a Pinnacle

Esto importa porque **Pinnacle dejó de publicar datos fiables a mitad de 2025**,
y se ve en los propios ficheros: cobertura del 50% en 2025/26 y del 0% en
2026/27. La investigación previa ya lo apuntaba; aquí queda confirmado con
datos.

Sobre los 3.309 partidos donde existen ambas:

| Ancla | Margen | RPS | LogLoss |
|---|---|---|---|
| Pinnacle | 3,13% | 0,19688 | 0,97662 |
| Betfair Exchange | **0,60%** | **0,19684** | **0,97638** |

El exchange predice igual de bien con un margen cinco veces menor, lo que además
reduce el error del devig. **Es el ancla que debe usar la ingesta.**

## Decisiones que se toman a partir de esto

1. **Filtros por defecto a cuota 1,20–3,50**, no 1,50–6,00. El tope anterior
   apuntaba justo a la zona que pierde dinero. Aplicado en `src/lib/settings.ts`
   y en la migración `20260819230000_odds_filter_defaults.sql`.
2. **El ancla de la ingesta es Betfair Exchange**, con Pinnacle como refuerzo
   mientras siga dando datos.
3. **La prioridad de la ingesta es la cobertura de casas, no la sofisticación del
   modelo.** Todo el resultado positivo viene de encontrar la casa que se ha
   desviado; con una sola casa el ROI es negativo. Esto reordena el trabajo
   pendiente: primero muchos proveedores de cuotas, después modelado.
4. **El umbral de EV se queda en el 2%.** Entre el 1% y el 2% no hay diferencia
   apreciable, y el 2% reduce el volumen de apuestas, que interesa para no
   llamar la atención de las casas.
5. **No se construye un modelo Dixon-Coles propio todavía.** Tendría que batir
   un RPS de 0,18994 para aportar algo, y hay trabajo con mucho mejor retorno
   antes de intentarlo.

## Lo que este backtest no prueba

Hay que ser honesto con los límites, porque son grandes:

- **No hay significancia estadística.** +1,53% sobre 6.055 apuestas es
  compatible con no tener ninguna ventaja.
- **La "mejor cuota del mercado" no es alcanzable.** Es el máximo entre 30 o 40
  casas, muchas no operativas en España. Restringido a Bet365 el ROI es
  negativo. La ventaja real está entre ese negativo y el +1,53%, y depende de
  cuántas casas reales se puedan cubrir.
- **Las casas limitan a los ganadores.** Ningún backtest recoge que te cierren
  la cuenta al tercer mes, y es el riesgo operativo más probable.
- **Solo se ha probado 1X2.** Los mercados de goles y handicap asiático tienen
  márgenes menores y suelen ofrecer más valor, pero los CSV gratuitos no traen
  suficiente detalle para validarlos.
- **El tope de cuota se eligió con los datos.** Tiene respaldo teórico y aguanta
  fuera de muestra, pero el valor exacto de 3,5 está ajustado a lo observado.
