import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { buildFixtures, type OddsRow } from "@/lib/fixtures";
import type { Fixture } from "@/lib/recommendations";

/**
 * Ventana de partidos que se muestra en el panel.
 *
 * Corta a tres días a propósito. El backtest es tajante: la misma estrategia
 * rinde positivo con cuotas de cierre y negativo con cuotas de apertura, así que
 * enseñar partidos de la semana que viene solo invitaría a apostar temprano, que
 * es justo lo que pierde dinero.
 */
const HORIZON_DAYS = 3;
const MAX_MATCHES = 60;

export type FixtureSource = "db" | "demo";

/**
 * Carga los próximos partidos con sus últimas cuotas.
 *
 * Los equipos y competiciones se resuelven con consultas aparte en lugar de con
 * un join anidado: `matches` tiene dos claves ajenas a `teams` y desambiguarlas
 * obliga a nombrar la restricción en la consulta, lo que acopla el código al
 * nombre que Postgres le puso a un índice.
 */
export async function loadFixturesFromDb(): Promise<Fixture[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }

  const supabase = await createClient();
  const now = new Date();
  const until = new Date(now.getTime() + HORIZON_DAYS * 86_400_000);

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, kickoff_at, competition_id, home_team_id, away_team_id")
    .gte("kickoff_at", now.toISOString())
    .lte("kickoff_at", until.toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(MAX_MATCHES);

  if (error || !matches?.length) return [];

  const matchIds = matches.map((m) => m.id);

  const [{ data: teams }, { data: competitions }, odds] = await Promise.all([
    supabase.from("teams").select("id, name"),
    supabase.from("competitions").select("id, name"),
    // Paginado: son ~117 cotizaciones por partido y PostgREST corta en 1000
    // devolviendo un 200 sin avisar de que faltan filas.
    fetchAllRows<OddsRow>((from, to) =>
      supabase
        .from("latest_odds")
        .select("match_id, bookmaker, market, selection, line, odds")
        .in("match_id", matchIds)
        .order("match_id", { ascending: true })
        .order("bookmaker", { ascending: true })
        .order("market", { ascending: true })
        .order("selection", { ascending: true })
        .range(from, to)
    ).catch(() => [] as OddsRow[]),
  ]);

  const teamName = new Map((teams ?? []).map((t) => [t.id, t.name]));
  const competitionName = new Map(
    (competitions ?? []).map((c) => [c.id, c.name])
  );

  return buildFixtures(
    matches.map((m) => ({
      id: m.id,
      kickoff_at: m.kickoff_at,
      home_team: teamName.get(m.home_team_id) ?? m.home_team_id,
      away_team: teamName.get(m.away_team_id) ?? m.away_team_id,
      competition: competitionName.get(m.competition_id) ?? m.competition_id,
    })),
    odds
  );
}
