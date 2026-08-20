"use client";

/**
 * Ajustes de bankroll y riesgo.
 *
 * Se guardan en localStorage para que la app sea usable antes de conectar
 * Supabase. Cuando hay sesión, la tabla `profiles` es la fuente autoritativa y
 * esto actúa de caché local.
 */

export type RiskSettings = {
  bankroll: number;
  currency: string;
  kellyFraction: number;
  maxStakePct: number;
  minEvPct: number;
  minOdds: number;
  maxOdds: number;
};

/**
 * Los filtros no son arbitrarios: salen del backtest sobre 14 temporadas y seis
 * ligas (ver `docs/BACKTEST.md`).
 *
 * Por encima de cuota 3.5 el ROI se vuelve negativo de forma consistente,
 * incluso cuando el EV calculado es alto — es el sesgo favorito/longshot: en
 * cuotas largas las casas cargan el margen y un error pequeño de probabilidad
 * se traga la ventaja entera.
 *
 * El umbral de EV es del 1% y no del 2% por una razón de volumen. Apostando en
 * una sola casa las oportunidades son escasísimas, y en el escenario medido
 * (Bet365, cuota de cierre) bajar de 2% a 1% dobló el número de apuestas sin
 * empeorar el ROI. Con tan pocas apuestas, quedarse sin muestra es un riesgo
 * mayor que colar alguna apuesta de valor ajustado.
 */
export const DEFAULT_SETTINGS: RiskSettings = {
  bankroll: 0,
  currency: "EUR",
  kellyFraction: 0.25,
  maxStakePct: 2,
  minEvPct: 1,
  minOdds: 1.2,
  maxOdds: 3.5,
};

const KEY = "betlocal.settings.v1";

export function loadSettings(): RiskSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<RiskSettings>) {
  if (typeof window === "undefined") return;
  const next = { ...loadSettings(), ...settings };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("betlocal:settings"));
}

export function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
