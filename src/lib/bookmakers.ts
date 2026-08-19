/**
 * Nombres legibles de las casas.
 *
 * En la base se guarda la clave del proveedor (`betfair_ex_eu`) porque es
 * estable; el nombre comercial cambia y no queremos reescribir el histórico
 * cuando una casa se renombra.
 */
const NAMES: Record<string, string> = {
  betfair_ex_eu: "Betfair Exchange",
  betfair_ex_uk: "Betfair Exchange UK",
  betfair: "Betfair",
  pinnacle: "Pinnacle",
  smarkets: "Smarkets",
  matchbook: "Matchbook",
  onexbet: "1xBet",
  williamhill: "William Hill",
  betclic: "Betclic",
  winamax_fr: "Winamax",
  winamax_de: "Winamax DE",
  unibet_eu: "Unibet",
  unibet_uk: "Unibet UK",
  betsson: "Betsson",
  betano: "Betano",
  tipico_de: "Tipico",
  marathonbet: "Marathonbet",
  nordicbet: "NordicBet",
  betsafe: "Betsafe",
  coolbet: "Coolbet",
  superbet: "Superbet",
  betvictor: "BetVictor",
  bet365: "Bet365",
  ladbrokes_uk: "Ladbrokes",
  coral: "Coral",
  paddypower: "Paddy Power",
  skybet: "Sky Bet",
  boylesports: "BoyleSports",
  leovegas: "LeoVegas",
  livescorebet: "LiveScore Bet",
  casumo: "Casumo",
  grosvenor: "Grosvenor",
  virginbet: "Virgin Bet",
  everygame: "Everygame",
  suprabets: "Suprabets",
};

export function bookmakerName(key: string): string {
  return (
    NAMES[key] ??
    key
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
