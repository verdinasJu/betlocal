"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase, loadSettings, saveSettings } from "@/lib/settings";

/**
 * Sincroniza los ajustes de riesgo entre el dispositivo y la cuenta.
 *
 * Sin sesión, los ajustes viven solo en localStorage y la app funciona igual.
 * Con sesión, el perfil del servidor manda en la primera carga —es lo que hace
 * que veas el mismo banco en el móvil y en el PC— y a partir de ahí cada cambio
 * se replica arriba.
 */
export function SettingsSync() {
  const hydrated = useRef(false);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    if (!hasSupabase()) return;

    const supabase = createClient();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function pull() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      userId.current = user.id;

      const { data } = await supabase
        .from("profiles")
        .select(
          "bankroll, currency, kelly_fraction, max_stake_pct, min_ev_pct, min_odds, max_odds"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (data && !cancelled && Number(data.bankroll) > 0) {
        saveSettings({
          bankroll: Number(data.bankroll),
          currency: data.currency ?? "EUR",
          kellyFraction: Number(data.kelly_fraction),
          maxStakePct: Number(data.max_stake_pct),
          minEvPct: Number(data.min_ev_pct),
          minOdds: Number(data.min_odds),
          maxOdds: Number(data.max_odds),
        });
      }

      hydrated.current = true;
    }

    void pull();

    function push() {
      if (!hydrated.current || !userId.current) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const s = loadSettings();
        await supabase.from("profiles").upsert({
          id: userId.current,
          bankroll: s.bankroll,
          currency: s.currency,
          kelly_fraction: s.kellyFraction,
          max_stake_pct: s.maxStakePct,
          min_ev_pct: s.minEvPct,
          min_odds: s.minOdds,
          max_odds: s.maxOdds,
          updated_at: new Date().toISOString(),
        });
      }, 900);
    }

    window.addEventListener("betlocal:settings", push);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("betlocal:settings", push);
    };
  }, []);

  return null;
}
