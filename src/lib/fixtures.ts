/**
 * Construye los partidos que consume la interfaz a partir de la base de datos.
 *
 * La forma resultante es la misma que la de los datos de demo, así que la
 * interfaz no distingue el origen. Aquí está la decisión importante: qué casa
 * hace de ancla de mercado eficiente y cuál ofrece el mejor precio.
 */

import { SHARP_ANCHORS } from "@/lib/ingest";
import type {
  Fixture,
  Market,
  MarketKind,
  Quote,
  Selection,
} from "@/lib/recommendations";

export type OddsRow = {
  match_id: string;
  bookmaker: string;
  market: string;
  selection: string;
  line: number | null;
  odds: number;
};

export type MatchRow = {
  id: string;
  kickoff_at: string;
  home_team: string;
  away_team: string;
  competition: string;
};

/** Selecciones que debe tener un mercado para poder quitarle el margen. */
const REQUIRED: Record<MarketKind, string[]> = {
  "1x2": ["home", "draw", "away"],
  totals: ["over", "under"],
  btts: ["yes", "no"],
  ah: ["home", "away"],
};

function marketLabel(kind: MarketKind, line: number | null): string {
  switch (kind) {
    case "1x2":
      return "1X2";
    case "totals":
      return `Más/Menos ${line ?? ""}`.trim();
    case "btts":
      return "Ambos marcan";
    case "ah":
      return `Hándicap asiático ${line !== null && line > 0 ? "+" : ""}${line ?? ""}`.trim();
  }
}

function selectionLabel(
  kind: MarketKind,
  selection: string,
  line: number | null,
  home: string,
  away: string
): string {
  if (kind === "1x2") {
    if (selection === "home") return home;
    if (selection === "away") return away;
    return "Empate";
  }
  if (kind === "ah") {
    const shown = line ?? 0;
    if (selection === "home") return `${home} ${shown > 0 ? "+" : ""}${shown}`;
    return `${away} ${-shown > 0 ? "+" : ""}${-shown}`;
  }
  if (kind === "totals") {
    return selection === "over" ? `Más de ${line}` : `Menos de ${line}`;
  }
  return selection === "yes" ? "Sí" : "No";
}

function isMarketKind(value: string): value is MarketKind {
  return value === "1x2" || value === "totals" || value === "btts" || value === "ah";
}

/**
 * Elige la casa que hace de ancla.
 *
 * Tiene que ser una sola casa para todo el mercado: quitar el margen exige un
 * conjunto coherente de cuotas. Mezclar el 1 de una casa con la X de otra daría
 * un overround inventado y, con él, valor inventado.
 */
function pickAnchor(
  byBookmaker: Map<string, Map<string, number>>,
  required: string[]
): string | null {
  for (const anchor of SHARP_ANCHORS) {
    const quotes = byBookmaker.get(anchor);
    if (quotes && required.every((s) => quotes.has(s))) return anchor;
  }
  return null;
}

export function buildFixtures(
  matches: MatchRow[],
  odds: OddsRow[]
): Fixture[] {
  const byMatch = new Map<string, OddsRow[]>();
  for (const row of odds) {
    const list = byMatch.get(row.match_id);
    if (list) list.push(row);
    else byMatch.set(row.match_id, [row]);
  }

  const fixtures: Fixture[] = [];

  for (const match of matches) {
    const rows = byMatch.get(match.id) ?? [];
    if (!rows.length) continue;

    // market + línea identifican un mercado concreto (Más/Menos 2.5 y 3.5 son
    // mercados distintos, no selecciones del mismo).
    const groups = new Map<string, OddsRow[]>();
    for (const row of rows) {
      if (!isMarketKind(row.market)) continue;
      const key = `${row.market}|${row.line ?? ""}`;
      const list = groups.get(key);
      if (list) list.push(row);
      else groups.set(key, [row]);
    }

    const markets: Market[] = [];
    let anchorUsed: string | null = null;

    for (const [key, groupRows] of groups) {
      const [rawKind, rawLine] = key.split("|");
      if (!isMarketKind(rawKind)) continue;
      const kind = rawKind;
      const line = rawLine === "" ? null : Number(rawLine);
      const required = REQUIRED[kind];

      const byBookmaker = new Map<string, Map<string, number>>();
      for (const row of groupRows) {
        const quotes = byBookmaker.get(row.bookmaker) ?? new Map();
        quotes.set(row.selection, Number(row.odds));
        byBookmaker.set(row.bookmaker, quotes);
      }

      const anchor = pickAnchor(byBookmaker, required);
      if (!anchor) continue;
      anchorUsed = anchor;

      const anchorQuotes = byBookmaker.get(anchor)!;
      const selections: Selection[] = [];

      for (const selection of required) {
        const quotes: Quote[] = [];
        for (const [book, bookQuotes] of byBookmaker) {
          const value = bookQuotes.get(selection);
          if (value !== undefined) quotes.push({ odds: value, bookmaker: book });
        }
        if (!quotes.length) continue;

        const best = quotes.reduce((a, b) => (b.odds > a.odds ? b : a));

        selections.push({
          key: selection,
          label: selectionLabel(
            kind,
            selection,
            line,
            match.home_team,
            match.away_team
          ),
          sharpOdds: anchorQuotes.get(selection)!,
          bestOdds: best.odds,
          bestBookmaker: best.bookmaker,
          quotes,
        });
      }

      markets.push({
        kind,
        label: marketLabel(kind, line),
        ...(line === null ? {} : { line }),
        selections,
      });
    }

    if (!markets.length) continue;

    fixtures.push({
      id: match.id,
      competition: match.competition,
      kickoff: match.kickoff_at,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      sharpBookmaker: anchorUsed ?? "",
      markets,
    });
  }

  return fixtures.sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
}
