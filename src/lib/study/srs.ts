/**
 * SRS ligero estilo SM-2.
 *
 * Guarda por ficha: facilidad, intervalo en días, próxima fecha, aciertos/fallos.
 * Lo importante no es clavar la fórmula académica, sino que lo fallado vuelva
 * pronto y lo acertado se alargue.
 */

export type CardProgress = {
  ease: number;
  intervalDays: number;
  dueAt: string; // ISO date (día)
  reps: number;
  lapses: number;
  correct: number;
  wrong: number;
  lastResult?: "good" | "again";
};

export type ProgressMap = Record<string, CardProgress>;

const KEY = "estudia.progress.v1";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDay: string, days: number): string {
  const d = new Date(`${isoDay}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function freshProgress(): CardProgress {
  return {
    ease: 2.3,
    intervalDays: 0,
    dueAt: todayIso(),
    reps: 0,
    lapses: 0,
    correct: 0,
    wrong: 0,
  };
}

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("estudia:progress"));
}

const DAILY_KEY = "estudia.daily.v1";

export function bumpDailyReviews() {
  if (typeof window === "undefined") return;
  const day = todayIso();
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    const parsed = raw ? (JSON.parse(raw) as { day: string; count: number }) : null;
    const count = parsed?.day === day ? parsed.count + 1 : 1;
    window.localStorage.setItem(DAILY_KEY, JSON.stringify({ day, count }));
  } catch {
    window.localStorage.setItem(DAILY_KEY, JSON.stringify({ day, count: 1 }));
  }
}

export function todayReviewCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { day: string; count: number };
    return parsed.day === todayIso() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

/** Marca acierto o fallo y recalcula la próxima fecha. */
export function reviewCard(
  map: ProgressMap,
  cardId: string,
  ok: boolean
): ProgressMap {
  const prev = map[cardId] ?? freshProgress();
  const next: CardProgress = { ...prev };

  if (ok) {
    next.correct += 1;
    next.reps += 1;
    next.lastResult = "good";
    if (next.reps === 1) next.intervalDays = 1;
    else if (next.reps === 2) next.intervalDays = 3;
    else {
      next.intervalDays = Math.max(
        1,
        Math.round(next.intervalDays * next.ease)
      );
    }
    next.ease = Math.min(3.0, next.ease + 0.05);
  } else {
    next.wrong += 1;
    next.lapses += 1;
    next.reps = 0;
    next.lastResult = "again";
    next.intervalDays = 0;
    next.ease = Math.max(1.3, next.ease - 0.2);
  }

  next.dueAt = addDays(todayIso(), next.intervalDays);
  bumpDailyReviews();
  return { ...map, [cardId]: next };
}

export function isDue(p: CardProgress | undefined, day = todayIso()): boolean {
  if (!p) return true;
  return p.dueAt <= day;
}

export function dueCardIds(
  cardIds: string[],
  map: ProgressMap,
  day = todayIso()
): string[] {
  return cardIds.filter((id) => isDue(map[id], day));
}

export function weakCardIds(cardIds: string[], map: ProgressMap): string[] {
  return cardIds.filter((id) => {
    const p = map[id];
    return p && p.wrong > p.correct;
  });
}

export function statsFor(cardIds: string[], map: ProgressMap) {
  let seen = 0;
  let correct = 0;
  let wrong = 0;
  let due = 0;
  for (const id of cardIds) {
    const p = map[id];
    if (!p) {
      due += 1;
      continue;
    }
    if (p.correct + p.wrong > 0) seen += 1;
    correct += p.correct;
    wrong += p.wrong;
    if (isDue(p)) due += 1;
  }
  const attempts = correct + wrong;
  return {
    seen,
    due,
    accuracy: attempts ? correct / attempts : 0,
    attempts,
  };
}
