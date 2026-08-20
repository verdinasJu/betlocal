/**
 * Registro de casas de apuestas.
 *
 * En la base se guarda la clave del proveedor (`betfair_ex_eu`) porque es
 * estable; el nombre comercial cambia y no queremos reescribir el histórico
 * cuando una casa se renombra.
 *
 * Además del nombre hay dos datos que deciden si una recomendación es
 * ejecutable desde España:
 *
 *   - `spain`: la marca tiene licencia de la DGOJ. Sin ella no se puede abrir
 *     cuenta legalmente y la recomendación es inservible por muy buena que sea.
 *   - `site`: el país de la web cuyos precios publica el proveedor. Una misma
 *     marca cotiza distinto en cada país, porque el margen y los impuestos son
 *     locales. `betfred_uk` es Betfred Reino Unido: la marca está licenciada en
 *     España, pero ese precio concreto no lo vas a encontrar en betfred.es.
 *
 * `null` en `site` significa web global, que es lo más parecido a lo que ve un
 * usuario español.
 */

export type BookmakerKind = "sharp" | "exchange" | "soft";

/** Hasta qué punto se puede ejecutar un precio desde España. */
export type Availability =
  /** Marca licenciada y precio de la web global: es lo más fiable. */
  | "es"
  /** Marca licenciada, pero el precio es de otro país: solo indicativo. */
  | "brand"
  /** Sin licencia en España. */
  | "none";

type Bookmaker = {
  name: string;
  spain: boolean;
  site: string | null;
  kind: BookmakerKind;
};

const BOOKMAKERS: Record<string, Bookmaker> = {
  // Sharp y exchanges. Ninguno es donde se apuesta: son la referencia de
  // precio justo. Pinnacle no admite clientes españoles y las exchanges de
  // Betfair que publica el proveedor no son la de betfair.es, que tiene
  // liquidez segregada por ley.
  pinnacle: { name: "Pinnacle", spain: false, site: null, kind: "sharp" },
  betfair_ex_eu: { name: "Betfair Exchange", spain: true, site: "EU", kind: "exchange" },
  betfair_ex_uk: { name: "Betfair Exchange", spain: true, site: "UK", kind: "exchange" },
  smarkets: { name: "Smarkets", spain: false, site: null, kind: "exchange" },
  matchbook: { name: "Matchbook", spain: false, site: null, kind: "exchange" },
  betonlineag: { name: "BetOnline", spain: false, site: null, kind: "sharp" },

  // Marcas con licencia en España y precios de web global: las únicas cuyas
  // cuotas se parecen a las que verías tú.
  bet365: { name: "Bet365", spain: true, site: null, kind: "soft" },
  williamhill: { name: "William Hill", spain: true, site: null, kind: "soft" },
  marathonbet: { name: "Marathonbet", spain: true, site: null, kind: "soft" },
  betsson: { name: "Betsson", spain: true, site: null, kind: "soft" },
  betway: { name: "Betway", spain: true, site: null, kind: "soft" },
  casumo: { name: "Casumo", spain: true, site: null, kind: "soft" },
  leovegas: { name: "LeoVegas", spain: true, site: null, kind: "soft" },
  onexbet: { name: "1xBet", spain: true, site: null, kind: "soft" },
  interwetten: { name: "Interwetten", spain: true, site: null, kind: "soft" },
  betsafe: { name: "Betsafe", spain: false, site: null, kind: "soft" },

  // Marcas con licencia en España, pero el proveedor publica otra web.
  betfair_sb_uk: { name: "Betfair", spain: true, site: "UK", kind: "soft" },
  betfred_uk: { name: "Betfred", spain: true, site: "UK", kind: "soft" },
  codere_it: { name: "Codere", spain: true, site: "IT", kind: "soft" },
  winamax_fr: { name: "Winamax", spain: true, site: "FR", kind: "soft" },
  winamax_de: { name: "Winamax", spain: true, site: "DE", kind: "soft" },
  leovegas_se: { name: "LeoVegas", spain: true, site: "SE", kind: "soft" },

  // Sin licencia en España.
  betano_uk: { name: "Betano", spain: false, site: "UK", kind: "soft" },
  betclic_fr: { name: "Betclic", spain: false, site: "FR", kind: "soft" },
  betvictor: { name: "BetVictor", spain: false, site: null, kind: "soft" },
  boylesports: { name: "BoyleSports", spain: false, site: "UK", kind: "soft" },
  coolbet: { name: "Coolbet", spain: false, site: null, kind: "soft" },
  coral: { name: "Coral", spain: false, site: "UK", kind: "soft" },
  everygame: { name: "Everygame", spain: false, site: null, kind: "soft" },
  grosvenor: { name: "Grosvenor", spain: false, site: "UK", kind: "soft" },
  ladbrokes_uk: { name: "Ladbrokes", spain: false, site: "UK", kind: "soft" },
  livescorebet: { name: "LiveScore Bet", spain: false, site: "UK", kind: "soft" },
  nordicbet: { name: "NordicBet", spain: false, site: null, kind: "soft" },
  paddypower: { name: "Paddy Power", spain: false, site: "UK", kind: "soft" },
  pmu_fr: { name: "PMU", spain: false, site: "FR", kind: "soft" },
  skybet: { name: "Sky Bet", spain: false, site: "UK", kind: "soft" },
  tipico_de: { name: "Tipico", spain: false, site: "DE", kind: "soft" },
  unibet_fr: { name: "Unibet", spain: false, site: "FR", kind: "soft" },
  unibet_nl: { name: "Unibet", spain: false, site: "NL", kind: "soft" },
  unibet_se: { name: "Unibet", spain: false, site: "SE", kind: "soft" },
  unibet_uk: { name: "Unibet", spain: false, site: "UK", kind: "soft" },
  unibet_eu: { name: "Unibet", spain: false, site: "EU", kind: "soft" },
  virginbet: { name: "Virgin Bet", spain: false, site: "UK", kind: "soft" },
  superbet: { name: "Superbet", spain: false, site: null, kind: "soft" },
  suprabets: { name: "Suprabets", spain: false, site: null, kind: "soft" },
};

/** La casa donde apuesta el usuario por defecto. */
export const MY_BOOKMAKER = "bet365";

function fallbackName(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function bookmakerName(key: string): string {
  const book = BOOKMAKERS[key];
  if (!book) return fallbackName(key);
  return book.site ? `${book.name} ${book.site}` : book.name;
}

export function availability(key: string): Availability {
  const book = BOOKMAKERS[key];
  if (!book?.spain) return "none";
  return book.site ? "brand" : "es";
}

/** Casas donde un usuario español puede apostar al precio que ve la app. */
export function isBettableFromSpain(key: string): boolean {
  return availability(key) === "es";
}
