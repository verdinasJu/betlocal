"use client";

/**
 * Simulacro de examen: 60 preguntas, 105 min, umbral 68%.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MOCK_EXAM,
  buildMockExam,
  scoreExam,
  saveExamResult,
  type ExamAnswer,
  type ExamResult,
} from "@/lib/study/exam";
import { isAnswerCorrect } from "@/lib/study/session";
import { useProgress } from "@/hooks/useProgress";
import type { Course, StudyCard } from "@/lib/study/types";

type Phase = "intro" | "running" | "done";

export function ExamSession({ course }: { course: Course }) {
  const { grade } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM.minutes * 60);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "ok" | "bad">("idle");

  const topicName = useMemo(() => {
    const map = new Map(course.topics.map((t) => [t.id, t.title]));
    return (id: string) => map.get(id) ?? id;
  }, [course.topics]);

  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      finish(answers, MOCK_EXAM.minutes);
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const start = () => {
    setDeck(buildMockExam(course));
    setIndex(0);
    setAnswers([]);
    setResult(null);
    setFeedback("idle");
    setSecondsLeft(MOCK_EXAM.minutes * 60);
    setPhase("running");
  };

  const finish = (finalAnswers: ExamAnswer[], usedMin?: number) => {
    const elapsed =
      usedMin ??
      Math.max(
        0,
        Math.round((MOCK_EXAM.minutes * 60 - secondsLeft) / 60)
      );
    const scored = scoreExam(finalAnswers, elapsed);
    saveExamResult(scored);
    setResult(scored);
    setPhase("done");
  };

  const submit = (answer: unknown) => {
    const card = deck[index];
    if (!card || feedback !== "idle") return;
    const ok = isAnswerCorrect(card, answer);
    grade(card.id, ok);
    const nextAnswers = [
      ...answers,
      { cardId: card.id, correct: ok, topicId: card.topicId },
    ];
    setAnswers(nextAnswers);
    setFeedback(ok ? "ok" : "bad");

    window.setTimeout(() => {
      setFeedback("idle");
      if (index + 1 >= deck.length) {
        finish(nextAnswers);
      } else {
        setIndex(index + 1);
      }
    }, 650);
  };

  if (phase === "intro") {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-xl font-semibold text-ink">Examen de prueba</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Simula el formato público del Platform Administrator:{" "}
            <strong className="text-ink">{MOCK_EXAM.questionCount} preguntas</strong>,{" "}
            <strong className="text-ink">{MOCK_EXAM.minutes} minutos</strong>, aprobado al{" "}
            <strong className="text-ink">{Math.round(MOCK_EXAM.passPct * 100)}%</strong>.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink-muted">
            <li>Escenarios al estilo del examen (práctica original de Estudia).</li>
            <li>No es un dump de FreeCram ni del examen oficial.</li>
            <li>Al terminar verás nota y desglose por tema.</li>
          </ul>
          <p className="text-xs text-ink-faint leading-relaxed">
            Banco actual: usa las preguntas mcq/tf de la app. Conviene haber
            estudiado los temas antes (Aprender → practicar).
          </p>
          <Button className="w-full" size="lg" onClick={start}>
            Empezar examen
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/jugar">Volver a modos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "done" && result) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-xl font-semibold text-ink">
            {result.passed ? "Aprobado (simulacro)" : "No llegado al corte"}
          </h2>
          <p
            className={`font-num text-3xl font-semibold ${
              result.passed ? "text-value" : "text-negative"
            }`}
          >
            {Math.round(result.pct * 100)}%
          </p>
          <p className="text-sm text-ink-muted">
            {result.correct}/{result.total} aciertos · ~{result.minutesUsed} min
          </p>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Por tema
            </p>
            {Object.entries(result.byTopic).map(([topicId, row]) => (
              <div
                key={topicId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink-muted">{topicName(topicId)}</span>
                <span className="font-num text-ink">
                  {row.correct}/{row.total}
                </span>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={start}>
            Otro examen
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/jugar/revenge">Repasar fallos (Revancha)</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Hoy</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const card = deck[index];
  if (!card) {
    return (
      <p className="text-sm text-ink-muted">
        No hay suficientes preguntas todavía. Estudia más temas y vuelve.
      </p>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-line/80 bg-surface/80 px-3 py-2 text-xs">
        <span className="font-medium text-ink">Examen</span>
        <span className="font-num text-ink-muted">
          {index + 1}/{deck.length}
        </span>
        <span
          className={`font-num ${
            secondsLeft < 300 ? "text-negative" : "text-brand"
          }`}
        >
          {mm}:{ss}
        </span>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-xs text-ink-faint">{topicName(card.topicId)}</p>
          <p className="text-base font-semibold leading-snug text-ink">
            {card.prompt}
          </p>

          {card.kind === "mcq" && card.options ? (
            <div className="space-y-2">
              {card.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  disabled={feedback !== "idle"}
                  onClick={() => submit(i)}
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-left text-sm text-ink transition hover:border-brand/40 disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : null}

          {card.kind === "tf" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={feedback !== "idle"} onClick={() => submit(true)}>
                Verdadero
              </Button>
              <Button
                disabled={feedback !== "idle"}
                variant="secondary"
                onClick={() => submit(false)}
              >
                Falso
              </Button>
            </div>
          ) : null}

          {feedback !== "idle" ? (
            <p
              className={`text-sm font-semibold ${
                feedback === "ok" ? "text-value" : "text-negative"
              }`}
            >
              {feedback === "ok" ? "Correcto" : "Incorrecto"}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
