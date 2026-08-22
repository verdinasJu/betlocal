"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { modeById } from "@/lib/study/games";
import { pickCards, isAnswerCorrect, isMultiSelect } from "@/lib/study/session";
import type { Course, StudyCard } from "@/lib/study/types";
import type { ProgressMap } from "@/lib/study/srs";

type Phase = "ask" | "feedback" | "done";

export function PlaySession({
  course,
  modeId,
  topicId,
  map,
  onGrade,
}: {
  course: Course;
  modeId: string;
  topicId?: string;
  map: ProgressMap;
  onGrade: (cardId: string, ok: boolean) => void;
}) {
  const mode = modeById(modeId);
  const deck = useMemo(
    () => (mode ? pickCards(course, mode, map, topicId) : []),
    // Solo al montar la partida
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [course.id, modeId, topicId]
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [lives, setLives] = useState(mode?.lives ?? null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(mode?.seconds ?? null);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [explainOpen, setExplainOpen] = useState(modeId === "explain");
  const [multiPick, setMultiPick] = useState<number[]>([]);
  const [answered, setAnswered] = useState(0);

  // Parejas
  const pairCards = useMemo(
    () => deck.filter((c) => c.kind === "pair"),
    [deck]
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [pairLock, setPairLock] = useState(false);

  const pairTiles = useMemo(() => {
    if (modeId !== "pairs") return [];
    const terms = pairCards.map((c) => ({
      key: `t:${c.id}`,
      cardId: c.id,
      label: c.term ?? "",
      side: "term" as const,
    }));
    const defs = pairCards.map((c) => ({
      key: `d:${c.id}`,
      cardId: c.id,
      label: c.definition ?? "",
      side: "def" as const,
    }));
    return [...terms, ...defs].sort(() => Math.random() - 0.5);
  }, [modeId, pairCards]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (phase === "done") return;
    if (secondsLeft <= 0) {
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, phase]);

  if (!mode) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-ink-muted">Modo desconocido.</p>
          <Button asChild variant="secondary">
            <Link href="/jugar">Volver</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!deck.length) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-ink-muted">
            No hay fichas para este modo. Prueba otro o añade contenido.
          </p>
          <Button asChild variant="secondary">
            <Link href="/jugar">Elegir modo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const card = deck[Math.min(index, deck.length - 1)] as StudyCard;

  const finishIfNeeded = (nextIndex: number, nextLives: number | null): boolean => {
    if (nextLives === 0) {
      setPhase("done");
      return true;
    }
    if (nextIndex >= deck.length) {
      setPhase("done");
      return true;
    }
    setIndex(nextIndex);
    setPhase(modeId === "explain" ? "ask" : "ask");
    setExplainOpen(modeId === "explain");
    setLastOk(null);
    setMultiPick([]);
    return false;
  };

  const submit = (answer: unknown) => {
    if (phase !== "ask") return;
    const ok = isAnswerCorrect(card, answer);
    setLastOk(ok);
    onGrade(card.id, ok);
    setAnswered((n) => n + 1);
    if (ok) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        return n;
      });
    } else {
      setStreak(0);
      if (lives !== null) {
        const nl = lives - 1;
        setLives(nl);
        if (nl <= 0) {
          setPhase("feedback");
          return;
        }
      }
    }
    setPhase("feedback");
  };

  const next = () => {
    const nl = lives;
    if (nl === 0) {
      setPhase("done");
      return;
    }
    const finished = finishIfNeeded(index + 1, nl);
    if (!finished) setPhase("ask");
  };

  const onPairTap = (key: string, cardId: string) => {
    if (pairLock || matched.has(cardId) || flipped.includes(key)) return;
    const nextFlip = [...flipped, key];
    setFlipped(nextFlip);
    if (nextFlip.length < 2) return;

    setPairLock(true);
    const [a, b] = nextFlip;
    const idA = a.slice(2);
    const idB = b.slice(2);
    const same = idA === idB && a[0] !== b[0];

    window.setTimeout(() => {
      if (same) {
        setMatched((m) => {
          const nextMatched = new Set([...m, idA]);
          if (nextMatched.size >= pairCards.length) setPhase("done");
          return nextMatched;
        });
        onGrade(idA, true);
        setScore((s) => s + 1);
        setAnswered((n) => n + 1);
        setStreak((s) => {
          const n = s + 1;
          setBestStreak((b) => Math.max(b, n));
          return n;
        });
      } else {
        setStreak(0);
        onGrade(idA, false);
        setAnswered((n) => n + 1);
      }
      setFlipped([]);
      setPairLock(false);
    }, 450);
  };

  if (phase === "done" || (modeId === "pairs" && matched.size >= pairCards.length && pairCards.length > 0)) {
    const total =
      modeId === "pairs" ? pairCards.length : Math.max(answered, deck.length);
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-xl font-semibold">Fin de partida</h2>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Aciertos" value={String(score)} />
            <Stat label="Respondidas" value={`${answered}/${total}`} />
            <Stat label="Racha máx." value={String(bestStreak)} />
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            El SRS ya actualizó las fichas. Lo fallado volverá pronto en Hoy.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/jugar/${modeId}`}>Otra vez</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Hoy</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/jugar">Otros modos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (modeId === "pairs") {
    return (
      <div className="space-y-4">
        <Hud
          modeTitle={mode.title}
          progress={`${matched.size}/${pairCards.length}`}
          lives={null}
          streak={streak}
          secondsLeft={secondsLeft}
        />
        <div className="grid grid-cols-2 gap-2">
          {pairTiles.map((tile) => {
            const isMatch = matched.has(tile.cardId);
            const isUp = flipped.includes(tile.key) || isMatch;
            return (
              <button
                key={tile.key}
                type="button"
                disabled={isMatch || pairLock}
                onClick={() => onPairTap(tile.key, tile.cardId)}
                className={`min-h-[4.5rem] rounded-xl border px-3 py-3 text-left text-sm transition ${
                  isMatch
                    ? "border-value/40 bg-value/15 text-value"
                    : isUp
                      ? "border-brand/40 bg-brand/10 text-ink"
                      : "border-line bg-surface-2 text-ink-muted"
                }`}
              >
                {isUp ? tile.label : "?"}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const topicTitle =
    course.topics.find((t) => t.id === card.topicId)?.title ?? "";

  return (
    <div className="space-y-4">
      <Hud
        modeTitle={mode.title}
        progress={`${Math.min(index + 1, deck.length)}/${deck.length}`}
        lives={lives}
        streak={streak}
        secondsLeft={secondsLeft}
      />

      {modeId === "explain" && explainOpen && phase === "ask" ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Lee esto · {topicTitle}
            </p>
            <p className="text-sm leading-relaxed text-ink">
              {card.explanation}
            </p>
            {card.sourceUrl ? (
              <a
                href={card.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand underline"
              >
                {card.sourceLabel ?? "Fuente"}
              </a>
            ) : null}
            <Button onClick={() => setExplainOpen(false)}>Ya lo tengo →</Button>
          </CardContent>
        </Card>
      ) : null}

      {!(modeId === "explain" && explainOpen && phase === "ask") ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <p className="text-xs text-ink-faint">{topicTitle}</p>
              <p className="text-base font-semibold leading-snug text-ink">
                {card.prompt}
              </p>
            </div>

            {phase === "ask" && card.kind === "mcq" && card.options ? (
              <div className="space-y-2">
                {isMultiSelect(card) ? (
                  <>
                    <p className="text-xs text-ink-muted">
                      Elige {card.answerIndices!.length} opciones
                    </p>
                    {card.options.map((opt, i) => {
                      const picked = multiPick.includes(i);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setMultiPick((prev) =>
                              picked
                                ? prev.filter((x) => x !== i)
                                : [...prev, i]
                            )
                          }
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                            picked
                              ? "border-brand bg-brand/10 text-ink"
                              : "border-line bg-surface-2 text-ink hover:border-brand/40"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <Button
                      className="w-full"
                      disabled={
                        multiPick.length !== card.answerIndices!.length
                      }
                      onClick={() => submit(multiPick)}
                    >
                      Confirmar
                    </Button>
                  </>
                ) : (
                  card.options.map((opt, i) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => submit(i)}
                      className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-left text-sm text-ink transition hover:border-brand/40"
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            ) : null}

            {phase === "ask" && card.kind === "tf" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => submit(true)}>Verdadero</Button>
                <Button variant="secondary" onClick={() => submit(false)}>
                  Trampa
                </Button>
              </div>
            ) : null}

            {phase === "ask" && card.kind === "pair" ? (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">
                  Esta ficha es de vocabulario (parejas). En este modo se salta.
                </p>
                <Button onClick={next} className="w-full">
                  Saltar
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/jugar/pairs">Abrir modo Parejas</Link>
                </Button>
              </div>
            ) : null}

            {phase === "feedback" ? (
              <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4">
                <p
                  className={`text-sm font-semibold ${
                    lastOk ? "text-value" : "text-negative"
                  }`}
                >
                  {lastOk ? "Correcto" : "Fallaste"}
                </p>
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
                <Button onClick={next} className="w-full">
                  {lives === 0 ? "Ver resultado" : "Siguiente"}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Hud({
  modeTitle,
  progress,
  lives,
  streak,
  secondsLeft,
}: {
  modeTitle: string;
  progress: string;
  lives: number | null;
  streak: number;
  secondsLeft: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-line/80 bg-surface/80 px-3 py-2 text-xs">
      <span className="font-medium text-ink">{modeTitle}</span>
      <span className="font-num text-ink-muted">{progress}</span>
      {lives !== null ? (
        <span className="text-negative">♥ {lives}</span>
      ) : null}
      <span className="text-brand">🔥 {streak}</span>
      {secondsLeft !== null ? (
        <span className="font-num text-ink">{secondsLeft}s</span>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="font-num text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
