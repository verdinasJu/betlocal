"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatKickoff,
  formatOdds,
  formatSignedPercent,
} from "@/lib/utils";
import type { Recommendation } from "@/lib/recommendations";

function scoreTone(score: number) {
  if (score >= 65) return "bg-value/15 text-value border-value/30";
  if (score >= 45) return "bg-brand/10 text-brand border-brand/30";
  return "bg-surface-2 text-ink-muted border-line";
}

export function ValueBetCard({ bet }: { bet: Recommendation }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold text-ink">
              {bet.homeTeam} — {bet.awayTeam}
            </p>
            <p className="text-xs text-ink-faint">
              {formatKickoff(bet.kickoff)} · {bet.marketLabel}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg border px-2.5 py-1 font-num text-xs font-semibold ${scoreTone(
              bet.score
            )}`}
          >
            {bet.score}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base font-semibold text-ink">
            {bet.selectionLabel}
          </p>
          <p className="font-num text-sm text-ink-muted">{bet.bookmaker}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3">
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Cuota
            </p>
            <p className="font-num text-sm font-semibold text-ink">
              {formatOdds(bet.odds)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Justa
            </p>
            <p className="font-num text-sm font-semibold text-ink-muted">
              {formatOdds(bet.fairOdds)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              EV
            </p>
            <p className="font-num text-sm font-semibold text-value">
              {formatSignedPercent(bet.ev)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-3">
          <p className="text-sm text-ink-muted">Apostar</p>
          <p className="font-num text-lg font-semibold text-brand">
            {bet.stake > 0 ? formatCurrency(bet.stake) : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
