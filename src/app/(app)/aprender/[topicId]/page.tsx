"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courseById, getDefaultCourse, topicById } from "@/lib/study/content";
import { useLessons } from "@/hooks/useLessons";
import { useStudySettings } from "@/hooks/useStudySettings";
import { topicLessonsDone } from "@/lib/study/lessons";

export default function AprenderTopicPage() {
  const params = useParams<{ topicId: string }>();
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();
  const topic = topicById(course, params.topicId);
  const { map, ready, mark } = useLessons();
  const [index, setIndex] = useState(0);

  const lessons = topic?.lessons ?? [];
  const lesson = lessons[index];
  const progress = useMemo(
    () => topicLessonsDone(
      lessons.map((l) => l.id),
      map
    ),
    [lessons, map]
  );

  if (!topic) {
    return (
      <main className="space-y-3">
        <p className="text-sm text-ink-muted">Tema no encontrado.</p>
        <Link href="/aprender" className="text-sm text-brand">
          Volver
        </Link>
      </main>
    );
  }

  if (!lessons.length) {
    return (
      <main className="space-y-3">
        <p className="text-sm text-ink-muted">Este tema aún no tiene lecciones.</p>
        <Link href={`/jugar/quiz?topic=${topic.id}`} className="text-sm text-brand">
          Ir a practicar
        </Link>
      </main>
    );
  }

  const allDone = progress.done >= progress.total;

  return (
    <main className="animate-rise space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/aprender" className="text-xs text-ink-faint">
          ← Temas
        </Link>
        <p className="font-num text-xs text-ink-muted">
          {ready ? `${progress.done}/${progress.total}` : "—"} leídas
        </p>
      </div>

      <header className="space-y-1">
        <p className="text-xs text-brand">
          {topic.day ? `Día ${topic.day} · ` : ""}
          Conceptos
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{topic.title}</h1>
      </header>

      {lesson ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-xs text-ink-faint">
              Lección {index + 1} de {lessons.length}
            </p>
            <h2 className="text-lg font-semibold text-ink">{lesson.title}</h2>
            {lesson.body.split("\n\n").map((p) => (
              <p key={p.slice(0, 24)} className="text-sm leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
            {lesson.sourceUrl ? (
              <a
                href={lesson.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-brand underline"
              >
                {lesson.sourceLabel ?? "Fuente"}
              </a>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={() => {
                  mark(lesson.id);
                  if (index < lessons.length - 1) setIndex(index + 1);
                }}
              >
                {index < lessons.length - 1 ? "Entendido →" : "Marcar leída"}
              </Button>
              {index > 0 ? (
                <Button variant="secondary" onClick={() => setIndex(index - 1)}>
                  Anterior
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {(allDone || index === lessons.length - 1) && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-semibold text-ink">¿Listo para practicar?</p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Ahora sí: preguntas del tema. Si fallas, la explicación te lo vuelve a
              dejar claro.
            </p>
            <Button asChild className="w-full">
              <Link href={`/jugar/quiz?topic=${topic.id}`}>Practicar este tema</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/jugar/trap?topic=${topic.id}`}>Verdadero o trampa</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
