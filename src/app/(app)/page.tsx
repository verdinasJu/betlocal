"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { useStudySettings } from "@/hooks/useStudySettings";
import { courseById, getDefaultCourse } from "@/lib/study/content";
import { dueCardIds, statsFor } from "@/lib/study/srs";

export default function HoyPage() {
  const { map, ready, dailyCount } = useProgress();
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();
  const ids = course.cards.map((c) => c.id);
  const due = ready ? dueCardIds(ids, map) : [];
  const stats = ready ? statsFor(ids, map) : null;
  const goal = settings.dailyGoal;
  const doneToday = Math.min(goal, dailyCount);

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">
          Estudia
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
        <p className="text-sm text-ink-muted">{course.title}</p>
      </header>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                Meta diaria
              </p>
              <p className="font-num text-2xl font-semibold text-ink">
                {ready ? `${Math.min(doneToday, goal)}/${goal}` : "—"}
              </p>
            </div>
            <p className="text-sm text-ink-muted">
              {due.length} pendientes de repaso
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{
                width: `${ready ? Math.min(100, (doneToday / goal) * 100) : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Precisión
            </p>
            <p className="font-num text-lg font-semibold">
              {stats ? `${Math.round(stats.accuracy * 100)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Fichas vistas
            </p>
            <p className="font-num text-lg font-semibold">
              {stats ? `${stats.seen}/${ids.length}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <Button asChild className="w-full" size="lg">
          <Link href="/jugar/quiz">Estudiar pendientes</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/jugar/streak">Modo racha</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/jugar">Todos los juegos</Link>
        </Button>
      </section>

      <p className="text-xs leading-relaxed text-ink-faint">
        Recuerdo activo + repetición espaciada: lo que fallas vuelve pronto; lo
        que aciertas se alarga. Sesiones cortas ganan a los maratones.
      </p>
    </main>
  );
}
