/**
 * Cliente de The Odds API (v4).
 *
 * Se eligió como proveedor principal porque devuelve, en una sola petición,
 * todos los partidos próximos de una liga con las cuotas de decenas de casas.
 * Eso es exactamente lo que el backtest identificó como la única fuente de
 * ventaja medible: comparar precios entre muchas casas.
 *
 * El plan gratuito da 500 peticiones al mes y **el coste es mercados × regiones**,
 * no peticiones. Por eso pedimos solo 1X2: ampliar mercados multiplicaría el
 * gasto, y el backtest solo ha validado 1X2.
 */

const BASE = "https://api.the-odds-api.com/v4";

export type ProviderOutcome = {
  name: string;
  price: number;
  point?: number;
};

export type ProviderMarket = {
  key: string;
  last_update?: string;
  outcomes: ProviderOutcome[];
};

export type ProviderBookmaker = {
  key: string;
  title: string;
  last_update: string;
  markets: ProviderMarket[];
};

export type ProviderEvent = {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ProviderBookmaker[];
};

export type Quota = {
  remaining: number | null;
  used: number | null;
  lastCost: number | null;
};

export type OddsResponse = {
  events: ProviderEvent[];
  quota: Quota;
};

export class OddsApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "OddsApiError";
  }
}

function intHeader(res: Response, name: string): number | null {
  const raw = res.headers.get(name);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function fetchOdds(params: {
  apiKey: string;
  sportKey: string;
  regions: string;
  markets: string;
}): Promise<OddsResponse> {
  const url = new URL(`${BASE}/sports/${params.sportKey}/odds`);
  url.searchParams.set("apiKey", params.apiKey);
  url.searchParams.set("regions", params.regions);
  url.searchParams.set("markets", params.markets);
  url.searchParams.set("oddsFormat", "decimal");
  url.searchParams.set("dateFormat", "iso");

  // Sin caché: una cuota cacheada es una cuota que ya no existe.
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OddsApiError(
      `The Odds API devolvió ${res.status}: ${body.slice(0, 300)}`,
      res.status
    );
  }

  return {
    events: (await res.json()) as ProviderEvent[],
    quota: {
      remaining: intHeader(res, "x-requests-remaining"),
      used: intHeader(res, "x-requests-used"),
      lastCost: intHeader(res, "x-requests-last"),
    },
  };
}

/** Comprueba que la liga existe y está activa antes de gastar cuota en ella. */
export async function fetchSports(apiKey: string): Promise<
  { key: string; title: string; active: boolean; group: string }[]
> {
  const url = new URL(`${BASE}/sports`);
  url.searchParams.set("apiKey", apiKey);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new OddsApiError(`The Odds API devolvió ${res.status}`, res.status);
  }
  return res.json();
}
