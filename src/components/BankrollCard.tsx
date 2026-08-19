"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { RiskSettings } from "@/lib/settings";

const KELLY_OPTIONS = [
  { value: 0.125, label: "1/8" },
  { value: 0.25, label: "1/4" },
  { value: 0.5, label: "1/2" },
  { value: 1, label: "Full" },
];

export function BankrollCard({
  settings,
  onChange,
}: {
  settings: RiskSettings;
  onChange: (patch: Partial<RiskSettings>) => void;
}) {
  const maxStake = (settings.bankroll * settings.maxStakePct) / 100;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankroll">Mi banco</Label>
          <div className="relative">
            <Input
              id="bankroll"
              inputMode="decimal"
              className="font-num pr-10 text-lg"
              placeholder="0"
              value={settings.bankroll ? String(settings.bankroll) : ""}
              onChange={(e) =>
                onChange({
                  bankroll: Number(e.target.value.replace(",", ".")) || 0,
                })
              }
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
              €
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Kelly</Label>
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-2 p-1">
              {KELLY_OPTIONS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => onChange({ kellyFraction: k.value })}
                  className={`rounded-lg py-2 text-xs font-semibold transition ${
                    settings.kellyFraction === k.value
                      ? "bg-brand text-[#04120c]"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStakePct">Tope por apuesta</Label>
            <div className="relative">
              <Input
                id="maxStakePct"
                inputMode="decimal"
                className="font-num pr-8"
                value={String(settings.maxStakePct)}
                onChange={(e) =>
                  onChange({
                    maxStakePct: Number(e.target.value.replace(",", ".")) || 0,
                  })
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                %
              </span>
            </div>
          </div>
        </div>

        {settings.bankroll > 0 && (
          <p className="text-xs text-ink-muted leading-relaxed">
            Nunca se te recomendará más de{" "}
            <span className="font-num font-semibold text-ink">
              {formatCurrency(maxStake)}
            </span>{" "}
            por apuesta. Con Kelly {settings.kellyFraction} el stake se reduce
            para absorber el error de estimación del modelo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
