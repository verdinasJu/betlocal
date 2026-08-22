"use client";

/**
 * Simulacro de examen: 60 preguntas, 105 min, umbral 68%.
 * Navegación libre, explicación bajo demando y finalizar cuando quieras.
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
import { isAnswerCorrect, isMultiSelect } from "@/lib/study/session";
import { useProgress } from "@/hooks/useProgress";
import type { Course, StudyCard } from "@/lib/study/types";

type Phase = "intro" | "running" | "done";

type QuestionResponse = {
  answer: unknown;
  correct: boolean;
};

export function ExamSession({ course }: { course: Course }) {
  const { grade } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, QuestionResponse>>(
    {}
  );
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM.minutes * 60);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [multiPick, setMultiPick] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const topicName = useMemo(() => {
    const map = new Map(course.topics.map((t) => [t.id, t.title]));
    return (id: string) => map.get(id) ?? id;
  }, [course.topics]);

  const answeredCount = Object.keys(responses).length;

  const buildFinalAnswers = (): ExamAnswer[] =>
    deck.map((card, i) => {
      const r = responses[i];
      return {
        cardId: card.id,
        correct: r?.correct ?? false,
        topicId: card.topicId,
      };
    });

  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      finish(buildFinalAnswers(), MOCK_EXAM.minutes);
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const start = () => {
    setDeck(buildMockExam(course));
    setIndex(0);
    setResponses({});
    setResult(null);
    setMultiPick([]);
    setShowExplanation(false);
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
    if (!card) return;
    const ok = isAnswerCorrect(card, answer);
    grade(card.id, ok);
    setResponses((prev) => ({
      ...prev,
      [index]: { answer, correct: ok },
    }));
    setShowExplanation(false);
  };

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= deck.length) return;
    setIndex(nextIndex);
    setShowExplanation(false);
    const saved = responses[nextIndex];
    if (
      saved &&
      deck[nextIndex]?.kind === "mcq" &&
      isMultiSelect(deck[nextIndex])
    ) {
      setMultiPick(Array.isArray(saved.answer) ? (saved.answer as number[]) : []);
    } else {
      setMultiPick([]);
    }
  };

  const requestFinish = () => {
    const pending = deck.length - answeredCount;
    const msg =
      pending > 0
        ? `Te faltan ${pending} preguntas sin responder. ¿Finalizar igualmente? Las no respondidas contarán como fallo.`
        : "¿Finalizar el examen y ver tu nota?";
    if (window.confirm(msg)) {
      finish(buildFinalAnswers());
    }
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
            <li>Puedes volver atrás y cambiar respuestas.</li>
            <li>Tras responder, pulsa «Ver explicación» para aprender.</li>
            <li>Finaliza cuando quieras con el botón correspondiente.</li>
          </ul>
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

  const current = responses[index];
  const answered = Boolean(current);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/80 bg-surface/80 px-3 py-2 text-xs">
        <span className="font-medium text-ink">Examen</span>
        <span className="font-num text-ink-muted">
          {index + 1}/{deck.length}
        </span>
        <span className="font-num text-ink-faint">
          {answeredCount} respondidas
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
              {isMultiSelect(card) ? (
                <>
                  <p className="text-xs text-ink-muted">
                    Elige {card.answerIndices!.length} opciones
                  </p>
                  {card.options.map((opt, i) => (
                    <OptionButton
                      key={opt}
                      label={opt}
                      state={optionState(card, i, current, multiPick.includes(i))}
                      disabled={answered}
                      onClick={() =>
                        setMultiPick((prev) =>
                          prev.includes(i)
                            ? prev.filter((x) => x !== i)
                            : [...prev, i]
                        )
                      }
                    />
                  ))}
                  {!answered ? (
                    <Button
                      className="w-full"
                      disabled={
                        multiPick.length !== card.answerIndices!.length
                      }
                      onClick={() => submit(multiPick)}
                    >
                      Confirmar respuesta
                    </Button>
                  ) : null}
                </>
              ) : (
                card.options.map((opt, i) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    state={optionState(card, i, current, current?.answer === i)}
                    disabled={answered}
                    onClick={() => submit(i)}
                  />
                ))
              )}
            </div>
          ) : null}

          {card.kind === "tf" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={answered}
                variant={current?.answer === true ? "default" : "secondary"}
                className={
                  answered
                    ? current.answer === true
                      ? current.correct
                        ? "border-value bg-value/20"
                        : "border-negative bg-negative/20"
                      : card.answerTrue === true
                        ? "border-value/50 bg-value/10"
                        : ""
                    : ""
                }
                onClick={() => submit(true)}
              >
                Verdadero
              </Button>
              <Button
                disabled={answered}
                variant={current?.answer === false ? "default" : "secondary"}
                className={
                  answered
                    ? current.answer === false
                      ? current.correct
                        ? "border-value bg-value/20"
                        : "border-negative bg-negative/20"
                      : card.answerTrue === false
                        ? "border-value/50 bg-value/10"
                        : ""
                    : ""
                }
                onClick={() => submit(false)}
              >
                Falso
              </Button>
            </div>
          ) : null}

          {answered ? (
            <p
              className={`text-sm font-semibold ${
                current!.correct ? "text-value" : "text-negative"
              }`}
            >
              {current!.correct ? "Correcto" : "Incorrecto"}
            </p>
          ) : null}

          {answered ? (
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowExplanation((v) => !v)}
              >
                {showExplanation ? "Ocultar explicación" : "Ver explicación"}
              </Button>
              {showExplanation ? (
                <div className="space-y-2 rounded-xl border border-line bg-surface-2 p-4">
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {card.explanation}
                  </p>
                  {card.sourceUrl ? (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs text-brand underline"
                    >
                      {card.sourceLabel ?? "Ver fuente"}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="flex-1 min-w-[7rem]"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          ← Anterior
        </Button>
        <Button
          variant="secondary"
          className="flex-1 min-w-[7rem]"
          disabled={index >= deck.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Siguiente →
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full border-negative/40 text-negative hover:bg-negative/10"
        onClick={requestFinish}
      >
        Finalizar examen
      </Button>
    </div>
  );
}

type OptionVisual = "neutral" | "picked" | "correct" | "wrong";

function optionState(
  card: StudyCard,
  optionIndex: number,
  response: QuestionResponse | undefined,
  isPickedNow: boolean
): OptionVisual {
  if (!response) {
    return isPickedNow ? "picked" : "neutral";
  }

  const isCorrectOption =
    card.kind === "mcq" &&
    (isMultiSelect(card)
      ? card.answerIndices!.includes(optionIndex)
      : card.answerIndex === optionIndex);

  const userPicked =
    card.kind === "mcq" &&
    (isMultiSelect(card)
      ? Array.isArray(response.answer) &&
        (response.answer as number[]).includes(optionIndex)
      : response.answer === optionIndex);

  if (userPicked && isCorrectOption) return "correct";
  if (userPicked && !isCorrectOption) return "wrong";
  if (!userPicked && isCorrectOption) return "correct";
  return "neutral";
}

function OptionButton({
  label,
  state,
  disabled,
  onClick,
}: {
  label: string;
  state: OptionVisual;
  disabled: boolean;
  onClick: () => void;
}) {
  const cls =
    state === "correct"
      ? "border-value/50 bg-value/15 text-value"
      : state === "wrong"
        ? "border-negative/50 bg-negative/15 text-negative"
        : state === "picked"
          ? "border-brand bg-brand/10 text-ink"
          : "border-line bg-surface-2 text-ink hover:border-brand/40";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition disabled:opacity-80 ${cls}`}
    >
      {label}
    </button>
  );
}
