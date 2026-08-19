"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankrollCard } from "@/components/BankrollCard";
import { SignOutButton } from "@/components/SignOutButton";
import { useSettings } from "@/hooks/useSettings";
import { hasSupabase } from "@/lib/settings";

export default function SettingsPage() {
  const { settings, update } = useSettings();

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-sm text-ink-muted">Banco, riesgo y filtros</p>
      </header>

      <BankrollCard settings={settings} onChange={update} />

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minEv">EV mínimo para recomendar</Label>
            <div className="relative">
              <Input
                id="minEv"
                inputMode="decimal"
                className="font-num pr-8"
                value={String(settings.minEvPct)}
                onChange={(e) =>
                  update({
                    minEvPct: Number(e.target.value.replace(",", ".")) || 0,
                  })
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                %
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Por debajo del 2% el valor detectado suele quedar dentro del error
              del propio modelo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minOdds">Cuota mínima</Label>
              <Input
                id="minOdds"
                inputMode="decimal"
                className="font-num"
                value={String(settings.minOdds)}
                onChange={(e) =>
                  update({
                    minOdds: Number(e.target.value.replace(",", ".")) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOdds">Cuota máxima</Label>
              <Input
                id="maxOdds"
                inputMode="decimal"
                className="font-num"
                value={String(settings.maxOdds)}
                onChange={(e) =>
                  update({
                    maxOdds: Number(e.target.value.replace(",", ".")) || 0,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSupabase() && <SignOutButton />}

      <p className="text-xs text-ink-faint leading-relaxed">
        BetLocal es una herramienta de análisis estadístico. No es una casa de
        apuestas, no acepta apuestas y no garantiza resultados. Apostar implica
        riesgo de pérdida total. +18. Si el juego te genera problemas: FEJAR 900
        200 225.
      </p>
    </main>
  );
}
