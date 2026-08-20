"use client";

import Link from "next/link";
import { ExamSession } from "@/components/study/ExamSession";
import { useStudySettings } from "@/hooks/useStudySettings";
import { courseById, getDefaultCourse } from "@/lib/study/content";
import { loadExamResults } from "@/lib/study/exam";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ExamenPage() {
  const { settings } = useStudySettings();
  const course = courseById(settings.activeCourseId) ?? getDefaultCourse();
  const [history, setHistory] = useState(loadExamResults());

  useEffect(() => {
    const sync = () => setHistory(loadExamResults());
    window.addEventListener("estudia:exam", sync);
    return () => window.removeEventListener("estudia:exam", sync);
  }, []);

  return (
    <main className="animate-rise space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/jugar" className="text-xs text-ink-faint">
          ← Jugar
        </Link>
        <p className="text-xs text-ink-muted">{course.shortTitle}</p>
      </div>

      <ExamSession course={course} />

      {history.length ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Últimos simulacros
            </p>
            {history.slice(0, 5).map((r) => (
              <div
                key={r.at}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink-muted">
                  {new Date(r.at).toLocaleDateString("es-ES")}
                </span>
                <span
                  className={`font-num font-semibold ${
                    r.passed ? "text-value" : "text-negative"
                  }`}
                >
                  {Math.round(r.pct * 100)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
