import { fairProbs, expectedValue, recommendedStake } from "@/lib/odds";
import { MY_BOOKMAKER, isBettableFromSpain } from "@/lib/bookmakers";
import type { RiskSettings } from "@/lib/settings";

export type MarketKind = "1x2" | "totals" | "btts" | "ah";

export type Quote = { odds: number; bookmaker: string };

export type Selection = {
  key: string;
  label: string;
  /** Cuota en la casa de referencia (sharp). Define la probabilidad justa. */
  sharpOdds: number;
  /** Mejor cuota disponible en el resto del mercado. */
  bestOdds: number;
  /** Clave de la casa con la mejor cuota. */
  bestBookmaker: string;
  /** Todas las cuotas de la selección, para poder filtrar por casa. */
  quotes?: Quote[];
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
  /** Clave de la casa usada como ancla de mercado eficiente. */
  sharpBookmaker: string;
  markets: Market[];
};

export type Recommendation = {
  id: string;
  fixtureId: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  marketLabel: string;
  selectionLabel: string;
  fairProb: number;
  fairOdds: number;
  /**
   * Cuota mínima que tienes que encontrar para que la apuesta cumpla tus
   * criterios. Es el dato central de la app: no depende de en qué casa
   * apuestes, así que sirve aunque el proveedor de datos no cubra la tuya.
   */
  targetOdds: number;
  /** Mejor precio del mercado, esté donde esté. */
  best: Quote;
  /** Mejor precio ejecutable desde España, si existe. */
  spain: Quote | null;
  /** Precio en tu casa, si el proveedor la cubre. */
  mine: Quote | null;
  /**
   * Holgura que el mercado deja sobre la cuota objetivo. Si alguna casa ya
   * paga muy por encima del objetivo, es más probable que la tuya también se
   * acerque; si nadie llega, no merece ni mirarlo.
   */
  slack: number;
};

export type FixtureReading = {
  fixture: Fixture;
  /** Margen de la casa sharp en cada mercado, promediado. */
  avgMargin: number;
  /** 0-100: densidad de valor extraíble del partido. */
  matchEdge: number;
  rows: Recommendation[];
};

export type Assessment = {
  ev: number;
  score: number;
  stake: number;
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
 * Evalúa un precio concreto contra la probabilidad justa.
 *
 * Se llama con la cuota que el usuario ve en su casa, no con la mejor del
 * mercado: lo que importa es el precio que realmente puede tomar.
 */
export function assess(
  fairProb: number,
  odds: number,
  settings: RiskSettings
): Assessment {
  const ev = expectedValue(fairProb, odds);
  return {
    ev,
    score: selectionScore(ev, odds),
    stake: recommendedStake({
      prob: fairProb,
      odds,
      bankroll: settings.bankroll,
      kellyFraction: settings.kellyFraction,
      maxStakePct: settings.maxStakePct,
    }),
  };
}

/**
 * Match edge 0-100: cuánta holgura acumula el partido sobre las cuotas
 * objetivo. Pondera más las selecciones de cuota baja, por el mismo motivo que
 * el score.
 */
function computeMatchEdge(rows: Recommendation[]): number {
  const positive = rows.filter((r) => r.slack > 0);
  if (!positive.length) return 0;

  const weighted = positive.reduce(
    (acc, r) => acc + r.slack * (1 / r.best.odds),
    0
  );
  return Math.min(100, Math.round((weighted / 0.05) * 100));
}

function quotesOf(selection: Selection): Quote[] {
  return (
    selection.quotes ?? [
      { odds: selection.bestOdds, bookmaker: selection.bestBookmaker },
    ]
  );
}

function bestOf(quotes: Quote[]): Quote | null {
  return quotes.reduce<Quote | null>(
    (acc, q) => (!acc || q.odds > acc.odds ? q : acc),
    null
  );
}

/**
 * Lee un partido: quita el margen de la casa sharp para obtener cuotas justas y
 * calcula, para cada selección, la cuota mínima que la haría rentable.
 *
 * Este es el enfoque "anclado al mercado": no intenta predecir el partido mejor
 * que el mercado eficiente, sino usarlo como referencia de precio justo. Es
 * mucho más robusto que modelar desde cero.
 */
export function readFixture(
  fixture: Fixture,
  settings: RiskSettings
): FixtureReading {
  const rows: Recommendation[] = [];
  const margins: number[] = [];

  for (const market of fixture.markets) {
    const sharp = market.selections.map((s) => s.sharpOdds);
    margins.push(sharp.reduce((acc, o) => acc + 1 / o, 0) - 1);

    const probs = fairProbs(sharp, "shin");

    market.selections.forEach((selection, i) => {
      const fairProb = probs[i];
      const quotes = quotesOf(selection);
      const best = bestOf(quotes);
      if (!best) return;

      // El suelo de cuota del backtest se aplica ya aquí: si la cuota justa
      // queda por debajo, apostar solo tiene sentido a partir del suelo.
      const targetOdds = Math.max(
        (1 + settings.minEvPct / 100) / fairProb,
        settings.minOdds
      );

      rows.push({
        id: `${fixture.id}:${market.kind}:${market.line ?? ""}:${selection.key}`,
        fixtureId: fixture.id,
        competition: fixture.competition,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        kickoff: fixture.kickoff,
        marketLabel: market.label,
        selectionLabel: selection.label,
        fairProb,
        fairOdds: 1 / fairProb,
        targetOdds,
        best,
        spain: bestOf(quotes.filter((q) => isBettableFromSpain(q.bookmaker))),
        mine: quotes.find((q) => q.bookmaker === MY_BOOKMAKER) ?? null,
        slack: best.odds / targetOdds - 1,
      });
    });
  }

  return {
    fixture,
    avgMargin: margins.reduce((a, b) => a + b, 0) / (margins.length || 1),
    matchEdge: computeMatchEdge(rows),
    rows: rows.sort((a, b) => b.slack - a.slack),
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

/**
 * Selecciones que merece la pena comprobar en tu casa.
 *
 * No se exige que alguna casa del feed ya bata la cuota objetivo: la casa que
 * tiene que batirla es la tuya, y el proveedor no la cubre. Lo único que se
 * descarta es lo que ni con la cuota objetivo entraría en tu rango de cuota,
 * porque ahí el backtest dice que el ROI se vuelve negativo.
 *
 * El orden es por holgura, que mide cuánto se separan las casas entre sí en esa
 * selección. Donde el mercado discrepa es más probable que una casa concreta
 * esté descolgada; donde todas coinciden, no hay nada que rascar.
 */
export function candidates(
  readings: FixtureReading[],
  settings: RiskSettings
): Recommendation[] {
  return readings
    .flatMap((r) => r.rows)
    .filter((r) => r.targetOdds <= settings.maxOdds)
    .sort((a, b) => b.slack - a.slack);
}
