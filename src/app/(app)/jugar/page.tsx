"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GAME_MODES } from "@/lib/study/games";

export default function JugarPage() {
  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Jugar</h1>
        <p className="text-sm text-ink-muted">
          Elige un modo. El examen de prueba simula el formato real.
        </p>
      </header>

      <Link href="/examen" className="block">
        <Card className="border-brand/40 transition hover:border-brand">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="space-y-1">
              <p className="font-semibold text-ink">Examen de prueba</p>
              <p className="text-xs text-ink-muted">
                60 preguntas · 105 min · aprobado al 68%
              </p>
            </div>
            <span className="text-brand text-sm">→</span>
          </CardContent>
        </Card>
      </Link>

      <div className="space-y-3">
        {GAME_MODES.map((mode) => (
          <Link key={mode.id} href={`/jugar/${mode.id}`} className="block">
            <Card className="transition hover:border-brand/40">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{mode.title}</p>
                  <p className="text-xs text-ink-muted">{mode.blurb}</p>
                </div>
                <span className="text-brand text-sm">→</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
