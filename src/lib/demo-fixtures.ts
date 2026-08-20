import type { Fixture } from "@/lib/recommendations";

/**
 * Datos de DEMO para poder usar la app antes de conectar proveedores reales.
 *
 * `sharpOdds` simula la cuota de una casa eficiente (Pinnacle) con margen ~2,5%,
 * y `bestOdds` la mejor cuota encontrada en casas recreativas. La estructura es
 * exactamente la que devolverá la ingesta real, así que sustituir esto por la
 * API no cambia nada del resto de la app.
 */
export const DEMO_FIXTURES: Fixture[] = [
  {
    id: "demo-1",
    competition: "LaLiga",
    kickoff: "2026-08-21T21:00:00+02:00",
    homeTeam: "Real Sociedad",
    awayTeam: "Villarreal",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Real Sociedad", sharpOdds: 2.44, bestOdds: 2.58, bestBookmaker: "bet365" },
          { key: "draw", label: "Empate", sharpOdds: 3.61, bestOdds: 3.70, bestBookmaker: "williamhill" },
          { key: "away", label: "Villarreal", sharpOdds: 2.96, bestOdds: 3.05, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 2.5",
        line: 2.5,
        selections: [
          { key: "over", label: "Más de 2.5", sharpOdds: 1.89, bestOdds: 1.95, bestBookmaker: "betfair_ex_eu" },
          { key: "under", label: "Menos de 2.5", sharpOdds: 2.04, bestOdds: 2.10, bestBookmaker: "williamhill" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 1.77, bestOdds: 1.85, bestBookmaker: "bet365" },
          { key: "no", label: "No", sharpOdds: 2.16, bestOdds: 2.25, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −0.5",
        line: -0.5,
        selections: [
          { key: "home", label: "Real Sociedad −0.5", sharpOdds: 2.45, bestOdds: 2.60, bestBookmaker: "winamax_fr" },
          { key: "away", label: "Villarreal +0.5", sharpOdds: 1.63, bestOdds: 1.66, bestBookmaker: "bet365" },
        ],
      },
    ],
  },
  {
    id: "demo-2",
    competition: "LaLiga",
    kickoff: "2026-08-22T17:00:00+02:00",
    homeTeam: "Atlético de Madrid",
    awayTeam: "Elche",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Atlético de Madrid", sharpOdds: 1.43, bestOdds: 1.47, bestBookmaker: "williamhill" },
          { key: "draw", label: "Empate", sharpOdds: 4.88, bestOdds: 5.20, bestBookmaker: "bet365" },
          { key: "away", label: "Elche", sharpOdds: 8.13, bestOdds: 8.60, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 2.5",
        line: 2.5,
        selections: [
          { key: "over", label: "Más de 2.5", sharpOdds: 1.69, bestOdds: 1.75, bestBookmaker: "bet365" },
          { key: "under", label: "Menos de 2.5", sharpOdds: 2.33, bestOdds: 2.45, bestBookmaker: "williamhill" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 2.02, bestOdds: 2.10, bestBookmaker: "winamax_fr" },
          { key: "no", label: "No", sharpOdds: 1.87, bestOdds: 1.95, bestBookmaker: "bet365" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −1.5",
        line: -1.5,
        selections: [
          { key: "home", label: "Atlético −1.5", sharpOdds: 2.22, bestOdds: 2.35, bestBookmaker: "bet365" },
          { key: "away", label: "Elche +1.5", sharpOdds: 1.75, bestOdds: 1.80, bestBookmaker: "williamhill" },
        ],
      },
    ],
  },
  {
    id: "demo-3",
    competition: "LaLiga",
    kickoff: "2026-08-22T19:30:00+02:00",
    homeTeam: "Real Betis",
    awayTeam: "Athletic Club",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Real Betis", sharpOdds: 2.32, bestOdds: 2.38, bestBookmaker: "bet365" },
          { key: "draw", label: "Empate", sharpOdds: 3.48, bestOdds: 3.60, bestBookmaker: "winamax_fr" },
          { key: "away", label: "Athletic Club", sharpOdds: 3.25, bestOdds: 3.45, bestBookmaker: "williamhill" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 2.5",
        line: 2.5,
        selections: [
          { key: "over", label: "Más de 2.5", sharpOdds: 1.96, bestOdds: 2.02, bestBookmaker: "bet365" },
          { key: "under", label: "Menos de 2.5", sharpOdds: 1.96, bestOdds: 2.08, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 1.83, bestOdds: 1.88, bestBookmaker: "williamhill" },
          { key: "no", label: "No", sharpOdds: 2.07, bestOdds: 2.15, bestBookmaker: "bet365" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −0.5",
        line: -0.5,
        selections: [
          { key: "home", label: "Real Betis −0.5", sharpOdds: 2.33, bestOdds: 2.40, bestBookmaker: "winamax_fr" },
          { key: "away", label: "Athletic +0.5", sharpOdds: 1.69, bestOdds: 1.72, bestBookmaker: "bet365" },
        ],
      },
    ],
  },
  {
    id: "demo-4",
    competition: "LaLiga",
    kickoff: "2026-08-22T21:30:00+02:00",
    homeTeam: "Barcelona",
    awayTeam: "Levante",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Barcelona", sharpOdds: 1.22, bestOdds: 1.25, bestBookmaker: "williamhill" },
          { key: "draw", label: "Empate", sharpOdds: 7.5, bestOdds: 8.0, bestBookmaker: "bet365" },
          { key: "away", label: "Levante", sharpOdds: 13.94, bestOdds: 15.0, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 3.5",
        line: 3.5,
        selections: [
          { key: "over", label: "Más de 3.5", sharpOdds: 1.74, bestOdds: 1.8, bestBookmaker: "bet365" },
          { key: "under", label: "Menos de 3.5", sharpOdds: 2.22, bestOdds: 2.35, bestBookmaker: "williamhill" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 2.32, bestOdds: 2.45, bestBookmaker: "williamhill" },
          { key: "no", label: "No", sharpOdds: 1.68, bestOdds: 1.72, bestBookmaker: "bet365" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −2.5",
        line: -2.5,
        selections: [
          { key: "home", label: "Barcelona −2.5", sharpOdds: 2.12, bestOdds: 2.25, bestBookmaker: "winamax_fr" },
          { key: "away", label: "Levante +2.5", sharpOdds: 1.81, bestOdds: 1.85, bestBookmaker: "bet365" },
        ],
      },
    ],
  },
  {
    id: "demo-5",
    competition: "LaLiga",
    kickoff: "2026-08-23T16:00:00+02:00",
    homeTeam: "Rayo Vallecano",
    awayTeam: "Girona",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Rayo Vallecano", sharpOdds: 2.22, bestOdds: 2.28, bestBookmaker: "bet365" },
          { key: "draw", label: "Empate", sharpOdds: 3.61, bestOdds: 3.75, bestBookmaker: "williamhill" },
          { key: "away", label: "Girona", sharpOdds: 3.36, bestOdds: 3.55, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 2.5",
        line: 2.5,
        selections: [
          { key: "over", label: "Más de 2.5", sharpOdds: 1.91, bestOdds: 1.98, bestBookmaker: "williamhill" },
          { key: "under", label: "Menos de 2.5", sharpOdds: 1.99, bestOdds: 2.05, bestBookmaker: "bet365" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 1.8, bestOdds: 1.9, bestBookmaker: "bet365" },
          { key: "no", label: "No", sharpOdds: 2.11, bestOdds: 2.15, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −0.5",
        line: -0.5,
        selections: [
          { key: "home", label: "Rayo −0.5", sharpOdds: 2.22, bestOdds: 2.3, bestBookmaker: "williamhill" },
          { key: "away", label: "Girona +0.5", sharpOdds: 1.74, bestOdds: 1.78, bestBookmaker: "bet365" },
        ],
      },
    ],
  },
  {
    id: "demo-6",
    competition: "LaLiga",
    kickoff: "2026-08-23T21:00:00+02:00",
    homeTeam: "Real Madrid",
    awayTeam: "Osasuna",
    sharpBookmaker: "pinnacle",
    markets: [
      {
        kind: "1x2",
        label: "1X2",
        selections: [
          { key: "home", label: "Real Madrid", sharpOdds: 1.28, bestOdds: 1.31, bestBookmaker: "bet365" },
          { key: "draw", label: "Empate", sharpOdds: 6.1, bestOdds: 6.5, bestBookmaker: "williamhill" },
          { key: "away", label: "Osasuna", sharpOdds: 12.2, bestOdds: 13.0, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "totals",
        label: "Más/Menos 2.5",
        line: 2.5,
        selections: [
          { key: "over", label: "Más de 2.5", sharpOdds: 1.57, bestOdds: 1.62, bestBookmaker: "bet365" },
          { key: "under", label: "Menos de 2.5", sharpOdds: 2.57, bestOdds: 2.72, bestBookmaker: "winamax_fr" },
        ],
      },
      {
        kind: "btts",
        label: "Ambos marcan",
        selections: [
          { key: "yes", label: "Sí", sharpOdds: 2.22, bestOdds: 2.32, bestBookmaker: "williamhill" },
          { key: "no", label: "No", sharpOdds: 1.74, bestOdds: 1.8, bestBookmaker: "bet365" },
        ],
      },
      {
        kind: "ah",
        label: "Hándicap asiático −1.5",
        line: -1.5,
        selections: [
          { key: "home", label: "Real Madrid −1.5", sharpOdds: 1.88, bestOdds: 1.95, bestBookmaker: "winamax_fr" },
          { key: "away", label: "Osasuna +1.5", sharpOdds: 2.03, bestOdds: 2.12, bestBookmaker: "williamhill" },
        ],
      },
    ],
  },
];
