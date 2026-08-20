/**
 * Ingesta de cuotas.
 *
 * Recorre las competiciones configuradas, trae los partidos próximos con las
 * cuotas de todas las casas disponibles y guarda un snapshot de las que hayan
 * cambiado. El histórico de snapshots es lo que después permite calcular el CLV,
 * que según el backtest es el único indicador de ventaja que converge en un
 * plazo razonable.
 *
 * Protegida por `CRON_SECRET`. La invoca un workflow de GitHub Actions (ver
 * `.github/workflows/ingest-odds.yml`) porque el plan gratuito de Vercel solo
 * permite ejecutar cron una vez al día, y aquí hace falta más frecuencia para
 * capturar el movimiento de línea.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { fetchOdds, OddsApiError, type Quota } from "@/lib/providers/the-odds-api";
import { COMPETITIONS, type Competition } from "@/lib/competitions";
import {
  normalizeEvent,
  onlyChanged,
  snapshotKey,
  type MatchInput,
  type SnapshotInput,
  type TeamInput,
} from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PreviousOdds = {
  match_id: string;
  bookmaker: string;
  market: string;
  selection: string;
  line: number | null;
  odds: number;
};

/**
 * Una sola región a propósito. El coste en cuota es mercados × regiones, y
 * añadir `uk` la duplicaría para traer sobre todo casas británicas donde un
 * usuario español no puede apostar. `eu` ya incluye las anclas que importan:
 * Pinnacle y el exchange de Betfair.
 */
const REGIONS = process.env.ODDS_REGIONS ?? "eu";
const MARKETS = process.env.ODDS_MARKETS ?? "h2h";

/** Se llama al proveedor si algún partido de la liga arranca en esta ventana. */
const KICKOFF_WINDOW_HOURS = 10;
/** Refresco mínimo por liga, para descubrir jornadas nuevas. */
const STALE_AFTER_HOURS = 40;
/**
 * Créditos que no se gastan nunca. Deja margen para depurar a mano a final de
 * mes sin quedarse a ciegas.
 */
const QUOTA_RESERVE = 40;

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Decide si merece la pena gastar cuota en una liga concreta.
 *
 * El plan gratuito son 500 peticiones al mes y cada llamada cuesta un crédito
 * por mercado y región, así que un cron que consulte seis ligas a ciegas cada
 * dos horas se queda sin cuota en cuatro días. Cada liga juega dos o tres días
 * por semana: el resto del tiempo, volver a preguntar no aporta nada. Se
 * concentra el gasto donde la línea se mueve, que es en las horas previas al
 * partido.
 *
 * `matches.updated_at` sirve de marca de última ingesta porque el upsert lo
 * toca en cada pasada, así que no hace falta una tabla de estado aparte.
 */
async function shouldFetch(
  supabase: SupabaseAdmin,
  competition: Competition
): Promise<{ fetch: boolean; reason: string }> {
  const now = Date.now();

  const { data: upcoming, error } = await supabase
    .from("matches")
    .select("kickoff_at")
    .eq("competition_id", competition.id)
    .gte("kickoff_at", new Date(now).toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(1);

  // Ante un error de lectura, se prefiere ingerir: perder cuota es menos grave
  // que quedarse sin datos.
  if (error) {
    return { fetch: true, reason: `no se pudo comprobar: ${error.message}` };
  }

  if (!upcoming?.length) {
    return { fetch: true, reason: "sin partidos futuros en la base" };
  }

  const hoursToKickoff =
    (new Date(upcoming[0].kickoff_at).getTime() - now) / 3_600_000;

  if (hoursToKickoff <= KICKOFF_WINDOW_HOURS) {
    return { fetch: true, reason: `partido en ${hoursToKickoff.toFixed(1)} h` };
  }

  const { data: last } = await supabase
    .from("matches")
    .select("updated_at")
    .eq("competition_id", competition.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  const hoursSinceLast = last?.length
    ? (now - new Date(last[0].updated_at).getTime()) / 3_600_000
    : Infinity;

  if (hoursSinceLast >= STALE_AFTER_HOURS) {
    return { fetch: true, reason: "refresco de calendario" };
  }

  return {
    fetch: false,
    reason: `partido en ${hoursToKickoff.toFixed(1)} h, datos de hace ${hoursSinceLast.toFixed(1)} h`,
  };
}

type IngestResult = {
  competition: string;
  events: number;
  quotesSeen: number;
  snapshotsInserted: number;
  bookmakers: number;
};

async function ingestCompetition(
  supabase: SupabaseAdmin,
  apiKey: string,
  competition: Competition
): Promise<{ result: IngestResult; quota: Quota }> {
  const { events, quota } = await fetchOdds({
    apiKey,
    sportKey: competition.sportKey,
    regions: REGIONS,
    markets: MARKETS,
  });

  const normalized = events
    .map((e) => normalizeEvent(e, competition.id))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const empty: IngestResult = {
    competition: competition.id,
    events: 0,
    quotesSeen: 0,
    snapshotsInserted: 0,
    bookmakers: 0,
  };

  if (!normalized.length) return { result: empty, quota };

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
  if (teamsError) throw new Error(`Equipos: ${teamsError.message}`);

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
  if (matchesError) throw new Error(`Partidos: ${matchesError.message}`);

  // Última cuota conocida de cada cotización, para insertar solo los cambios.
  // Se pagina: son decenas de filas por partido y PostgREST corta en 1000, así
  // que sin paginar las cotizaciones que quedaran fuera parecerían nuevas y se
  // reinsertarían en cada ejecución.
  const previous = await fetchAllRows<PreviousOdds>((from, to) =>
    supabase
      .from("latest_odds")
      .select("match_id, bookmaker, market, selection, line, odds")
      .in(
        "match_id",
        matches.map((m) => m.id)
      )
      .order("match_id", { ascending: true })
      .order("bookmaker", { ascending: true })
      .order("market", { ascending: true })
      .order("selection", { ascending: true })
      .range(from, to)
  );

  const latestOdds = new Map<string, number>(
    previous.map((row) => [
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
    if (insertError) throw new Error(`Snapshots: ${insertError.message}`);
  }

  return {
    result: {
      competition: competition.id,
      events: normalized.length,
      quotesSeen: snapshots.length,
      snapshotsInserted: changed.length,
      bookmakers: new Set(snapshots.map((s) => s.bookmaker)).size,
    },
    quota,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta THE_ODDS_API_KEY" }, { status: 503 });
  }

  const startedAt = Date.now();
  const supabase = createAdminClient();
  const params = new URL(request.url).searchParams;
  const force = params.get("force") === "1";
  const only = params.get("competition");

  const targets = only
    ? COMPETITIONS.filter((c) => c.id === only)
    : COMPETITIONS;

  if (!targets.length) {
    return NextResponse.json(
      { error: `Competición desconocida: ${only}` },
      { status: 400 }
    );
  }

  const results: IngestResult[] = [];
  const skipped: { competition: string; reason: string }[] = [];
  const failed: { competition: string; error: string }[] = [];
  let quota: Quota | null = null;
  let exhausted = false;

  for (const competition of targets) {
    if (exhausted) {
      skipped.push({ competition: competition.id, reason: "cuota agotada" });
      continue;
    }

    const guard = force
      ? { fetch: true, reason: "forzado" }
      : await shouldFetch(supabase, competition);

    if (!guard.fetch) {
      skipped.push({ competition: competition.id, reason: guard.reason });
      continue;
    }

    try {
      const outcome = await ingestCompetition(supabase, apiKey, competition);
      results.push(outcome.result);
      quota = outcome.quota;
    } catch (error) {
      // Una liga caída no debe impedir ingerir las demás.
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      failed.push({ competition: competition.id, error: message });
      if (error instanceof OddsApiError && error.status === 401) {
        exhausted = true;
      }
      continue;
    }

    if (quota.remaining !== null && quota.remaining <= QUOTA_RESERVE) {
      exhausted = true;
    }
  }

  // Marca como cierre la última cuota anterior al pitido inicial. No cuesta
  // cuota de API: es información que ya está en la base.
  const { data: closingMarked, error: closingError } = await supabase.rpc(
    "mark_closing_odds"
  );

  return NextResponse.json({
    ok: failed.length === 0,
    durationMs: Date.now() - startedAt,
    fetched: results,
    skipped,
    failed,
    totals: {
      events: results.reduce((a, r) => a + r.events, 0),
      quotesSeen: results.reduce((a, r) => a + r.quotesSeen, 0),
      snapshotsInserted: results.reduce((a, r) => a + r.snapshotsInserted, 0),
    },
    closingMarked: closingError ? `error: ${closingError.message}` : closingMarked,
    quota,
  });
}
