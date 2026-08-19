"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase, saveSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/utils";

const STEPS = ["Bankroll", "Riesgo", "Filtros"] as const;

const KELLY_OPTIONS = [
  { value: 0.125, label: "1/8 Kelly", hint: "Muy conservador" },
  { value: 0.25, label: "1/4 Kelly", hint: "Recomendado" },
  { value: 0.5, label: "1/2 Kelly", hint: "Agresivo" },
  { value: 1, label: "Kelly completo", hint: "No recomendado" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [bankroll, setBankroll] = useState("");
  const [kellyFraction, setKellyFraction] = useState(0.25);
  const [maxStakePct, setMaxStakePct] = useState("2");
  const [minEv, setMinEv] = useState("2");
  const [minOdds, setMinOdds] = useState("1.50");
  const [maxOdds, setMaxOdds] = useState("6.00");

  async function finish() {
    setLoading(true);

    const values = {
      bankroll: Number(bankroll.replace(",", ".")) || 0,
      kellyFraction,
      maxStakePct: Number(maxStakePct.replace(",", ".")) || 2,
      minEvPct: Number(minEv.replace(",", ".")) || 2,
      minOdds: Number(minOdds.replace(",", ".")) || 1.5,
      maxOdds: Number(maxOdds.replace(",", ".")) || 6,
    };

    saveSettings(values);

    if (hasSupabase()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Sin sesión no es un error: los ajustes quedan guardados en el
      // dispositivo y se subirán en cuanto la cuenta exista.
      if (user) {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          bankroll: values.bankroll,
          initial_bankroll: values.bankroll,
          currency: "EUR",
          kelly_fraction: values.kellyFraction,
          max_stake_pct: values.maxStakePct,
          min_ev_pct: values.minEvPct,
          min_odds: values.minOdds,
          max_odds: values.maxOdds,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
      }
    }

    setLoading(false);
    toast.success("Listo. Tu panel está preparado.");
    router.replace("/");
    router.refresh();
  }

  const bankrollNum = Number(bankroll.replace(",", ".")) || 0;
  const maxStakeAbs = (bankrollNum * (Number(maxStakePct) || 0)) / 100;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <header className="mb-8 animate-rise space-y-3">
        <p className="text-3xl font-semibold text-ink">
          Bet<span className="text-brand">Local</span>
        </p>
        <p className="text-sm text-ink-muted">
          Configuración inicial · paso {step + 1} de {STEPS.length}
        </p>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-brand" : "bg-surface-3"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 animate-rise space-y-5" key={step}>
        {step === 0 && (
          <>
            <h1 className="text-2xl font-semibold">¿Cuál es tu bankroll?</h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              El capital que destinas exclusivamente a esto. Todo el
              dimensionamiento de apuestas (Kelly) se calcula sobre esta cifra,
              así que debe ser dinero que puedas perder por completo.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bankroll">Bankroll inicial (€)</Label>
              <Input
                id="bankroll"
                inputMode="decimal"
                placeholder="500"
                value={bankroll}
                onChange={(e) => setBankroll(e.target.value)}
                autoFocus
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold">Tolerancia al riesgo</h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              Kelly completo maximiza el crecimiento solo si tus probabilidades
              son exactas. Como nunca lo son, se usa Kelly fraccional: menos
              varianza y mucho menor riesgo de ruina.
            </p>
            <div className="space-y-2">
              <Label>Fracción de Kelly</Label>
              <div className="grid grid-cols-2 gap-2">
                {KELLY_OPTIONS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKellyFraction(k.value)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      kellyFraction === k.value
                        ? "border-brand bg-brand/10"
                        : "border-line bg-surface-2 hover:bg-surface-3"
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">{k.label}</p>
                    <p className="text-xs text-ink-muted">{k.hint}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStake">
                Tope por apuesta (% del bankroll)
              </Label>
              <Input
                id="maxStake"
                inputMode="decimal"
                placeholder="2"
                value={maxStakePct}
                onChange={(e) => setMaxStakePct(e.target.value)}
              />
              {bankrollNum > 0 && (
                <p className="text-xs text-ink-muted">
                  Máximo por apuesta:{" "}
                  <span className="font-num font-semibold text-ink">
                    {formatCurrency(maxStakeAbs)}
                  </span>
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold">Filtros de valor</h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              Solo verás mercados que superen tu umbral de EV. Cuotas muy bajas
              o muy altas suelen tener menos valor real y más ruido de
              estimación.
            </p>
            <div className="space-y-2">
              <Label htmlFor="minEv">EV mínimo (%)</Label>
              <Input
                id="minEv"
                inputMode="decimal"
                placeholder="2"
                value={minEv}
                onChange={(e) => setMinEv(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minOdds">Cuota mínima</Label>
                <Input
                  id="minOdds"
                  inputMode="decimal"
                  placeholder="1.50"
                  value={minOdds}
                  onChange={(e) => setMinOdds(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOdds">Cuota máxima</Label>
                <Input
                  id="maxOdds"
                  inputMode="decimal"
                  placeholder="6.00"
                  value={maxOdds}
                  onChange={(e) => setMaxOdds(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Atrás
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            className="flex-1"
            onClick={() => setStep((s) => s + 1)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            disabled={loading}
            onClick={finish}
          >
            {loading ? "Guardando…" : "Empezar"}
          </Button>
        )}
      </div>
    </main>
  );
}
