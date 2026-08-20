"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PlaySession } from "@/components/study/PlaySession";
import { useProgress } from "@/hooks/useProgress";
import { useStudySettings } from "@/hooks/useStudySettings";
import { courseById, getDefaultCourse } from "@/lib/study/content";
import { modeById } from "@/lib/study/games";

function PlayInner() {
  const params = useParams<{ mode: string }>();
  const search = useSearchParams();
  const topicId = search.get("topic") ?? undefined;
  const { map, ready, grade } = useProgress();
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();
  const mode = modeById(params.mode);

  if (!mode) {
    return (
      <main className="space-y-3">
        <p className="text-sm text-ink-muted">Modo no encontrado.</p>
        <Link href="/jugar" className="text-sm text-brand">
          Volver
        </Link>
      </main>
    );
  }

  return (
    <main className="animate-rise space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/jugar" className="text-xs text-ink-faint">
          ← Modos
        </Link>
        <p className="text-xs text-ink-muted">{course.shortTitle}</p>
      </div>
      {!ready ? (
        <p className="text-sm text-ink-muted">Cargando progreso…</p>
      ) : (
        <PlaySession
          course={course}
          modeId={mode.id}
          topicId={topicId}
          map={map}
          onGrade={grade}
        />
      )}
    </main>
  );
}

export default function JugarModePage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Cargando…</p>}>
      <PlayInner />
    </Suspense>
  );
}
