/**
 * Normalización de la respuesta del proveedor a las tablas del dominio.
 *
 * El problema real de una ingesta que corre cada pocas horas no es traer los
 * datos: es no duplicarlos. Todo aquí gira alrededor de generar identidades
 * estables (equipo, partido) que no dependan del proveedor, y de insertar un
 * snapshot de cuota solo cuando la cuota ha cambiado de verdad.
 */

import type { ProviderEvent } from "@/lib/providers/the-odds-api";

export type MarketKey = "1x2" | "totals" | "ah" | "btts";

export type SnapshotInput = {
  matchId: string;
  bookmaker: string;
  market: MarketKey;
  selection: string;
  line: number | null;
  odds: number;
};

export type TeamInput = {
  id: string;
  name: string;
  competitionId: string;
  providerIds: Record<string, string>;
};

export type MatchInput = {
  id: string;
  competitionId: string;
  season: string;
  kickoffAt: string;
  homeTeamId: string;
  awayTeamId: string;
  providerIds: Record<string, string>;
};

export type NormalizedEvent = {
  match: MatchInput;
  teams: TeamInput[];
  snapshots: SnapshotInput[];
};

export const PROVIDER = "the_odds_api";

/**
 * Casas que sirven de ancla de mercado eficiente, en orden de preferencia.
 *
 * El exchange va primero por lo que muestra el backtest: predice igual que
 * Pinnacle con un margen cinco veces menor, y Pinnacle dejó de publicar datos
 * fiables a mitad de 2025.
 */
export const SHARP_ANCHORS = [
  "betfair_ex_eu",
  "betfair_ex_uk",
  "pinnacle",
  "smarkets",
  "matchbook",
] as const;

/**
 * Identificador estable de equipo. Se normalizan acentos porque el mismo club
 * llega escrito de formas distintas según el proveedor ("Atlético Madrid",
 * "Atletico Madrid") y no queremos dos filas para el mismo equipo.
 */
export function teamSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Temporada a la que pertenece una fecha. Las ligas europeas van de agosto a
 * mayo, así que de enero a julio seguimos en la temporada que empezó el año
 * anterior.
 */
export function seasonFor(kickoff: Date): string {
  const year = kickoff.getUTCFullYear();
  const start = kickoff.getUTCMonth() >= 6 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/**
 * Identidad del partido independiente del proveedor: dentro de una temporada,
 * un enfrentamiento en un estadio concreto ocurre una sola vez.
 */
export function matchId(
  competitionId: string,
  season: string,
  homeId: string,
  awayId: string
): string {
  return `${competitionId}:${season}:${homeId}-vs-${awayId}`;
}

function marketKeyFor(providerKey: string): MarketKey | null {
  switch (providerKey) {
    case "h2h":
      return "1x2";
    case "totals":
      return "totals";
    case "spreads":
      return "ah";
    default:
      return null;
  }
}

/**
 * Traduce el nombre de la selección del proveedor a nuestras claves.
 * El proveedor usa el nombre del equipo, que cambia entre casas; hay que
 * resolverlo contra los equipos del propio evento.
 */
function selectionFor(
  market: MarketKey,
  outcomeName: string,
  homeTeam: string,
  awayTeam: string
): string | null {
  const name = outcomeName.trim().toLowerCase();

  if (market === "1x2" || market === "ah") {
    if (name === homeTeam.trim().toLowerCase()) return "home";
    if (name === awayTeam.trim().toLowerCase()) return "away";
    if (name === "draw") return "draw";
    return null;
  }

  if (market === "totals") {
    if (name === "over") return "over";
    if (name === "under") return "under";
    return null;
  }

  return null;
}

export function normalizeEvent(
  event: ProviderEvent,
  competitionId: string
): NormalizedEvent | null {
  const kickoff = new Date(event.commence_time);
  if (Number.isNaN(kickoff.getTime())) return null;
  if (!event.home_team || !event.away_team) return null;

  const homeId = teamSlug(event.home_team);
  const awayId = teamSlug(event.away_team);
  if (!homeId || !awayId) return null;

  const season = seasonFor(kickoff);
  const id = matchId(competitionId, season, homeId, awayId);

  const snapshots: SnapshotInput[] = [];

  for (const book of event.bookmakers ?? []) {
    for (const market of book.markets ?? []) {
      const marketKey = marketKeyFor(market.key);
      if (!marketKey) continue;

      for (const outcome of market.outcomes ?? []) {
        const selection = selectionFor(
          marketKey,
          outcome.name,
          event.home_team,
          event.away_team
        );
        // Cuota <= 1 no es una cuota: es un dato roto.
        if (!selection || !(outcome.price > 1)) continue;

        snapshots.push({
          matchId: id,
          bookmaker: book.key,
          market: marketKey,
          selection,
          line: outcome.point ?? null,
          odds: outcome.price,
        });
      }
    }
  }

  return {
    match: {
      id,
      competitionId,
      season,
      kickoffAt: kickoff.toISOString(),
      homeTeamId: homeId,
      awayTeamId: awayId,
      providerIds: { [PROVIDER]: event.id },
    },
    teams: [
      {
        id: homeId,
        name: event.home_team,
        competitionId,
        providerIds: { [PROVIDER]: event.home_team },
      },
      {
        id: awayId,
        name: event.away_team,
        competitionId,
        providerIds: { [PROVIDER]: event.away_team },
      },
    ],
    snapshots,
  };
}

/** Clave que identifica una cotización concreta a lo largo del tiempo. */
export function snapshotKey(s: {
  matchId: string;
  bookmaker: string;
  market: string;
  selection: string;
  line: number | null;
}): string {
  return [s.matchId, s.bookmaker, s.market, s.selection, s.line ?? ""].join("|");
}

/**
 * Filtra las cotizaciones que no han cambiado desde el último snapshot.
 *
 * Sin esto, una ejecución cada tres horas guardaría cientos de filas idénticas
 * al día y la tabla de histórico —que existe para calcular CLV— se volvería
 * inmanejable sin aportar información nueva.
 */
export function onlyChanged(
  incoming: SnapshotInput[],
  latestOdds: Map<string, number>
): SnapshotInput[] {
  const seen = new Set<string>();
  const out: SnapshotInput[] = [];

  for (const s of incoming) {
    const key = snapshotKey(s);
    // El proveedor puede repetir la misma casa dentro de una respuesta.
    if (seen.has(key)) continue;
    seen.add(key);

    const previous = latestOdds.get(key);
    if (previous !== undefined && Math.abs(previous - s.odds) < 1e-9) continue;
    out.push(s);
  }

  return out;
}
