"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/hooks/useProgress";
import { useStudySettings } from "@/hooks/useStudySettings";
import { courseById, getDefaultCourse } from "@/lib/study/content";
import { statsFor } from "@/lib/study/srs";

export default function ProgresoPage() {
  const { map, ready } = useProgress();
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();

  const overall = ready
    ? statsFor(
        course.cards.map((c) => c.id),
        map
      )
    : null;

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Progreso</h1>
        <p className="text-sm text-ink-muted">{course.title}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Precisión
            </p>
            <p className="font-num text-lg font-semibold">
              {overall ? `${Math.round(overall.accuracy * 100)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Intentos
            </p>
            <p className="font-num text-lg font-semibold">
              {overall ? overall.attempts : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Debido
            </p>
            <p className="font-num text-lg font-semibold">
              {overall ? overall.due : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Por tema
        </h2>
        {course.topics
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((topic) => {
            const ids = course.cards
              .filter((c) => c.topicId === topic.id)
              .map((c) => c.id);
            const st = ready ? statsFor(ids, map) : null;
            const pct = st ? Math.round(st.accuracy * 100) : 0;
            return (
              <Card key={topic.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{topic.title}</p>
                    <p className="font-num text-sm text-ink-muted">{pct}%</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-faint">
                    {st?.seen ?? 0}/{ids.length} vistas · {st?.due ?? ids.length}{" "}
                    pendientes
                  </p>
                </CardContent>
              </Card>
            );
          })}
      </section>

      <ButtonLikeRevenge />
    </main>
  );
}

function ButtonLikeRevenge() {
  return (
    <Link
      href="/jugar/revenge"
      className="block w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-center text-sm font-medium text-ink"
    >
      Abrir Revancha (solo fallos)
    </Link>
  );
}
