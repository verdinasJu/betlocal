# Apostar en una sola casa

Este documento explica por qué la app dejó de recomendar "apuesta en tal casa" y
pasó a decir "esta es la cuota que necesitas". El motivo es que el usuario apuesta
únicamente en Bet365.

## El problema

La ventaja que mide el backtest viene de comparar muchas casas y apostar en la
que se ha descolgado del precio justo. Con una sola casa no hay nada que elegir:
o su precio supera el objetivo o no hay apuesta.

Sobre eso se acumulan dos obstáculos de datos.

**The Odds API no cubre Bet365 para fútbol europeo.** En su catálogo solo existe
`bet365_au`, de pago y limitado a deportes australianos. En las 39 casas que
llegaron en la primera ingesta, Bet365 no aparecía.

**Las claves del proveedor son webs nacionales, no marcas.** `betfred_uk`,
`unibet_nl`, `winamax_fr` y `codere_it` son las webs británica, holandesa,
francesa e italiana. Varias de esas marcas sí tienen licencia de la DGOJ
(betfred.es existe), pero la web española cotiza distinto, normalmente peor por
impuestos y margen local. Filtrar por "marca con licencia en España" no basta:
hay que distinguir además de qué país es el precio. Eso es lo que hace
`src/lib/bookmakers.ts`.

## Qué dice el backtest de este escenario

Sección 12 de `npm run backtest`. Ancla Pinnacle con Shin, apuesta en Bet365,
tope de cuota 3.5, seis ligas agrupadas.

| Momento  | EV mínimo | Apuestas | Cuota media | ROI    |
| -------- | --------- | -------- | ----------- | ------ |
| Cierre   | 0%        | 890      | 2.92        | +0,69% |
| Cierre   | 1%        | 435      | 2.97        | +7,39% |
| Cierre   | 2%        | 230      | 2.98        | +5,70% |
| Cierre   | 3%        | 120      | 2.94        | +8,34% |
| Apertura | 1%        | 751      | 3.00        | −7,59% |
| Apertura | 2%        | 350      | 3.12        | −6,43% |

Tres conclusiones, en orden de importancia.

**El momento de apostar decide el signo.** Con cuota de cierre sale positivo y
con cuota de apertura sale negativo, con la misma estrategia y los mismos
partidos. Por eso el panel solo muestra partidos que arrancan en los próximos
tres días: enseñar la jornada siguiente invitaría a apostar temprano, que es
justo lo que pierde dinero.

**No es significativo.** Para confirmar un +7,4% a cuota media 2.97 harían falta
unas 1.400 apuestas y hay 435. El resultado es compatible con no tener ninguna
ventaja.

**El volumen es el problema real.** Esas 435 apuestas salen de 42
temporadas-liga: unas diez por temporada y liga. Con una sola liga el sistema no
llega a generar muestra en años. De ahí la decisión de ingerir seis.

## Lo que hace la app ahora

En vez de una casa recomendada, cada selección muestra:

- **Cuota justa**: la del ancla sharp una vez quitado el margen con el método de
  Shin.
- **Cuota objetivo**: la mínima que cumple el umbral de EV, con el suelo de cuota
  aplicado. Es el número que hay que comparar con Bet365.
- **Mejor precio del mercado**, con una nota de si es ejecutable desde España,
  solo como contexto de cuánto se separan las casas.
- **Un hueco para escribir la cuota de Bet365**, que devuelve EV y stake.

Las casas de referencia (Pinnacle, exchanges) no admiten clientes españoles y no
se presentan como sitios donde apostar: fijan el precio justo y nada más.

## Ajustes que cambiaron

**Ancla: Pinnacle antes que el exchange.** El backtest mide +1,12% anclando en
Pinnacle y −0,06% anclando en el exchange. El código priorizaba el exchange
porque en el histórico de Football-Data.co.uk Pinnacle desaparece a mitad de
2025, pero eso era una limitación del CSV: el feed en vivo sí lo trae.

**Umbral de EV: 1% en vez de 2%.** Con una sola casa las oportunidades son
escasas, y bajar a 1% dobla el número de apuestas sin empeorar el ROI medido. Con
muestras tan pequeñas, no llegar nunca a tener datos es peor que aceptar valor
ajustado.

**Región `eu` en vez de `eu,uk`.** El coste en cuota de API es mercados por
regiones. La región británica duplicaba el gasto para traer sobre todo casas
donde no se puede apostar desde España, y las anclas que importan (Pinnacle y el
exchange de Betfair) están en `eu`.

## Cuánto esperar

Unas diez apuestas por temporada y liga que superen el umbral. Con seis ligas,
del orden de una o dos por semana. Si la app propone más, sospecha de los datos
antes que de la suerte.

La mayor parte del valor de la app no está en las apuestas que recomienda, sino
en las que descarta: Bet365 es una casa con margen del 5-6% frente al 2-3% de
Pinnacle, así que su precio casi nunca supera el objetivo. Saber cuándo no
apostar es lo que evita devolver la ventaja al mercado.
