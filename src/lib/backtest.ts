/**
 * Motor de backtest.
 *
 * Responde a la única pregunta que importa antes de apostar un euro: la
 * estrategia que implementa la app, ¿habría ganado dinero sobre el histórico?
 *
 * Dos reglas de diseño para que el resultado no sea una ilusión:
 *
 * 1. Nada de mirar al futuro. La probabilidad justa solo puede salir de cuotas
 *    disponibles en el mismo momento en que se coloca la apuesta.
 * 2. El stake de un día se calcula con el bankroll al empezar ese día, no
 *    partido a partido. Si no, el orden dentro de la jornada altera el
 *    resultado y el backtest deja de ser reproducible.
 */

import {
  fairProbs,
  expectedValue,
  recommendedStake,
  clvDevigged,
  type MarginMethod,
} from "@/lib/odds";
import {
  brierScore,
  rankedProbabilityScore,
  logLoss,
  calibrationBins,
  yieldPct,
  betsNeededForSignificance,
  type CalibrationBin,
} from "@/lib/metrics";

export type Triplet = [number, number, number];
export type Outcome = 0 | 1 | 2;

export type PriceSource = "pinnacle" | "best" | "avg" | "b365" | "exchange";
export type Timing = "open" | "close";

export type BacktestMatch = {
  season: string;
  date: Date;
  home: string;
  away: string;
  outcome: Outcome;
  open: Partial<Record<PriceSource, Triplet>>;
  close: Partial<Record<PriceSource, Triplet>>;
};

export type Staking =
  | { kind: "flat"; unit: number }
  | { kind: "kelly"; fraction: number; maxStakePct: number };

export type Strategy = {
  name: string;
  /** De dónde sale la probabilidad justa (la casa que se toma como eficiente). */
  fair: { timing: Timing; source: PriceSource; method: MarginMethod };
  /** Dónde se coloca la apuesta. */
  bet: { timing: Timing; source: PriceSource };
  minEv: number;
  minOdds: number;
  maxOdds: number;
  staking: Staking;
  /** Comisión sobre ganancias netas (exchanges). 0.02 = 2%. */
  commission?: number;
  bankroll: number;
};

export type PlacedBet = {
  date: Date;
  season: string;
  label: string;
  selection: Outcome;
  fairProb: number;
  odds: number;
  ev: number;
  stake: number;
  won: boolean;
  profit: number;
  /** CLV contra el cierre de Pinnacle ya limpio de margen. */
  clv?: number;
};

export type BacktestResult = {
  strategy: string;
  bets: number;
  matchesConsidered: number;
  staked: number;
  profit: number;
  roi: number;
  bankrollStart: number;
  bankrollEnd: number;
  maxDrawdown: number;
  avgOdds: number;
  hitRate: number;
  /** EV medio que la estrategia se prometía. */
  expectedEv: number;
  /** CLV medio contra el cierre de Pinnacle. */
  avgClv?: number;
  positiveClvRate?: number;
  betsForSignificance: number;
  calibration: CalibrationBin[];
  bySeason: { season: string; bets: number; staked: number; profit: number; roi: number }[];
  byOddsBucket: {
    from: number;
    to: number;
    bets: number;
    staked: number;
    profit: number;
    roi: number;
  }[];
};

/** Cortes de cuota para el desglose. Delimitan los filtros de la app. */
const ODDS_BUCKETS: [number, number][] = [
  [1.0, 1.5],
  [1.5, 2.0],
  [2.0, 2.5],
  [2.5, 3.5],
  [3.5, 5.0],
  [5.0, 8.0],
  [8.0, Infinity],
];

/** Cuota neta tras comisión del exchange: solo grava la ganancia. */
function netOdds(odds: number, commission = 0): number {
  return commission > 0 ? 1 + (odds - 1) * (1 - commission) : odds;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function runBacktest(
  matches: BacktestMatch[],
  strategy: Strategy
): BacktestResult {
  const bets: PlacedBet[] = [];
  let bankroll = strategy.bankroll;
  let peak = bankroll;
  let maxDrawdown = 0;
  let matchesConsidered = 0;

  const ordered = [...matches].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Agrupar por día: todas las apuestas de una jornada comparten bankroll base.
  const days = new Map<string, BacktestMatch[]>();
  for (const m of ordered) {
    const k = dayKey(m.date);
    const list = days.get(k);
    if (list) list.push(m);
    else days.set(k, [m]);
  }

  for (const [, dayMatches] of days) {
    const bankrollAtDayStart = bankroll;
    let dayProfit = 0;

    for (const match of dayMatches) {
      const fairTriplet = match[strategy.fair.timing][strategy.fair.source];
      const betTriplet = match[strategy.bet.timing][strategy.bet.source];
      if (!fairTriplet || !betTriplet) continue;

      matchesConsidered++;
      const probs = fairProbs(fairTriplet, strategy.fair.method);

      for (let i = 0; i < 3; i++) {
        const selection = i as Outcome;
        const odds = netOdds(betTriplet[i], strategy.commission);
        const fairProb = probs[i];
        const ev = expectedValue(fairProb, odds);

        if (ev < strategy.minEv) continue;
        if (odds < strategy.minOdds || odds > strategy.maxOdds) continue;

        const stake =
          strategy.staking.kind === "flat"
            ? strategy.staking.unit
            : recommendedStake({
                prob: fairProb,
                odds,
                bankroll: bankrollAtDayStart,
                kellyFraction: strategy.staking.fraction,
                maxStakePct: strategy.staking.maxStakePct,
              });

        if (stake <= 0) continue;

        const won = match.outcome === selection;
        const profit = won ? stake * (odds - 1) : -stake;
        dayProfit += profit;

        /**
         * El CLV solo dice algo si la línea de cierre es información que aún no
         * teníamos al apostar. Si la apuesta se coloca ya en el cierre y la
         * probabilidad justa sale de ese mismo cierre, el CLV es idéntico al EV
         * por construcción y no aporta ninguna validación independiente.
         */
        const closingPinnacle = match.close.pinnacle;
        const clvIsMeaningful =
          strategy.bet.timing === "open" && strategy.fair.timing === "open";

        bets.push({
          date: match.date,
          season: match.season,
          label: `${match.home}-${match.away}`,
          selection,
          fairProb,
          odds,
          ev,
          stake,
          won,
          profit,
          clv:
            clvIsMeaningful && closingPinnacle
              ? clvDevigged(odds, closingPinnacle, i, strategy.fair.method)
              : undefined,
        });
      }
    }

    bankroll += dayProfit;
    peak = Math.max(peak, bankroll);
    if (peak > 0) {
      maxDrawdown = Math.max(maxDrawdown, (peak - bankroll) / peak);
    }
  }

  const staked = bets.reduce((a, b) => a + b.stake, 0);
  const profit = bets.reduce((a, b) => a + b.profit, 0);
  const withClv = bets.filter((b) => b.clv !== undefined);
  const avgOdds = bets.length
    ? bets.reduce((a, b) => a + b.odds, 0) / bets.length
    : 0;
  const expectedEv = bets.length
    ? bets.reduce((a, b) => a + b.ev, 0) / bets.length
    : 0;

  const seasons = new Map<string, { bets: number; staked: number; profit: number }>();
  for (const b of bets) {
    const s = seasons.get(b.season) ?? { bets: 0, staked: 0, profit: 0 };
    s.bets++;
    s.staked += b.stake;
    s.profit += b.profit;
    seasons.set(b.season, s);
  }

  return {
    strategy: strategy.name,
    bets: bets.length,
    matchesConsidered,
    staked,
    profit,
    roi: yieldPct(profit, staked),
    bankrollStart: strategy.bankroll,
    bankrollEnd: bankroll,
    maxDrawdown,
    avgOdds,
    hitRate: bets.length ? bets.filter((b) => b.won).length / bets.length : 0,
    expectedEv,
    avgClv: withClv.length
      ? withClv.reduce((a, b) => a + (b.clv ?? 0), 0) / withClv.length
      : undefined,
    positiveClvRate: withClv.length
      ? withClv.filter((b) => (b.clv ?? 0) > 0).length / withClv.length
      : undefined,
    betsForSignificance: betsNeededForSignificance({
      edge: Math.max(expectedEv, 1e-6),
      avgOdds: avgOdds || 2,
    }),
    calibration: calibrationBins(
      bets.map((b) => ({ prob: b.fairProb, hit: b.won })),
      10
    ),
    bySeason: [...seasons.entries()]
      .map(([season, s]) => ({ season, ...s, roi: yieldPct(s.profit, s.staked) }))
      .sort((a, b) => a.season.localeCompare(b.season)),
    byOddsBucket: ODDS_BUCKETS.map(([from, to]) => {
      const inBucket = bets.filter((b) => b.odds >= from && b.odds < to);
      const s = inBucket.reduce((a, b) => a + b.stake, 0);
      const p = inBucket.reduce((a, b) => a + b.profit, 0);
      return { from, to, bets: inBucket.length, staked: s, profit: p, roi: yieldPct(p, s) };
    }),
  };
}

export type ProbabilityQuality = {
  label: string;
  samples: number;
  rps: number;
  brier: number;
  logLoss: number;
  /** Margen medio del mercado evaluado. */
  avgMargin: number;
};

/**
 * Calidad de un conjunto de probabilidades como predictor.
 *
 * Sirve de vara de medir: cualquier modelo propio tiene que batir el RPS del
 * cierre de la casa sharp, y eso es mucho más difícil de lo que parece. Si no lo
 * bate, la estrategia correcta es anclarse al mercado, no predecir por cuenta
 * propia.
 */
export function assessProbabilities(
  matches: BacktestMatch[],
  timing: Timing,
  source: PriceSource,
  method: MarginMethod,
  label: string
): ProbabilityQuality {
  let rps = 0;
  let brier = 0;
  let ll = 0;
  let margin = 0;
  let n = 0;

  for (const m of matches) {
    const triplet = m[timing][source];
    if (!triplet) continue;
    const probs = fairProbs(triplet, method);
    if (probs.some((p) => !(p > 0) || p >= 1)) continue;

    rps += rankedProbabilityScore(probs, m.outcome);
    brier += brierScore(probs, m.outcome);
    ll += logLoss(probs, m.outcome);
    margin += triplet.reduce((a, o) => a + 1 / o, 0) - 1;
    n++;
  }

  return {
    label,
    samples: n,
    rps: n ? rps / n : NaN,
    brier: n ? brier / n : NaN,
    logLoss: n ? ll / n : NaN,
    avgMargin: n ? margin / n : NaN,
  };
}
