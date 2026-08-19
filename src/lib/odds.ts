/**
 * Núcleo matemático de BetLocal.
 *
 * El punto de partida es que una cuota decimal no es una probabilidad: incluye
 * el margen de la casa (overround). Para obtener probabilidades "justas" hay que
 * quitar ese margen, y el método elegido cambia el resultado de forma
 * material — sobre todo en mercados con favoritos muy claros.
 */

export type MarginMethod = "multiplicative" | "additive" | "power" | "shin";

/** Probabilidad implícita bruta (incluye margen). */
export function impliedProb(odds: number): number {
  return 1 / odds;
}

/**
 * Overround del mercado: suma de probabilidades implícitas.
 * 1.05 significa un margen del 5%.
 */
export function overround(odds: number[]): number {
  return odds.reduce((acc, o) => acc + 1 / o, 0);
}

/** Margen expresado como porcentaje sobre 1. */
export function marginPct(odds: number[]): number {
  return overround(odds) - 1;
}

/**
 * Normalización multiplicativa: divide cada probabilidad implícita por el
 * overround. Es el método más usado por su simplicidad, pero asume que la casa
 * aplica el mismo margen relativo a todas las selecciones. En la práctica el
 * margen se carga más sobre las cuotas altas, así que este método sobreestima
 * a los longshots y subestima a los favoritos.
 */
export function fairProbsMultiplicative(odds: number[]): number[] {
  const k = overround(odds);
  return odds.map((o) => 1 / o / k);
}

/**
 * Normalización aditiva: reparte el exceso de probabilidad a partes iguales.
 * Corrige en exceso en la dirección opuesta a la multiplicativa y puede generar
 * probabilidades negativas en mercados con cuotas muy altas.
 */
export function fairProbsAdditive(odds: number[]): number[] {
  const raw = odds.map((o) => 1 / o);
  const excess = (overround(odds) - 1) / odds.length;
  return raw.map((p) => p - excess);
}

/**
 * Método de potencia (power / Odds Ratio de Clarke): busca el exponente k tal
 * que sum(p_i^k) = 1. Modela que el margen no es uniforme entre selecciones.
 */
export function fairProbsPower(odds: number[], tol = 1e-10): number[] {
  const raw = odds.map((o) => 1 / o);
  let lo = 0.5;
  let hi = 1.5;

  const sumAt = (k: number) => raw.reduce((acc, p) => acc + Math.pow(p, k), 0);

  // sum(p^k) es monótona decreciente en k para p < 1
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const s = sumAt(mid);
    if (Math.abs(s - 1) < tol) {
      return raw.map((p) => Math.pow(p, mid));
    }
    if (s > 1) lo = mid;
    else hi = mid;
  }

  const k = (lo + hi) / 2;
  return raw.map((p) => Math.pow(p, k));
}

/**
 * Método de Shin: modela el margen como consecuencia de la presencia de
 * apostantes informados (proporción z de dinero "insider"). La literatura
 * (Štrumbelj, 2014) lo señala como el más preciso de los métodos cerrados para
 * mercados 1X2, precisamente porque no reparte el margen de forma uniforme.
 *
 *   p_i = ( sqrt(z^2 + 4(1-z) * pi_i^2 / O) - z ) / (2(1-z))
 *
 * donde pi_i son las probabilidades implícitas brutas y O el overround.
 */
export function fairProbsShin(odds: number[], tol = 1e-10): number[] {
  const raw = odds.map((o) => 1 / o);
  const O = raw.reduce((a, b) => a + b, 0);

  const probsFor = (z: number) =>
    raw.map((pi) => {
      const inner = z * z + (4 * (1 - z) * (pi * pi)) / O;
      return (Math.sqrt(Math.max(inner, 0)) - z) / (2 * (1 - z));
    });

  let lo = 0;
  let hi = 0.4;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const s = probsFor(mid).reduce((a, b) => a + b, 0);
    if (Math.abs(s - 1) < tol) return probsFor(mid);
    if (s > 1) lo = mid;
    else hi = mid;
  }

  return probsFor((lo + hi) / 2);
}

export function fairProbs(
  odds: number[],
  method: MarginMethod = "shin"
): number[] {
  switch (method) {
    case "multiplicative":
      return fairProbsMultiplicative(odds);
    case "additive":
      return fairProbsAdditive(odds);
    case "power":
      return fairProbsPower(odds);
    case "shin":
      return fairProbsShin(odds);
  }
}

/** Cuota justa = inversa de la probabilidad justa. */
export function fairOdds(
  odds: number[],
  method: MarginMethod = "shin"
): number[] {
  return fairProbs(odds, method).map((p) => 1 / p);
}

/**
 * Valor esperado por unidad apostada.
 *   EV = p * (odds - 1) - (1 - p)  =  p * odds - 1
 * 0.04 significa +4% de retorno esperado por euro apostado.
 */
export function expectedValue(prob: number, odds: number): number {
  return prob * odds - 1;
}

/**
 * Criterio de Kelly para apuesta binaria.
 *   f* = (p * b - q) / b,  con b = odds - 1, q = 1 - p
 * Equivale a EV / (odds - 1).
 */
export function kellyStake(prob: number, odds: number): number {
  const b = odds - 1;
  if (b <= 0) return 0;
  const f = (prob * b - (1 - prob)) / b;
  return Math.max(0, f);
}

/**
 * Stake recomendado en dinero, con Kelly fraccional y tope duro.
 *
 * Kelly completo maximiza el crecimiento logarítmico solo si `prob` es exacta.
 * Con probabilidades estimadas, sobreapostar destruye bankroll más rápido de lo
 * que el EV lo construye, así que se aplica una fracción y un tope.
 */
export function recommendedStake(params: {
  prob: number;
  odds: number;
  bankroll: number;
  kellyFraction: number;
  maxStakePct: number;
}): number {
  const { prob, odds, bankroll, kellyFraction, maxStakePct } = params;
  const kelly = kellyStake(prob, odds) * kellyFraction;
  const capped = Math.min(kelly, maxStakePct / 100);
  return Math.max(0, capped * bankroll);
}

/**
 * Closing Line Value: cuánto mejor fue tu cuota que la de cierre, en términos
 * de probabilidad justa. Positivo y consistente es la mejor evidencia de que
 * tienes ventaja real, y converge mucho antes que el ROI.
 */
export function clv(oddsTaken: number, closingOdds: number): number {
  return oddsTaken / closingOdds - 1;
}

/**
 * Devigged CLV: compara contra la cuota de cierre ya limpia de margen.
 * `closingMarketOdds` debe ser el mercado completo de la casa de referencia.
 */
export function clvDevigged(
  oddsTaken: number,
  closingMarketOdds: number[],
  selectionIndex: number,
  method: MarginMethod = "shin"
): number {
  const fair = fairOdds(closingMarketOdds, method)[selectionIndex];
  return oddsTaken / fair - 1;
}
