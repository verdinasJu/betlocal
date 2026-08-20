"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BankrollCard } from "@/components/BankrollCard";
import { CandidateCard } from "@/components/CandidateCard";
import { useSettings } from "@/hooks/useSettings";
import { MY_BOOKMAKER, bookmakerName } from "@/lib/bookmakers";
import { candidates, readFixtures, type Fixture } from "@/lib/recommendations";
import { formatKickoff, formatOdds } from "@/lib/utils";

const SHOWN = 12;

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

  const rows = useMemo(
    () => candidates(readings, settings).slice(0, SHOWN),
    [readings, settings]
  );

  const leagues = new Set(fixtures.map((f) => f.competition)).size;

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
        <p className="text-sm text-ink-muted">
          {fixtures.length} partidos en los próximos 3 días
        </p>
      </header>

      <BankrollCard settings={settings} onChange={update} />

      {!ready ? null : settings.bankroll <= 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-muted leading-relaxed">
              Introduce tu banco arriba y verás cuánto apostar en cada
              selección.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Candidatas", value: String(rows.length) },
              { label: "Ligas", value: String(leagues) },
              {
                label: "Objetivo medio",
                value: rows.length
                  ? formatOdds(
                      rows.reduce((a, r) => a + r.targetOdds, 0) / rows.length
                    )
                  : "—",
              },
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
              A comprobar en {bookmakerName(MY_BOOKMAKER)}
            </h2>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Cada tarjeta trae la cuota mínima que necesitas. Abre tu casa,
                  compara y escribe el precio que veas: si llega al objetivo, te
                  digo cuánto apostar.
                </p>
              </CardContent>
            </Card>
            {rows.length ? (
              rows.map((row) => (
                <CandidateCard key={row.id} row={row} settings={settings} />
              ))
            ) : (
              <Card>
                <CardContent>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Hoy ninguna selección deja holgura sobre la cuota objetivo
                    con tu umbral de {settings.minEvPct}% de EV y tope de cuota{" "}
                    {settings.maxOdds}. No apostar también es una decisión:
                    forzar apuestas sin valor es la vía más rápida a perder el
                    banco.
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
                      {formatKickoff(fixture.kickoff)} ·{" "}
                      {bookmakerName(fixture.sharpBookmaker)} · margen{" "}
                      {(avgMargin * 100).toFixed(1)}%
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
        Las cuotas de referencia vienen de casas sharp, que no admiten clientes
        españoles; sirven para fijar el precio justo, no para apostar. BetLocal
        informa sobre desviaciones de precio; no predice resultados ni garantiza
        ganancias. +18.
      </p>
    </main>
  );
}
