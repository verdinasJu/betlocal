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

export const DEFAULT_SETTINGS: RiskSettings = {
  bankroll: 0,
  currency: "EUR",
  kellyFraction: 0.25,
  maxStakePct: 2,
  minEvPct: 2,
  minOdds: 1.5,
  maxOdds: 6,
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
