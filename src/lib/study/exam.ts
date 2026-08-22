import type { Course, StudyCard } from "@/lib/study/types";

/**
 * Simulacro al formato público del Platform Administrator:
 * 60 preguntas, 105 minutos, aprobado ~68% (versión EN del exam guide).
 *
 * El contenido es práctica ORIGINAL de la app, no dumps.
 */

export const MOCK_EXAM = {
  questionCount: 60,
  minutes: 105,
  /** Umbral oficial habitual en inglés. */
  passPct: 0.68,
} as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Arma un examen equilibrado por tema (prioridad mcq).
 * Si no hay 60 mcq, completa con tf.
 */
export function buildMockExam(course: Course): StudyCard[] {
  const mcq = course.cards.filter((c) => c.kind === "mcq");
  const tf = course.cards.filter((c) => c.kind === "tf");

  // Peso por dificultad: más preguntas difíciles en el simulacro.
  const weightedMcq: StudyCard[] = [];
  for (const card of mcq) {
    const copies = card.difficulty >= 3 ? 4 : card.difficulty === 2 ? 2 : 1;
    for (let i = 0; i < copies; i++) weightedMcq.push(card);
  }

  const byTopic = new Map<string, StudyCard[]>();
  for (const card of weightedMcq) {
    const list = byTopic.get(card.topicId) ?? [];
    list.push(card);
    byTopic.set(card.topicId, list);
  }

  const topics = [...byTopic.keys()];
  const picked: StudyCard[] = [];
  const used = new Set<string>();

  // Reparto round-robin para no vaciar un solo tema.
  let guard = 0;
  while (picked.length < MOCK_EXAM.questionCount && guard < 5000) {
    guard += 1;
    let added = false;
    for (const topicId of shuffle(topics)) {
      if (picked.length >= MOCK_EXAM.questionCount) break;
      const pool = shuffle(byTopic.get(topicId) ?? []).filter(
        (c) => !used.has(c.id)
      );
      if (!pool.length) continue;
      const card = pool[0];
      used.add(card.id);
      picked.push(card);
      added = true;
    }
    if (!added) break;
  }

  if (picked.length < MOCK_EXAM.questionCount) {
    for (const card of shuffle(tf.filter((c) => c.difficulty >= 2))) {
      if (picked.length >= MOCK_EXAM.questionCount) break;
      if (used.has(card.id)) continue;
      used.add(card.id);
      picked.push(card);
    }
  }

  if (picked.length < MOCK_EXAM.questionCount) {
    for (const card of shuffle(tf)) {
      if (picked.length >= MOCK_EXAM.questionCount) break;
      if (used.has(card.id)) continue;
      used.add(card.id);
      picked.push(card);
    }
  }

  // Si aún faltan (banco pequeño), reutiliza mcq barajadas.
  if (picked.length < MOCK_EXAM.questionCount) {
    const refill = shuffle(mcq);
    let i = 0;
    while (picked.length < MOCK_EXAM.questionCount && refill.length) {
      picked.push(refill[i % refill.length]);
      i += 1;
      if (i > refill.length * 3) break;
    }
  }

  return shuffle(picked).slice(0, MOCK_EXAM.questionCount);
}

export type ExamAnswer = {
  cardId: string;
  correct: boolean;
  topicId: string;
};

export type ExamResult = {
  at: string;
  total: number;
  correct: number;
  pct: number;
  passed: boolean;
  minutesUsed: number;
  byTopic: Record<string, { correct: number; total: number }>;
};

const RESULT_KEY = "estudia.exam.results.v1";

export function saveExamResult(result: ExamResult) {
  if (typeof window === "undefined") return;
  const prev = loadExamResults();
  window.localStorage.setItem(
    RESULT_KEY,
    JSON.stringify([result, ...prev].slice(0, 10))
  );
  window.dispatchEvent(new Event("estudia:exam"));
}

export function loadExamResults(): ExamResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as ExamResult[]) : [];
  } catch {
    return [];
  }
}

export function scoreExam(
  answers: ExamAnswer[],
  minutesUsed: number
): ExamResult {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length || 1;
  const pct = correct / total;
  const byTopic: ExamResult["byTopic"] = {};
  for (const a of answers) {
    const row = byTopic[a.topicId] ?? { correct: 0, total: 0 };
    row.total += 1;
    if (a.correct) row.correct += 1;
    byTopic[a.topicId] = row;
  }
  return {
    at: new Date().toISOString(),
    total: answers.length,
    correct,
    pct,
    passed: pct >= MOCK_EXAM.passPct,
    minutesUsed,
    byTopic,
  };
}
