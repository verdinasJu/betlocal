"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useLessons } from "@/hooks/useLessons";
import { useStudySettings } from "@/hooks/useStudySettings";
import { courseById, getDefaultCourse } from "@/lib/study/content";
import { topicLessonsDone } from "@/lib/study/lessons";

export default function AprenderPage() {
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();
  const { map, ready } = useLessons();

  const topics = course.topics.slice().sort((a, b) => a.order - b.order);

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Aprender</h1>
        <p className="text-sm text-ink-muted">
          Primero los conceptos, en español sencillo. Luego juegas / practicas.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-semibold text-ink">Plan ~10 días</p>
          <p className="text-xs leading-relaxed text-ink-muted">
            Cada tema tiene un día sugerido. Lee las lecciones del día y practica
            15–20 preguntas. El último día: Revancha + Jefe de los temas flojos.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {topics.map((topic) => {
          const { done, total } = topicLessonsDone(
            topic.lessons.map((l) => l.id),
            map
          );
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <Link key={topic.id} href={`/aprender/${topic.id}`} className="block">
              <Card className="transition hover:border-brand/40">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink">
                      {topic.day ? (
                        <span className="text-brand">D{topic.day} · </span>
                      ) : null}
                      {topic.title}
                    </p>
                    <p className="font-num text-xs text-ink-muted">
                      {ready ? `${done}/${total}` : "—"}
                    </p>
                  </div>
                  <p className="text-xs text-ink-faint">{topic.summary}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
