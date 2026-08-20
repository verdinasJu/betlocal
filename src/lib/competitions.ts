/**
 * Competiciones que se ingieren.
 *
 * Son exactamente las seis que valida el backtest (`docs/BACKTEST.md`). El tope
 * de cuota y el umbral de EV se ajustaron sobre ellas, así que aplicar esos
 * mismos filtros a una liga sin validar sería usar un criterio que nadie ha
 * comprobado ahí.
 *
 * El orden importa: cuando queda poca cuota de API, se ingieren las primeras.
 */
export type Competition = {
  /** Id interno, estable y legible. */
  id: string;
  /** Clave de la liga en The Odds API. */
  sportKey: string;
  name: string;
  /** Código ISO del país, como lo espera la tabla `competitions`. */
  country: string;
};

export const COMPETITIONS: Competition[] = [
  {
    id: "ESP.1",
    sportKey: "soccer_spain_la_liga",
    name: "LaLiga",
    country: "ES",
  },
  {
    id: "ESP.2",
    sportKey: "soccer_spain_segunda_division",
    name: "LaLiga Hypermotion",
    country: "ES",
  },
  {
    id: "ENG.1",
    sportKey: "soccer_epl",
    name: "Premier League",
    country: "GB",
  },
  {
    id: "ITA.1",
    sportKey: "soccer_italy_serie_a",
    name: "Serie A",
    country: "IT",
  },
  {
    id: "GER.1",
    sportKey: "soccer_germany_bundesliga",
    name: "Bundesliga",
    country: "DE",
  },
  {
    id: "FRA.1",
    sportKey: "soccer_france_ligue_one",
    name: "Ligue 1",
    country: "FR",
  },
];
