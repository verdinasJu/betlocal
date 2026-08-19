"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BankrollCard } from "@/components/BankrollCard";
import { ValueBetCard } from "@/components/ValueBetCard";
import { useSettings } from "@/hooks/useSettings";
import { readFixtures, valueBets, type Fixture } from "@/lib/recommendations";
import { formatCurrency, formatKickoff, formatSignedPercent } from "@/lib/utils";

export function TodayView({
  fixtures,
  isDemo,
}: {
  fixtures: Fixture[];
  isDemo: boolean;
}) {
  const { settings, update, ready } = useSettings();

  const readings = useMemo(
    () => readFixtures(fixtures, settings),
    [fixtures, settings]
  );

  const bets = useMemo(() => valueBets(readings, settings), [readings, settings]);

  const totalStake = bets.reduce((acc, b) => acc + b.stake, 0);
  const avgEv = bets.length
    ? bets.reduce((acc, b) => acc + b.ev, 0) / bets.length
    : 0;

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
        <p className="text-sm text-ink-muted">
          LaLiga · {fixtures.length} partidos analizados
        </p>
      </header>

      <BankrollCard settings={settings} onChange={update} />

      {!ready ? null : settings.bankroll <= 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-muted leading-relaxed">
              Introduce tu banco arriba y verás cuánto apostar en cada
              recomendación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Con valor", value: String(bets.length) },
              { label: "A apostar", value: formatCurrency(totalStake) },
              { label: "EV medio", value: formatSignedPercent(avgEv) },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="space-y-1 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                    {stat.label}
                  </p>
                  <p className="font-num text-base font-semibold text-ink">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Recomendaciones
            </h2>
            {bets.length ? (
              bets.map((bet) => <ValueBetCard key={bet.id} bet={bet} />)
            ) : (
              <Card>
                <CardContent>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Ningún mercado supera tu umbral de {settings.minEvPct}% de EV
                    con cuota entre {settings.minOdds} y {settings.maxOdds}. No
                    apostar también es una decisión: forzar apuestas sin valor es
                    la vía más rápida a perder el banco.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Partidos
            </h2>
            {readings.map(({ fixture, matchEdge, avgMargin }) => (
              <Card key={fixture.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {fixture.homeTeam} — {fixture.awayTeam}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {formatKickoff(fixture.kickoff)} · {fixture.sharpBookmaker}{" "}
                      · margen {(avgMargin * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                      Edge
                    </p>
                    <p className="font-num text-base font-semibold text-ink">
                      {matchEdge}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </>
      )}

      <p className="text-xs text-ink-faint leading-relaxed">
        {isDemo
          ? "Datos de demostración: todavía no hay cuotas ingeridas para los próximos días. "
          : ""}
        BetLocal informa sobre desviaciones de precio; no predice resultados ni
        garantiza ganancias. +18.
      </p>
    </main>
  );
}
