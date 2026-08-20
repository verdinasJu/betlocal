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

/** Elige fichas según el modo de juego. */
export function pickCards(
  course: Course,
  mode: GameMode,
  map: ProgressMap,
  topicId?: string
): StudyCard[] {
  let pool = course.cards;
  if (topicId) pool = pool.filter((c) => c.topicId === topicId);

  const ids = pool.map((c) => c.id);
  const byId = new Map(pool.map((c) => [c.id, c]));

  let chosenIds: string[] = [];

  switch (mode.id as GameModeId) {
    case "revenge": {
      const weak = weakCardIds(ids, map);
      chosenIds = weak.length ? weak : dueCardIds(ids, map);
      break;
    }
    case "boss": {
      const hard = pool.filter((c) => c.difficulty >= 2);
      chosenIds = shuffle(hard.map((c) => c.id));
      break;
    }
    case "trap": {
      chosenIds = shuffle(
        pool.filter((c) => c.kind === "tf").map((c) => c.id)
      );
      break;
    }
    case "pairs": {
      chosenIds = shuffle(
        pool.filter((c) => c.kind === "pair").map((c) => c.id)
      );
      break;
    }
    case "explain": {
      chosenIds = shuffle(
        pool
          .filter((c) => c.kind === "mcq" || c.kind === "tf")
          .map((c) => c.id)
      );
      break;
    }
    case "quiz":
    case "streak":
    case "blitz":
    default: {
      const due = dueCardIds(ids, map);
      const rest = ids.filter((id) => !due.includes(id));
      chosenIds = [...shuffle(due), ...shuffle(rest)];
      break;
    }
  }

  if (!chosenIds.length) chosenIds = shuffle(ids);

  const limit =
    mode.id === "pairs" ? mode.targetCards : mode.targetCards;

  return chosenIds
    .slice(0, limit)
    .map((id) => byId.get(id)!)
    .filter(Boolean);
}

export function isAnswerCorrect(card: StudyCard, answer: unknown): boolean {
  if (card.kind === "mcq") return answer === card.answerIndex;
  if (card.kind === "tf") return answer === card.answerTrue;
  return false;
}
