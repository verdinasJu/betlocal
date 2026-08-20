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
import { candidates, readFixtures } from "@/lib/recommendations";
import { availability, bookmakerName } from "@/lib/bookmakers";
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

/** Igual que el panel: solo lo que arranca pronto. */
const HORIZON_DAYS = 3;

async function main() {
  const now = new Date();
  const until = new Date(now.getTime() + HORIZON_DAYS * 86_400_000);

  const { data: matches } = await supabase
    .from("matches")
    .select("id, kickoff_at, competition_id, home_team_id, away_team_id")
    .gte("kickoff_at", now.toISOString())
    .lte("kickoff_at", until.toISOString())
    .order("kickoff_at", { ascending: true });

  const { data: teams } = await supabase.from("teams").select("id, name");
  const teamName = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const { data: competitions } = await supabase
    .from("competitions")
    .select("id, name");
  const competitionName = new Map(
    (competitions ?? []).map((c) => [c.id, c.name])
  );

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
      competition: competitionName.get(m.competition_id) ?? m.competition_id,
    })),
    odds
  );

  const settings = { ...DEFAULT_SETTINGS, bankroll: 1000 };
  const readings = readFixtures(fixtures, settings);
  const rows = candidates(readings, settings);

  console.log(
    `\nPartidos: ${fixtures.length}  ·  cotizaciones: ${odds.length}  ·  ancla: ${bookmakerName(fixtures[0]?.sharpBookmaker ?? "")}`
  );
  console.log(
    `Filtros: EV>=${settings.minEvPct}%  ·  cuota ${settings.minOdds}-${settings.maxOdds}\n`
  );

  console.log(`CANDIDATAS (${rows.length}), las 15 con más holgura\n`);
  for (const row of rows.slice(0, 15)) {
    const spain = row.spain
      ? `${row.spain.odds.toFixed(2)} en ${bookmakerName(row.spain.bookmaker)}`
      : "ninguna";
    console.log(
      `  [${row.competition}] ${row.homeTeam} - ${row.awayTeam}  |  ${row.selectionLabel}` +
        `\n    justa ${row.fairOdds.toFixed(2)}  ·  objetivo ${row.targetOdds.toFixed(2)}` +
        `  ·  mercado ${row.best.odds.toFixed(2)} en ${bookmakerName(row.best.bookmaker)}` +
        `  ·  holgura ${(row.slack * 100).toFixed(1)}%` +
        `\n    mejor precio ejecutable en España: ${spain}`
    );
  }

  console.log(`\n\nDONDE ESTA LA MEJOR CUOTA (todas las selecciones)\n`);
  const bestCount = new Map<string, number>();
  for (const reading of readings) {
    for (const row of reading.rows) {
      const key = row.best.bookmaker;
      bestCount.set(key, (bestCount.get(key) ?? 0) + 1);
    }
  }
  const label: Record<string, string> = {
    es: "ejecutable desde España",
    brand: "marca con licencia ES, precio de otro país",
    none: "sin licencia en España",
  };
  for (const [book, count] of [...bestCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(
      `  ${String(count).padStart(3)}  ${bookmakerName(book).padEnd(22)} ${label[availability(book)]}`
    );
  }

  const reachable = rows.filter((r) => r.spain).length;
  console.log(
    `\n\nDe las ${rows.length} candidatas, ${reachable} tienen algún precio ejecutable desde España.`
  );
  console.log("");
}

void main();
