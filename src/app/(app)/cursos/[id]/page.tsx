"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { courseById } from "@/lib/study/content";
import { useProgress } from "@/hooks/useProgress";
import { statsFor } from "@/lib/study/srs";

export default function CursoDetallePage() {
  const params = useParams<{ id: string }>();
  const course = courseById(params.id);
  const { map, ready } = useProgress();

  if (!course) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-ink-muted">Curso no encontrado.</p>
        <Link href="/cursos" className="text-brand text-sm">
          Volver
        </Link>
      </main>
    );
  }

  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <Link href="/cursos" className="text-xs text-ink-faint">
          ← Cursos
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
        <p className="text-sm text-ink-muted">{course.description}</p>
      </header>

      <div className="space-y-3">
        {course.topics
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((topic) => {
            const cards = course.cards.filter((c) => c.topicId === topic.id);
            const st = ready
              ? statsFor(
                  cards.map((c) => c.id),
                  map
                )
              : null;
            return (
              <Card key={topic.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{topic.title}</p>
                    <p className="font-num text-sm text-ink-muted">
                      {st ? `${Math.round(st.accuracy * 100)}%` : "—"}
                    </p>
                  </div>
                  <p className="text-xs text-ink-faint">{topic.summary}</p>
                  <p className="text-xs text-ink-muted">
                    {cards.length} fichas
                    {st ? ` · ${st.due} pendientes` : ""}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      href={`/aprender/${topic.id}`}
                      className="text-sm text-brand"
                    >
                      Aprender conceptos →
                    </Link>
                    <Link
                      href={`/jugar/quiz?topic=${topic.id}`}
                      className="text-sm text-ink-muted"
                    >
                      Practicar
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
