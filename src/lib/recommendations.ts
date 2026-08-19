import { fairProbs, expectedValue, recommendedStake } from "@/lib/odds";
import type { RiskSettings } from "@/lib/settings";

export type MarketKind = "1x2" | "totals" | "btts" | "ah";

export type Selection = {
  key: string;
  label: string;
  /** Cuota en la casa de referencia (sharp). Define la probabilidad justa. */
  sharpOdds: number;
  /** Mejor cuota disponible en el resto del mercado. */
  bestOdds: number;
  bestBookmaker: string;
};

export type Market = {
  kind: MarketKind;
  label: string;
  line?: number;
  selections: Selection[];
};

export type Fixture = {
  id: string;
  competition: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  /** Casa usada como ancla de mercado eficiente. */
  sharpBookmaker: string;
  markets: Market[];
};

export type Recommendation = {
  id: string;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  marketLabel: string;
  selectionLabel: string;
  bookmaker: string;
  odds: number;
  fairOdds: number;
  fairProb: number;
  ev: number;
  score: number;
  stake: number;
};

export type FixtureReading = {
  fixture: Fixture;
  /** Margen de la casa sharp en cada mercado, promediado. */
  avgMargin: number;
  /** 0-100: densidad de valor extraíble del partido. */
  matchEdge: number;
  rows: Recommendation[];
};

/**
 * Score 0-100 de una selección.
 *
 * Combina la magnitud del EV con una preferencia por cuotas bajas: a cuota alta,
 * un error pequeño en la probabilidad estimada mueve el EV mucho más, así que el
 * mismo EV nominal es menos fiable. Un +4% a cuota 1.80 vale más que un +4% a
 * cuota 7.00.
 */
function selectionScore(ev: number, odds: number): number {
  if (ev <= 0) return Math.max(0, Math.round(40 + ev * 400));
  const evComponent = Math.min(1, ev / 0.08);
  const reliability = Math.min(1, Math.max(0, (4.5 - odds) / 3));
  return Math.round(100 * (0.75 * evComponent + 0.25 * reliability));
}

/**
 * Match edge 0-100: cuánto valor total se puede extraer del partido.
 * Pondera más las selecciones de cuota baja, por el mismo motivo que el score.
 */
function computeMatchEdge(rows: { ev: number; odds: number }[]): number {
  const positive = rows.filter((r) => r.ev > 0);
  if (!positive.length) return 0;

  const weighted = positive.reduce((acc, r) => acc + r.ev * (1 / r.odds), 0);
  return Math.min(100, Math.round((weighted / 0.05) * 100));
}

/**
 * Lee un partido: quita el margen de la casa sharp para obtener cuotas justas y
 * compara contra la mejor cuota disponible en el mercado.
 *
 * Este es el enfoque "anclado al mercado": no intenta predecir el partido mejor
 * que el mercado eficiente, sino detectar dónde el resto del mercado se desvía
 * de él. Es mucho más robusto que modelar desde cero.
 */
export function readFixture(
  fixture: Fixture,
  settings: RiskSettings
): FixtureReading {
  const rows: Recommendation[] = [];
  const allEv: { ev: number; odds: number }[] = [];
  const margins: number[] = [];

  for (const market of fixture.markets) {
    const sharp = market.selections.map((s) => s.sharpOdds);
    margins.push(sharp.reduce((acc, o) => acc + 1 / o, 0) - 1);

    const probs = fairProbs(sharp, "shin");

    market.selections.forEach((selection, i) => {
      const fairProb = probs[i];
      const ev = expectedValue(fairProb, selection.bestOdds);
      allEv.push({ ev, odds: selection.bestOdds });

      rows.push({
        id: `${fixture.id}:${market.kind}:${market.line ?? ""}:${selection.key}`,
        fixtureId: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        kickoff: fixture.kickoff,
        marketLabel: market.label,
        selectionLabel: selection.label,
        bookmaker: selection.bestBookmaker,
        odds: selection.bestOdds,
        fairOdds: 1 / fairProb,
        fairProb,
        ev,
        score: selectionScore(ev, selection.bestOdds),
        stake: recommendedStake({
          prob: fairProb,
          odds: selection.bestOdds,
          bankroll: settings.bankroll,
          kellyFraction: settings.kellyFraction,
          maxStakePct: settings.maxStakePct,
        }),
      });
    });
  }

  return {
    fixture,
    avgMargin: margins.reduce((a, b) => a + b, 0) / (margins.length || 1),
    matchEdge: computeMatchEdge(allEv),
    rows: rows.sort((a, b) => b.ev - a.ev),
  };
}

export function readFixtures(
  fixtures: Fixture[],
  settings: RiskSettings
): FixtureReading[] {
  return fixtures
    .map((f) => readFixture(f, settings))
    .sort((a, b) => b.matchEdge - a.matchEdge);
}

/** Selecciones que pasan los filtros del usuario, ordenadas por score. */
export function valueBets(
  readings: FixtureReading[],
  settings: RiskSettings
): Recommendation[] {
  return readings
    .flatMap((r) => r.rows)
    .filter(
      (r) =>
        r.ev * 100 >= settings.minEvPct &&
        r.odds >= settings.minOdds &&
        r.odds <= settings.maxOdds
    )
    .sort((a, b) => b.score - a.score);
}
