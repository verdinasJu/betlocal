/**
 * Ingesta de cuotas.
 *
 * Trae los partidos próximos con las cuotas de todas las casas disponibles y
 * guarda un snapshot de las que hayan cambiado. El histórico de snapshots es lo
 * que después permite calcular el CLV, que según el backtest es el único
 * indicador de ventaja que converge en un plazo razonable.
 *
 * Protegida por `CRON_SECRET`. La invoca un workflow de GitHub Actions (ver
 * `.github/workflows/ingest-odds.yml`) porque el plan gratuito de Vercel solo
 * permite ejecutar cron una vez al día, y aquí hace falta más frecuencia para
 * capturar el movimiento de línea.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchOdds, OddsApiError } from "@/lib/providers/the-odds-api";
import {
  normalizeEvent,
  onlyChanged,
  snapshotKey,
  PROVIDER,
  type MatchInput,
  type SnapshotInput,
  type TeamInput,
} from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const COMPETITION_ID = "ESP.1";
const SPORT_KEY = process.env.ODDS_SPORT_KEY ?? "soccer_spain_la_liga";
const REGIONS = process.env.ODDS_REGIONS ?? "eu,uk";
const MARKETS = process.env.ODDS_MARKETS ?? "h2h";

/** Se llama al proveedor si algún partido arranca dentro de esta ventana. */
const KICKOFF_WINDOW_HOURS = 14;
/** Refresco mínimo diario, para descubrir jornadas nuevas. */
const STALE_AFTER_HOURS = 20;

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/**
 * Decide si merece la pena gastar cuota.
 *
 * El plan gratuito son 500 peticiones al mes y cada llamada cuesta un crédito
 * por mercado y región, así que un cron que dispare a ciegas cada pocas horas se
 * queda sin cuota antes de fin de mes. LaLiga juega cuatro días por semana: el
 * resto del tiempo, volver a preguntar no aporta nada. Se concentra el gasto
 * donde la línea se mueve de verdad, que es en las horas previas al partido.
 */
async function shouldFetch(
  supabase: SupabaseAdmin
): Promise<{ fetch: boolean; reason: string }> {
  const now = Date.now();

  const { data: upcoming, error } = await supabase
    .from("matches")
    .select("kickoff_at")
    .gte("kickoff_at", new Date(now).toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(1);

  // Ante un error de lectura, se prefiere ingerir: perder cuota es menos grave
  // que quedarse sin datos.
  if (error) return { fetch: true, reason: `no se pudo comprobar: ${error.message}` };

  if (!upcoming?.length) {
    return { fetch: true, reason: "no hay partidos futuros en la base" };
  }

  const hoursToKickoff =
    (new Date(upcoming[0].kickoff_at).getTime() - now) / 3_600_000;

  if (hoursToKickoff <= KICKOFF_WINDOW_HOURS) {
    return {
      fetch: true,
      reason: `proximo partido en ${hoursToKickoff.toFixed(1)} h`,
    };
  }

  const { data: last } = await supabase
    .from("odds_snapshots")
    .select("captured_at")
    .order("captured_at", { ascending: false })
    .limit(1);

  const hoursSinceLast = last?.length
    ? (now - new Date(last[0].captured_at).getTime()) / 3_600_000
    : Infinity;

  if (hoursSinceLast >= STALE_AFTER_HOURS) {
    return { fetch: true, reason: "refresco diario de calendario" };
  }

  return {
    fetch: false,
    reason: `proximo partido en ${hoursToKickoff.toFixed(1)} h y datos de hace ${hoursSinceLast.toFixed(1)} h`,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta THE_ODDS_API_KEY" },
      { status: 503 }
    );
  }

  const startedAt = Date.now();
  const supabase = createAdminClient();
  const force = new URL(request.url).searchParams.get("force") === "1";

  const guard = force
    ? { fetch: true, reason: "forzado" }
    : await shouldFetch(supabase);

  if (!guard.fetch) {
    // Marcar cierres sí es gratis, así que se hace incluso al saltarse la API.
    const { data: closingMarked } = await supabase.rpc("mark_closing_odds");
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: guard.reason,
      closingMarked,
    });
  }

  let events;
  let quota;
  try {
    const response = await fetchOdds({
      apiKey,
      sportKey: SPORT_KEY,
      regions: REGIONS,
      markets: MARKETS,
    });
    events = response.events;
    quota = response.quota;
  } catch (error) {
    const status = error instanceof OddsApiError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: status === 401 || status === 422 ? status : 502 }
    );
  }

  const normalized = events
    .map((e) => normalizeEvent(e, COMPETITION_ID))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  if (!normalized.length) {
    return NextResponse.json({
      ok: true,
      message: "El proveedor no devolvió partidos próximos",
      events: 0,
      quota,
    });
  }

  // Los equipos van antes que los partidos: las claves ajenas lo exigen.
  const teams = new Map<string, TeamInput>();
  const matches: MatchInput[] = [];
  const snapshots: SnapshotInput[] = [];

  for (const item of normalized) {
    for (const team of item.teams) teams.set(team.id, team);
    matches.push(item.match);
    snapshots.push(...item.snapshots);
  }

  const teamsError = (
    await supabase.from("teams").upsert(
      [...teams.values()].map((t) => ({
        id: t.id,
        name: t.name,
        competition_id: t.competitionId,
        provider_ids: t.providerIds,
      })),
      { onConflict: "id" }
    )
  ).error;
  if (teamsError) {
    return NextResponse.json(
      { error: `Equipos: ${teamsError.message}` },
      { status: 500 }
    );
  }

  /**
   * En los partidos no se toca `status` ni el resultado: eso lo actualiza la
   * ingesta de resultados. Sobrescribirlo aquí borraría marcadores ya conocidos.
   */
  const matchesError = (
    await supabase.from("matches").upsert(
      matches.map((m) => ({
        id: m.id,
        competition_id: m.competitionId,
        season: m.season,
        kickoff_at: m.kickoffAt,
        home_team_id: m.homeTeamId,
        away_team_id: m.awayTeamId,
        provider_ids: m.providerIds,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    )
  ).error;
  if (matchesError) {
    return NextResponse.json(
      { error: `Partidos: ${matchesError.message}` },
      { status: 500 }
    );
  }

  // Última cuota conocida de cada cotización, para insertar solo los cambios.
  const { data: previous, error: previousError } = await supabase
    .from("latest_odds")
    .select("match_id, bookmaker, market, selection, line, odds")
    .in(
      "match_id",
      matches.map((m) => m.id)
    );

  if (previousError) {
    return NextResponse.json(
      { error: `Cuotas previas: ${previousError.message}` },
      { status: 500 }
    );
  }

  const latestOdds = new Map<string, number>(
    (previous ?? []).map((row) => [
      snapshotKey({
        matchId: row.match_id,
        bookmaker: row.bookmaker,
        market: row.market,
        selection: row.selection,
        line: row.line === null ? null : Number(row.line),
      }),
      Number(row.odds),
    ])
  );

  const changed = onlyChanged(snapshots, latestOdds);

  if (changed.length) {
    const insertError = (
      await supabase.from("odds_snapshots").insert(
        changed.map((s) => ({
          match_id: s.matchId,
          bookmaker: s.bookmaker,
          market: s.market,
          selection: s.selection,
          line: s.line,
          odds: s.odds,
        }))
      )
    ).error;
    if (insertError) {
      return NextResponse.json(
        { error: `Snapshots: ${insertError.message}` },
        { status: 500 }
      );
    }
  }

  // Marca como cierre la última cuota anterior al pitido inicial. No cuesta
  // cuota de API: es información que ya está en la base.
  const { data: closingMarked, error: closingError } = await supabase.rpc(
    "mark_closing_odds"
  );

  return NextResponse.json({
    ok: true,
    reason: guard.reason,
    durationMs: Date.now() - startedAt,
    events: normalized.length,
    teams: teams.size,
    bookmakers: new Set(snapshots.map((s) => s.bookmaker)).size,
    quotesSeen: snapshots.length,
    snapshotsInserted: changed.length,
    closingMarked: closingError ? `error: ${closingError.message}` : closingMarked,
    quota,
  });
}
