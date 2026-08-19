/**
 * Informe de backtest sobre el histórico de LaLiga.
 *
 *   npm run backtest
 *   npm run backtest -- --from 1920 --stake kelly
 *
 * Reutiliza a propósito las mismas funciones que la app (`src/lib/odds.ts`,
 * `src/lib/backtest.ts`): si el backtest sale positivo pero la app usara otro
 * código, el resultado no valdría para nada.
 */

import { loadMatches, type MatchRow } from "./parse";
import {
  runBacktest,
  assessProbabilities,
  type BacktestMatch,
  type Strategy,
  type BacktestResult,
  type PriceSource,
} from "@/lib/backtest";
import type { MarginMethod } from "@/lib/odds";

const args = process.argv.slice(2);
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.split("=")[1] : fallback;
}

const FROM = arg("from", "1213")!;
const BANKROLL = Number(arg("bankroll", "1000"));
const FLAT_UNIT = Number(arg("unit", "10"));

function pct(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "n/d";
  return `${(x * 100).toFixed(digits)}%`;
}

function money(x: number): string {
  return `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(0)} €`;
}

function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length))
  );
  const line = (cells: string[]) =>
    cells.map((c, i) => (c ?? "").padEnd(widths[i])).join("  ");
  return [
    line(headers),
    widths.map((w) => "─".repeat(w)).join("  "),
    ...rows.map(line),
  ].join("\n");
}

function toBacktestMatch(m: MatchRow): BacktestMatch {
  return {
    season: m.season,
    date: m.date,
    home: m.home,
    away: m.away,
    outcome: m.outcome,
    open: m.open,
    close: m.close,
  };
}

const all = loadMatches("SP1");
const matches = all
  .filter((m) => m.season >= FROM)
  .map(toBacktestMatch);

console.log(`\n${"=".repeat(78)}`);
console.log("BACKTEST — LaLiga (Football-Data.co.uk)");
console.log("=".repeat(78));
console.log(
  `Partidos: ${matches.length}  ·  temporadas ${FROM}–${matches.at(-1)?.season}  ·  bankroll inicial ${BANKROLL} €`
);

// ---------------------------------------------------------------------------
// 1. Cobertura de datos
// ---------------------------------------------------------------------------
console.log(`\n\n1. COBERTURA DE CUOTAS POR TEMPORADA\n`);

const sources: PriceSource[] = ["pinnacle", "best", "avg", "b365", "exchange"];
const seasons = [...new Set(matches.map((m) => m.season))].sort();

console.log(
  table(
    ["Temp.", "N", ...sources.map((s) => `${s} A/C`)],
    seasons.map((season) => {
      const rows = matches.filter((m) => m.season === season);
      return [
        season,
        String(rows.length),
        ...sources.map((s) => {
          const o = rows.filter((m) => m.open[s]).length;
          const c = rows.filter((m) => m.close[s]).length;
          return `${Math.round((100 * o) / rows.length)}/${Math.round((100 * c) / rows.length)}`;
        }),
      ];
    })
  )
);
console.log(
  `\nA = apertura, C = cierre, en % de partidos con la tripleta 1X2 completa.`
);

// ---------------------------------------------------------------------------
// 2. ¿Qué método de devig lee mejor el mercado?
// ---------------------------------------------------------------------------
console.log(`\n\n2. CALIDAD PREDICTIVA SEGUN METODO DE DEVIG\n`);
console.log(
  `Sobre el cierre de Pinnacle. Menor RPS = mejor. Es la vara de medir:`
);
console.log(`cualquier modelo propio tiene que batir estos numeros.\n`);

const methods: MarginMethod[] = ["multiplicative", "additive", "power", "shin"];
console.log(
  table(
    ["Metodo", "N", "RPS", "Brier", "LogLoss"],
    methods.map((method) => {
      const q = assessProbabilities(matches, "close", "pinnacle", method, method);
      return [
        method,
        String(q.samples),
        q.rps.toFixed(5),
        q.brier.toFixed(5),
        q.logLoss.toFixed(5),
      ];
    })
  )
);

console.log(`\n\n3. CALIDAD PREDICTIVA POR FUENTE Y MOMENTO (devig Shin)\n`);
const qualityRows: string[][] = [];
for (const timing of ["open", "close"] as const) {
  for (const source of sources) {
    const q = assessProbabilities(matches, timing, source, "shin", source);
    if (!q.samples) continue;
    qualityRows.push([
      timing === "open" ? "apertura" : "cierre",
      source,
      String(q.samples),
      pct(q.avgMargin),
      q.rps.toFixed(5),
      q.logLoss.toFixed(5),
    ]);
  }
}
console.log(
  table(["Momento", "Fuente", "N", "Margen", "RPS", "LogLoss"], qualityRows)
);

// ---------------------------------------------------------------------------
// 4. Estrategias
// ---------------------------------------------------------------------------
const MIN_EVS = [0.0, 0.01, 0.02, 0.03, 0.05];

type StrategySpec = {
  label: string;
  fair: Strategy["fair"];
  bet: Strategy["bet"];
  commission?: number;
};

const specs: StrategySpec[] = [
  {
    label: "Cierre: Pinnacle -> mejor cuota",
    fair: { timing: "close", source: "pinnacle", method: "shin" },
    bet: { timing: "close", source: "best" },
  },
  {
    label: "Cierre: Pinnacle -> Bet365",
    fair: { timing: "close", source: "pinnacle", method: "shin" },
    bet: { timing: "close", source: "b365" },
  },
  {
    label: "Apertura: Pinnacle -> mejor cuota",
    fair: { timing: "open", source: "pinnacle", method: "shin" },
    bet: { timing: "open", source: "best" },
  },
  {
    label: "Apertura: Pinnacle -> Bet365",
    fair: { timing: "open", source: "pinnacle", method: "shin" },
    bet: { timing: "open", source: "b365" },
  },
  {
    label: "Cierre: media mercado -> mejor cuota",
    fair: { timing: "close", source: "avg", method: "shin" },
    bet: { timing: "close", source: "best" },
  },
  {
    label: "CONTROL: Pinnacle -> media mercado",
    fair: { timing: "close", source: "pinnacle", method: "shin" },
    bet: { timing: "close", source: "avg" },
  },
  {
    label: "CONTROL: Pinnacle -> Pinnacle",
    fair: { timing: "close", source: "pinnacle", method: "shin" },
    bet: { timing: "close", source: "pinnacle" },
  },
];

console.log(`\n\n4. ESTRATEGIAS CON STAKE FIJO (${FLAT_UNIT} € por apuesta)\n`);
console.log(
  `El stake fijo aisla la ventaja real: con Kelly, el resultado se mezcla`
);
console.log(`con el efecto del interes compuesto y del orden de las apuestas.\n`);

const results: { spec: StrategySpec; minEv: number; res: BacktestResult }[] = [];

for (const spec of specs) {
  for (const minEv of MIN_EVS) {
    const strategy: Strategy = {
      name: `${spec.label} · EV>=${pct(minEv, 0)}`,
      fair: spec.fair,
      bet: spec.bet,
      minEv,
      minOdds: 1.2,
      maxOdds: 10,
      staking: { kind: "flat", unit: FLAT_UNIT },
      commission: spec.commission,
      bankroll: BANKROLL,
    };
    results.push({ spec, minEv, res: runBacktest(matches, strategy) });
  }
}

for (const spec of specs) {
  console.log(`\n${spec.label}`);
  const rows = results
    .filter((r) => r.spec === spec)
    .map(({ minEv, res }) => [
      pct(minEv, 0),
      String(res.bets),
      res.avgOdds.toFixed(2),
      pct(res.expectedEv),
      money(res.profit),
      pct(res.roi),
      pct(res.hitRate, 1),
      res.avgClv !== undefined ? pct(res.avgClv) : "n/d",
      res.positiveClvRate !== undefined ? pct(res.positiveClvRate, 1) : "n/d",
    ]);
  console.log(
    table(
      ["EV min", "Apuestas", "Cuota", "EV prom", "Beneficio", "ROI", "Acierto", "CLV", "CLV>0"],
      rows
    )
  );
}

// ---------------------------------------------------------------------------
// 5. Detalle de la estrategia realista
// ---------------------------------------------------------------------------
const detailed = results.find(
  (r) => r.spec.label === "Cierre: Pinnacle -> mejor cuota" && r.minEv === 0.01
);

if (detailed) {
  console.log(`\n\n5. DETALLE: ${detailed.res.strategy}\n`);
  console.log(`Es la variante con muestra suficiente para decir algo.\n`);
  const r = detailed.res;
  console.log(
    `Apuestas ${r.bets}  ·  arriesgado ${r.staked.toFixed(0)} €  ·  beneficio ${money(r.profit)}  ·  ROI ${pct(r.roi)}`
  );
  console.log(
    `Apuestas necesarias para significancia estadistica: ${r.betsForSignificance.toLocaleString("es-ES")}`
  );

  console.log(`\nPor temporada:\n`);
  console.log(
    table(
      ["Temp.", "Apuestas", "Arriesgado", "Beneficio", "ROI"],
      r.bySeason.map((s) => [
        s.season,
        String(s.bets),
        `${s.staked.toFixed(0)} €`,
        money(s.profit),
        pct(s.roi),
      ])
    )
  );

  console.log(`\nCalibracion (probabilidad justa estimada vs frecuencia real):\n`);
  console.log(
    table(
      ["Rango", "N", "Predicho", "Observado", "Sesgo"],
      r.calibration
        .filter((b) => b.count > 0)
        .map((b) => [
          `${pct(b.from, 0)}-${pct(b.to, 0)}`,
          String(b.count),
          pct(b.predicted, 1),
          pct(b.observed, 1),
          pct(b.observed - b.predicted, 1),
        ])
    )
  );
}

// ---------------------------------------------------------------------------
// 6. Kelly sobre la mejor estrategia con datos suficientes
// ---------------------------------------------------------------------------
console.log(`\n\n6. EFECTO DEL STAKING (Kelly fraccional vs stake fijo)\n`);

const kellyRows: string[][] = [];
for (const spec of specs.filter((s) => !s.label.startsWith("CONTROL"))) {
  const flat = results.find((r) => r.spec === spec && r.minEv === 0.02)!.res;
  const kelly = runBacktest(matches, {
    name: spec.label,
    fair: spec.fair,
    bet: spec.bet,
    minEv: 0.02,
    minOdds: 1.2,
    maxOdds: 10,
    staking: { kind: "kelly", fraction: 0.25, maxStakePct: 2 },
    commission: spec.commission,
    bankroll: BANKROLL,
  });
  kellyRows.push([
    spec.label,
    String(flat.bets),
    pct(flat.roi),
    `${flat.bankrollEnd.toFixed(0)} €`,
    `${kelly.bankrollEnd.toFixed(0)} €`,
    pct(kelly.maxDrawdown, 1),
  ]);
}
console.log(
  table(
    ["Estrategia", "Apuestas", "ROI", "Banco fijo", "Banco Kelly", "Drawdown Kelly"],
    kellyRows
  )
);

// ---------------------------------------------------------------------------
// 7. ¿En qué rango de cuota está el dinero?
// ---------------------------------------------------------------------------
console.log(`\n\n7. ROI POR RANGO DE CUOTA\n`);
console.log(`Define los filtros minOdds/maxOdds que deberia traer la app.\n`);

for (const label of [
  "Cierre: Pinnacle -> mejor cuota",
  "Apertura: Pinnacle -> mejor cuota",
]) {
  const r = results.find((x) => x.spec.label === label && x.minEv === 0.01)!.res;
  console.log(`\n${label} · EV>=1%`);
  console.log(
    table(
      ["Cuota", "Apuestas", "Arriesgado", "Beneficio", "ROI"],
      r.byOddsBucket
        .filter((b) => b.bets > 0)
        .map((b) => [
          `${b.from.toFixed(1)}-${b.to === Infinity ? "∞" : b.to.toFixed(1)}`,
          String(b.bets),
          `${b.staked.toFixed(0)} €`,
          money(b.profit),
          pct(b.roi),
        ])
    )
  );
}

// ---------------------------------------------------------------------------
// 8. Rejilla EV x tope de cuota
// ---------------------------------------------------------------------------
console.log(`\n\n8. REJILLA: UMBRAL DE EV x TOPE DE CUOTA\n`);
console.log(
  `Sobre "Cierre: Pinnacle -> mejor cuota". Cada celda es ROI (n apuestas).`
);
console.log(
  `Si el ROI mejora al subir el EV solo cuando la cuota esta acotada,`
);
console.log(`el problema del EV alto no es el EV: son las cuotas altas.\n`);

const MAX_ODDS_GRID = [2.5, 3.5, 5.0, 10.0];
const gridSpec = specs.find((s) => s.label === "Cierre: Pinnacle -> mejor cuota")!;

console.log(
  table(
    ["EV min", ...MAX_ODDS_GRID.map((m) => `cuota<=${m.toFixed(1)}`)],
    MIN_EVS.map((minEv) => [
      pct(minEv, 0),
      ...MAX_ODDS_GRID.map((maxOdds) => {
        const res = runBacktest(matches, {
          name: "grid",
          fair: gridSpec.fair,
          bet: gridSpec.bet,
          minEv,
          minOdds: 1.2,
          maxOdds,
          staking: { kind: "flat", unit: FLAT_UNIT },
          bankroll: BANKROLL,
        });
        return `${pct(res.roi, 1)} (${res.bets})`;
      }),
    ])
  )
);

// ---------------------------------------------------------------------------
// 9. Configuración candidata y validación fuera de muestra
// ---------------------------------------------------------------------------
const CANDIDATE = {
  fair: { timing: "close", source: "pinnacle", method: "shin" },
  bet: { timing: "close", source: "best" },
  minEv: 0.01,
  minOdds: 1.2,
  maxOdds: 3.5,
} as const;

function candidateFor(rows: BacktestMatch[], name: string) {
  return runBacktest(rows, {
    name,
    fair: CANDIDATE.fair,
    bet: CANDIDATE.bet,
    minEv: CANDIDATE.minEv,
    minOdds: CANDIDATE.minOdds,
    maxOdds: CANDIDATE.maxOdds,
    staking: { kind: "flat", unit: FLAT_UNIT },
    bankroll: BANKROLL,
  });
}

console.log(`\n\n9. CONFIGURACION CANDIDATA\n`);
console.log(
  `Ancla Pinnacle al cierre, se apuesta a la mejor cuota del mercado,`
);
console.log(
  `EV>=${pct(CANDIDATE.minEv, 0)} y cuota entre ${CANDIDATE.minOdds} y ${CANDIDATE.maxOdds}.\n`
);

const cand = candidateFor(matches, "candidata · LaLiga");
console.log(
  `Apuestas ${cand.bets}  ·  ROI ${pct(cand.roi)}  ·  beneficio ${money(cand.profit)}`
);
console.log(
  `Necesarias para significancia al 95%: ${cand.betsForSignificance.toLocaleString("es-ES")}  ->  ${
    cand.bets >= cand.betsForSignificance ? "MUESTRA SUFICIENTE" : "MUESTRA INSUFICIENTE"
  }`
);
console.log(`\nEstabilidad por temporada:\n`);
console.log(
  table(
    ["Temp.", "Apuestas", "Beneficio", "ROI"],
    cand.bySeason.map((s) => [
      s.season,
      String(s.bets),
      money(s.profit),
      pct(s.roi),
    ])
  )
);
const positiveSeasons = cand.bySeason.filter((s) => s.profit > 0).length;
console.log(
  `\nTemporadas en positivo: ${positiveSeasons} de ${cand.bySeason.length}`
);

console.log(`\n\n10. VALIDACION EN LIGAS NO USADAS PARA ELEGIR LA CONFIGURACION\n`);
console.log(
  `El tope de cuota se eligio mirando LaLiga, asi que sobre LaLiga esta`
);
console.log(
  `sobreajustado por definicion. Si la ventaja es real, debe repetirse aqui.\n`
);

const OTHER_LEAGUES: [string, string][] = [
  ["E0", "Premier League"],
  ["D1", "Bundesliga"],
  ["I1", "Serie A"],
  ["F1", "Ligue 1"],
  ["SP2", "LaLiga 2"],
];

const validationRows: string[][] = [];
let pooledBets = 0;
let pooledStaked = 0;
let pooledProfit = 0;

for (const [division, name] of OTHER_LEAGUES) {
  let rows: BacktestMatch[];
  try {
    rows = loadMatches(division)
      .filter((m) => m.season >= FROM)
      .map(toBacktestMatch);
  } catch {
    continue;
  }
  const res = candidateFor(rows, name);
  const seasonsUp = res.bySeason.filter((s) => s.profit > 0).length;
  validationRows.push([
    name,
    String(rows.length),
    String(res.bets),
    money(res.profit),
    pct(res.roi),
    `${seasonsUp}/${res.bySeason.length}`,
  ]);
  pooledBets += res.bets;
  pooledStaked += res.staked;
  pooledProfit += res.profit;
}

validationRows.push([
  "TOTAL fuera de muestra",
  "",
  String(pooledBets),
  money(pooledProfit),
  pct(pooledStaked > 0 ? pooledProfit / pooledStaked : 0),
  "",
]);

console.log(
  table(
    ["Liga", "Partidos", "Apuestas", "Beneficio", "ROI", "Temp. +"],
    validationRows
  )
);

// ---------------------------------------------------------------------------
// 11. ¿Sirve Betfair Exchange como ancla en lugar de Pinnacle?
// ---------------------------------------------------------------------------
console.log(`\n\n11. ANCLA ALTERNATIVA: BETFAIR EXCHANGE vs PINNACLE\n`);
console.log(
  `Pinnacle deja de publicar datos fiables a mitad de 2025 (se ve en la`
);
console.log(
  `cobertura: 50% en 25/26 y 0% en 26/27), asi que hay que saber si el`
);
console.log(`exchange puede sustituirlo. Comparacion sobre los partidos`);
console.log(`donde existen las dos, agrupando todas las ligas.\n`);

const pooled: BacktestMatch[] = [];
for (const [division] of [["SP1"], ...OTHER_LEAGUES] as [string, string?][]) {
  try {
    pooled.push(...loadMatches(division).map(toBacktestMatch));
  } catch {
    /* liga no descargada */
  }
}

const bothAnchors = pooled.filter((m) => m.close.pinnacle && m.close.exchange);
console.log(`Partidos con ambas cuotas de cierre: ${bothAnchors.length}\n`);

console.log(
  table(
    ["Ancla", "N", "Margen", "RPS", "LogLoss"],
    (["pinnacle", "exchange"] as const).map((source) => {
      const q = assessProbabilities(bothAnchors, "close", source, "shin", source);
      return [
        source,
        String(q.samples),
        pct(q.avgMargin),
        q.rps.toFixed(5),
        q.logLoss.toFixed(5),
      ];
    })
  )
);

console.log(`\nMisma estrategia candidata cambiando solo el ancla:\n`);
console.log(
  table(
    ["Ancla", "Apuestas", "Beneficio", "ROI"],
    (["pinnacle", "exchange"] as const).map((source) => {
      const res = runBacktest(bothAnchors, {
        name: source,
        fair: { timing: "close", source, method: "shin" },
        bet: CANDIDATE.bet,
        minEv: CANDIDATE.minEv,
        minOdds: CANDIDATE.minOdds,
        maxOdds: CANDIDATE.maxOdds,
        staking: { kind: "flat", unit: FLAT_UNIT },
        bankroll: BANKROLL,
      });
      return [source, String(res.bets), money(res.profit), pct(res.roi)];
    })
  )
);

console.log("");
