/**
 * Métricas de evaluación del modelo.
 *
 * El ROI tarda cientos o miles de apuestas en distinguir habilidad de suerte.
 * Estas métricas miden directamente la calidad de las probabilidades y
 * convergen con muchísimas menos observaciones, así que son las que hay que
 * mirar mientras el histórico de apuestas es corto.
 */

/**
 * Brier score multiclase. 0 es perfecto; menor es mejor.
 * `outcome` es el índice del resultado real.
 */
export function brierScore(probs: number[], outcome: number): number {
  return probs.reduce((acc, p, i) => {
    const actual = i === outcome ? 1 : 0;
    return acc + Math.pow(p - actual, 2);
  }, 0);
}

/**
 * Ranked Probability Score: la métrica estándar en fútbol porque penaliza los
 * errores según la distancia ordinal. Predecir victoria local cuando gana el
 * visitante es peor que predecir empate, y el RPS lo refleja; el Brier no.
 *
 *   RPS = 1/(r-1) * sum_{i=1}^{r-1} ( sum_{j=1}^{i} (p_j - a_j) )^2
 *
 * Orden esperado para 1X2: [local, empate, visitante].
 */
export function rankedProbabilityScore(
  probs: number[],
  outcome: number
): number {
  const r = probs.length;
  let cumProb = 0;
  let cumActual = 0;
  let sum = 0;

  for (let i = 0; i < r - 1; i++) {
    cumProb += probs[i];
    cumActual += i === outcome ? 1 : 0;
    sum += Math.pow(cumProb - cumActual, 2);
  }

  return sum / (r - 1);
}

/** Log loss. Penaliza con dureza la confianza mal puesta. */
export function logLoss(probs: number[], outcome: number, eps = 1e-15): number {
  const p = Math.min(Math.max(probs[outcome], eps), 1 - eps);
  return -Math.log(p);
}

export type CalibrationBin = {
  from: number;
  to: number;
  count: number;
  predicted: number;
  observed: number;
};

/**
 * Curva de calibración. Si el modelo dice 30% y a la larga ocurre el 30%,
 * está calibrado. Desviaciones sistemáticas indican que el EV calculado es
 * ficticio aunque el modelo ordene bien los partidos.
 */
export function calibrationBins(
  samples: { prob: number; hit: boolean }[],
  bins = 10
): CalibrationBin[] {
  const result: CalibrationBin[] = [];

  for (let b = 0; b < bins; b++) {
    const from = b / bins;
    const to = (b + 1) / bins;
    const inBin = samples.filter(
      (s) => s.prob >= from && (b === bins - 1 ? s.prob <= to : s.prob < to)
    );

    result.push({
      from,
      to,
      count: inBin.length,
      predicted: inBin.length
        ? inBin.reduce((a, s) => a + s.prob, 0) / inBin.length
        : 0,
      observed: inBin.length
        ? inBin.filter((s) => s.hit).length / inBin.length
        : 0,
    });
  }

  return result;
}

/**
 * Yield (ROI sobre importe apostado). Es lo que se suele publicitar, pero con
 * muestras pequeñas su intervalo de confianza es enorme.
 */
export function yieldPct(profit: number, staked: number): number {
  return staked > 0 ? profit / staked : 0;
}

/**
 * Apuestas necesarias para detectar un edge dado con significancia estadística.
 * Aproximación normal: n ≈ ((z * sigma) / edge)^2
 *
 * Con cuotas ~2.00 y un edge del 2%, salen decenas de miles de apuestas. Por eso
 * el CLV y la calibración son los indicadores útiles a corto plazo, no el ROI.
 */
export function betsNeededForSignificance(params: {
  edge: number;
  avgOdds: number;
  z?: number;
}): number {
  const { edge, avgOdds, z = 1.96 } = params;
  if (edge <= 0) return Infinity;
  const p = (1 + edge) / avgOdds;
  const variance = p * Math.pow(avgOdds - 1, 2) + (1 - p) * 1 - Math.pow(edge, 2);
  const sigma = Math.sqrt(Math.max(variance, 0));
  return Math.ceil(Math.pow((z * sigma) / edge, 2));
}
