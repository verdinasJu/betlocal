/**
 * Modelo de goles y derivación de mercados.
 *
 * La idea: estimar dos tasas de goles (local y visitante), construir la matriz
 * de resultados exactos, y derivar de ella todos los mercados. Así 1X2,
 * Over/Under, BTTS y handicap asiático quedan garantizadamente coherentes entre
 * sí, que es algo que las casas soft no siempre consiguen.
 */

const MAX_GOALS = 12;

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poissonPmf(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Corrección tau de Dixon-Coles (1997). El Poisson independiente subestima
 * 0-0, 1-1, 1-0 y 0-1: los equipos ajustan su comportamiento en resultados
 * apretados, así que los goles no son independientes.
 *
 * rho negativo (~ -0.03 a -0.13 en ligas europeas) infla los empates bajos.
 */
function dixonColesTau(
  x: number,
  y: number,
  lambda: number,
  mu: number,
  rho: number
): number {
  if (x === 0 && y === 0) return 1 - lambda * mu * rho;
  if (x === 0 && y === 1) return 1 + lambda * rho;
  if (x === 1 && y === 0) return 1 + mu * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

export type ScorelineMatrix = number[][];

/**
 * Matriz de probabilidad de resultados exactos, normalizada.
 * `rho = 0` da el Poisson independiente clásico.
 */
export function scorelineMatrix(
  homeLambda: number,
  awayLambda: number,
  rho = 0,
  maxGoals = MAX_GOALS
): ScorelineMatrix {
  const matrix: ScorelineMatrix = [];
  let total = 0;

  for (let x = 0; x <= maxGoals; x++) {
    matrix[x] = [];
    for (let y = 0; y <= maxGoals; y++) {
      const p =
        poissonPmf(x, homeLambda) *
        poissonPmf(y, awayLambda) *
        dixonColesTau(x, y, homeLambda, awayLambda, rho);
      matrix[x][y] = Math.max(p, 0);
      total += matrix[x][y];
    }
  }

  // La corrección tau rompe la normalización; hay que reescalar.
  for (let x = 0; x <= maxGoals; x++) {
    for (let y = 0; y <= maxGoals; y++) {
      matrix[x][y] /= total;
    }
  }

  return matrix;
}

export function probs1x2(m: ScorelineMatrix) {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (let x = 0; x < m.length; x++) {
    for (let y = 0; y < m[x].length; y++) {
      if (x > y) home += m[x][y];
      else if (x === y) draw += m[x][y];
      else away += m[x][y];
    }
  }
  return { home, draw, away };
}

/** Over/Under de goles totales. `line` típicamente 2.5, 3.5… */
export function probsTotals(m: ScorelineMatrix, line: number) {
  let over = 0;
  let under = 0;
  let push = 0;
  for (let x = 0; x < m.length; x++) {
    for (let y = 0; y < m[x].length; y++) {
      const total = x + y;
      if (total > line) over += m[x][y];
      else if (total < line) under += m[x][y];
      else push += m[x][y];
    }
  }
  return { over, under, push };
}

export function probsBtts(m: ScorelineMatrix) {
  let yes = 0;
  for (let x = 1; x < m.length; x++) {
    for (let y = 1; y < m[x].length; y++) {
      yes += m[x][y];
    }
  }
  return { yes, no: 1 - yes };
}

/**
 * Handicap asiático. `line` es el handicap aplicado al local
 * (−0.5 = el local debe ganar; +1 = le regalan un gol).
 * Devuelve probabilidades condicionadas a que no haya push, porque en un push
 * la apuesta se devuelve y no afecta al EV.
 */
export function probsAsianHandicap(m: ScorelineMatrix, line: number) {
  let home = 0;
  let away = 0;
  let push = 0;

  for (let x = 0; x < m.length; x++) {
    for (let y = 0; y < m[x].length; y++) {
      const diff = x - y + line;
      if (diff > 0) home += m[x][y];
      else if (diff < 0) away += m[x][y];
      else push += m[x][y];
    }
  }

  const live = home + away;
  return {
    home,
    away,
    push,
    homeAdjusted: live > 0 ? home / live : 0,
    awayAdjusted: live > 0 ? away / live : 0,
  };
}

/**
 * Invierte el proceso: dadas probabilidades 1X2 justas, busca las tasas de gol
 * coherentes con ellas. Sirve para anclar el modelo al mercado: se parte de la
 * lectura de una casa sharp y se derivan mercados secundarios que esa casa no
 * ofrece o cotiza peor.
 */
export function fitLambdasTo1x2(
  target: { home: number; draw: number; away: number },
  rho = 0,
  iterations = 400
): { homeLambda: number; awayLambda: number; error: number } {
  let homeLambda = 1.45;
  let awayLambda = 1.15;
  let bestError = Infinity;
  let best = { homeLambda, awayLambda };

  const errorFor = (hl: number, al: number) => {
    const p = probs1x2(scorelineMatrix(hl, al, rho, 10));
    return (
      Math.pow(p.home - target.home, 2) +
      Math.pow(p.draw - target.draw, 2) +
      Math.pow(p.away - target.away, 2)
    );
  };

  let stepSize = 0.25;

  for (let i = 0; i < iterations; i++) {
    const current = errorFor(homeLambda, awayLambda);
    if (current < bestError) {
      bestError = current;
      best = { homeLambda, awayLambda };
    }

    const candidates = [
      [homeLambda + stepSize, awayLambda],
      [homeLambda - stepSize, awayLambda],
      [homeLambda, awayLambda + stepSize],
      [homeLambda, awayLambda - stepSize],
    ].filter(([h, a]) => h > 0.1 && a > 0.1);

    let improved = false;
    for (const [h, a] of candidates) {
      if (errorFor(h, a) < current) {
        homeLambda = h;
        awayLambda = a;
        improved = true;
        break;
      }
    }

    if (!improved) {
      stepSize /= 2;
      if (stepSize < 1e-5) break;
    }
  }

  return { ...best, error: Math.sqrt(bestError) };
}
