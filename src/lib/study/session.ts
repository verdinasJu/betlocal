import type { Course, GameMode, GameModeId, StudyCard } from "@/lib/study/types";
import { dueCardIds, weakCardIds, type ProgressMap } from "@/lib/study/srs";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Modos de pregunta clásica: nunca deben meter fichas `pair`. */
function answerable(pool: StudyCard[]): StudyCard[] {
  return pool.filter((c) => c.kind === "mcq" || c.kind === "tf");
}

/** Elige fichas según el modo de juego. */
export function pickCards(
  course: Course,
  mode: GameMode,
  map: ProgressMap,
  topicId?: string
): StudyCard[] {
  let pool = course.cards;
  if (topicId) pool = pool.filter((c) => c.topicId === topicId);

  let working: StudyCard[] = pool;

  switch (mode.id as GameModeId) {
    case "pairs":
      working = pool.filter((c) => c.kind === "pair");
      break;
    case "trap":
      working = pool.filter((c) => c.kind === "tf");
      break;
    case "boss":
      working = answerable(pool).filter((c) => c.difficulty >= 2);
      if (!working.length) working = answerable(pool);
      break;
    case "revenge": {
      const base = answerable(pool);
      const ids = base.map((c) => c.id);
      const weak = weakCardIds(ids, map);
      const due = dueCardIds(ids, map);
      const pick = weak.length ? weak : due.length ? due : ids;
      working = base.filter((c) => pick.includes(c.id));
      break;
    }
    case "explain":
    case "quiz":
    case "streak":
    case "blitz":
    default:
      working = answerable(pool);
      break;
  }

  if (!working.length) {
    // Último recurso: nunca devolver `pair` fuera del modo Parejas.
    working =
      mode.id === "pairs"
        ? pool.filter((c) => c.kind === "pair")
        : answerable(pool);
  }

  const ids = working.map((c) => c.id);
  const byId = new Map(working.map((c) => [c.id, c]));

  let ordered = shuffle(ids);

  // Priorizar fichas más difíciles en modos de examen/práctica.
  if (
    mode.id === "quiz" ||
    mode.id === "boss" ||
    mode.id === "streak"
  ) {
    ordered = shuffle(ids).sort((a, b) => {
      const da = byId.get(a)?.difficulty ?? 1;
      const db = byId.get(b)?.difficulty ?? 1;
      return db - da;
    });
  }

  if (
    mode.id === "quiz" ||
    mode.id === "streak" ||
    mode.id === "blitz" ||
    mode.id === "explain"
  ) {
    if (!topicId) {
      const due = dueCardIds(ids, map);
      const rest = ids.filter((id) => !due.includes(id));
      ordered = [...shuffle(due), ...shuffle(rest)];
    }
  }

  return ordered
    .slice(0, mode.targetCards)
    .map((id) => byId.get(id)!)
    .filter(Boolean);
}

function sameIndices(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

export function isMultiSelect(card: StudyCard): boolean {
  return (
    card.kind === "mcq" &&
    Array.isArray(card.answerIndices) &&
    card.answerIndices.length > 1
  );
}

export function isAnswerCorrect(card: StudyCard, answer: unknown): boolean {
  if (card.kind === "mcq") {
    if (isMultiSelect(card)) {
      return (
        Array.isArray(answer) &&
        sameIndices(answer as number[], card.answerIndices!)
      );
    }
    return answer === card.answerIndex;
  }
  if (card.kind === "tf") return answer === card.answerTrue;
  return false;
}
