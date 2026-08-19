/**
 * Muestra por consola lo que la app está recomendando ahora mismo.
 *
 *   npm run inspect
 *
 * Sirve para auditar de dónde sale el valor: si la mejor cuota está siempre en
 * casas donde no se puede abrir cuenta desde España, la recomendación es
 * inservible aunque el cálculo sea correcto.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { buildFixtures, type OddsRow } from "@/lib/fixtures";
import { readFixtures, valueBets } from "@/lib/recommendations";
import { DEFAULT_SETTINGS } from "@/lib/settings";

function loadEnv(): Record<string, string> {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await build(from, from + 999);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

async function main() {
  const { data: matches } = await supabase
    .from("matches")
    .select("id, kickoff_at, competition_id, home_team_id, away_team_id")
    .gte("kickoff_at", new Date().toISOString())
    .order("kickoff_at", { ascending: true });

  const { data: teams } = await supabase.from("teams").select("id, name");
  const teamName = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const odds = await fetchAll<OddsRow>((from, to) =>
    supabase
      .from("latest_odds")
      .select("match_id, bookmaker, market, selection, line, odds")
      .in(
        "match_id",
        (matches ?? []).map((m) => m.id)
      )
      .order("match_id")
      .order("bookmaker")
      .order("selection")
      .range(from, to)
  );

  const fixtures = buildFixtures(
    (matches ?? []).map((m) => ({
      id: m.id,
      kickoff_at: m.kickoff_at,
      home_team: teamName.get(m.home_team_id) ?? m.home_team_id,
      away_team: teamName.get(m.away_team_id) ?? m.away_team_id,
      competition: "LaLiga",
    })),
    odds
  );

  const settings = { ...DEFAULT_SETTINGS, bankroll: 1000 };
  const readings = readFixtures(fixtures, settings);
  const bets = valueBets(readings, settings);

  console.log(
    `\nPartidos: ${fixtures.length}  ·  cotizaciones: ${odds.length}  ·  ancla: ${fixtures[0]?.sharpBookmaker ?? "n/d"}`
  );
  console.log(
    `Filtros: EV>=${settings.minEvPct}%  ·  cuota ${settings.minOdds}-${settings.maxOdds}\n`
  );

  console.log(`RECOMENDACIONES (${bets.length})\n`);
  for (const bet of bets) {
    console.log(
      `  ${bet.homeTeam} - ${bet.awayTeam}  |  ${bet.selectionLabel}` +
        `\n    cuota ${bet.odds.toFixed(2)} en ${bet.bookmaker}  ·  justa ${bet.fairOdds.toFixed(2)}` +
        `  ·  EV ${(bet.ev * 100).toFixed(2)}%  ·  score ${bet.score}  ·  stake ${bet.stake.toFixed(2)} €`
    );
  }

  console.log(`\n\nDONDE ESTA LA MEJOR CUOTA (todas las selecciones)\n`);
  const bestCount = new Map<string, number>();
  for (const reading of readings) {
    for (const row of reading.rows) {
      bestCount.set(row.bookmaker, (bestCount.get(row.bookmaker) ?? 0) + 1);
    }
  }
  for (const [book, count] of [...bestCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${book}`);
  }

  console.log(`\n\nCASAS QUE DAN LAS RECOMENDACIONES QUE PASAN EL FILTRO\n`);
  const recCount = new Map<string, number>();
  for (const bet of bets) {
    recCount.set(bet.bookmaker, (recCount.get(bet.bookmaker) ?? 0) + 1);
  }
  for (const [book, count] of [...recCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${book}`);
  }
  console.log("");
}

void main();
