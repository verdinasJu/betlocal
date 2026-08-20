"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { COURSES } from "@/lib/study/content";
import { useStudySettings } from "@/hooks/useStudySettings";
import { useProgress } from "@/hooks/useProgress";
import { statsFor } from "@/lib/study/srs";

export default function CursosPage() {
  const { settings, update } = useStudySettings();
  const { map, ready } = useProgress();

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Cursos</h1>
        <p className="text-sm text-ink-muted">
          Elige qué estás preparando. Luego añade Developer I o Psicología con
          el mismo molde.
        </p>
      </header>

      <div className="space-y-3">
        {COURSES.map((course) => {
          const active = settings.activeCourseId === course.id;
          const st = ready
            ? statsFor(
                course.cards.map((c) => c.id),
                map
              )
            : null;
          return (
            <Card key={course.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-ink">
                      {course.title}
                    </p>
                    <p className="text-xs text-ink-faint">{course.examHint}</p>
                  </div>
                  {active ? (
                    <span className="rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-[11px] text-brand">
                      Activo
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {course.description}
                </p>
                <p className="text-xs text-ink-faint">
                  {course.topics.length} temas · {course.cards.length} fichas
                  {st ? ` · ${Math.round(st.accuracy * 100)}% precisión` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!active ? (
                    <button
                      type="button"
                      className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink"
                      onClick={() => update({ activeCourseId: course.id })}
                    >
                      Activar
                    </button>
                  ) : null}
                  <Link
                    href="/jugar"
                    className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-[#04120c]"
                  >
                    Jugar
                  </Link>
                  <Link
                    href={`/cursos/${course.id}`}
                    className="rounded-xl border border-line px-3 py-2 text-sm text-ink-muted"
                  >
                    Temas
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
