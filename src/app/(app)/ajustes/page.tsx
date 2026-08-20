"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountCard } from "@/components/AccountCard";
import { useProgress } from "@/hooks/useProgress";
import { useStudySettings } from "@/hooks/useStudySettings";
import { hasSupabase } from "@/lib/settings";

export default function AjustesPage() {
  const { settings, update } = useStudySettings();
  const { reset } = useProgress();

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-sm text-ink-muted">
          Meta diaria y cuenta (opcional, para sync más adelante).
        </p>
      </header>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Label htmlFor="goal">Fichas por día</Label>
          <Input
            id="goal"
            type="number"
            min={5}
            max={50}
            value={settings.dailyGoal}
            onChange={(e) =>
              update({ dailyGoal: Math.max(5, Number(e.target.value) || 15) })
            }
          />
          <p className="text-xs text-ink-faint">
            Mejor 15 constantes que 80 un domingo.
          </p>
        </CardContent>
      </Card>

      {hasSupabase() ? <AccountCard /> : null}

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold text-ink">Progreso local</p>
          <p className="text-xs leading-relaxed text-ink-muted">
            El SRS se guarda en este dispositivo. Borrar reinicia aciertos,
            fallos y fechas de repaso.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("¿Borrar todo el progreso de estudio?")) reset();
            }}
          >
            Reiniciar progreso
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
