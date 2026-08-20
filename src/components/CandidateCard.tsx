"use client";

/**
 * Una selección candidata.
 *
 * La app no puede decir "apuesta 20 € en tal casa a cuota 2.10" porque el
 * proveedor de cuotas no cubre Bet365 y, aunque lo cubriera, los precios de
 * cada web nacional son distintos. Lo que sí puede decir es cuál es el precio
 * justo y, por tanto, la cuota mínima que hace la apuesta rentable. El usuario
 * mira su casa, escribe lo que ve y la tarjeta resuelve el resto.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { availability, bookmakerName, MY_BOOKMAKER } from "@/lib/bookmakers";
import { assess, type Recommendation } from "@/lib/recommendations";
import type { RiskSettings } from "@/lib/settings";
import {
  formatCurrency,
  formatKickoff,
  formatOdds,
  formatSignedPercent,
} from "@/lib/utils";

/** Nota sobre si el precio mostrado es realmente tomable desde España. */
function marketNote(bookmaker: string): string {
  const name = bookmakerName(bookmaker);
  switch (availability(bookmaker)) {
    case "es":
      return name;
    case "brand":
      return `${name} · precio de otro país`;
    case "none":
      return `${name} · sin licencia en España`;
  }
}

export function CandidateCard({
  row,
  settings,
}: {
  row: Recommendation;
  settings: RiskSettings;
}) {
  const [typed, setTyped] = useState(
    row.mine ? row.mine.odds.toFixed(2) : ""
  );

  const odds = Number(typed.replace(",", "."));
  const valid = Number.isFinite(odds) && odds > 1;
  const result = valid ? assess(row.fairProb, odds, settings) : null;

  const tooLow = valid && odds < row.targetOdds;
  const tooHigh = valid && odds > settings.maxOdds;
  const go = Boolean(result) && !tooLow && !tooHigh;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-ink">
            {row.homeTeam} — {row.awayTeam}
          </p>
          <p className="text-xs text-ink-faint">
            {row.competition} · {formatKickoff(row.kickoff)} · {row.marketLabel}
          </p>
        </div>

        <p className="text-base font-semibold text-ink">{row.selectionLabel}</p>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3">
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Justa
            </p>
            <p className="font-num text-sm font-semibold text-ink-muted">
              {formatOdds(row.fairOdds)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Objetivo
            </p>
            <p className="font-num text-sm font-semibold text-brand">
              {formatOdds(row.targetOdds)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Mercado
            </p>
            <p className="font-num text-sm font-semibold text-ink">
              {formatOdds(row.best.odds)}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-ink-faint">
          Mejor precio en {marketNote(row.best.bookmaker)}
        </p>

        <div className="space-y-2 border-t border-line/60 pt-3">
          <label
            className="text-xs text-ink-muted"
            htmlFor={`odds-${row.id}`}
          >
            Cuota en {bookmakerName(MY_BOOKMAKER)}
          </label>
          <Input
            id={`odds-${row.id}`}
            inputMode="decimal"
            placeholder={formatOdds(row.targetOdds)}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="font-num"
          />
        </div>

        {result ? (
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                EV
              </p>
              <p
                className={`font-num text-sm font-semibold ${
                  result.ev > 0 ? "text-value" : "text-ink-muted"
                }`}
              >
                {formatSignedPercent(result.ev)}
              </p>
            </div>
            <div className="text-right">
              {go ? (
                <>
                  <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                    Apostar
                  </p>
                  <p className="font-num text-lg font-semibold text-brand">
                    {result.stake > 0 ? formatCurrency(result.stake) : "—"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-muted">
                  {tooLow
                    ? `Necesitas ${formatOdds(row.targetOdds)}`
                    : `Cuota por encima de ${formatOdds(settings.maxOdds)}`}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
