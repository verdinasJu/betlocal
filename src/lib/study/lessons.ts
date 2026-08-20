"use client";

/**
 * Lecciones leídas (conceptos). Separado del SRS de preguntas.
 */

const KEY = "estudia.lessons.v1";

export type LessonMap = Record<string, boolean>;

export function loadLessons(): LessonMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LessonMap) : {};
  } catch {
    return {};
  }
}

export function saveLessons(map: LessonMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("estudia:lessons"));
}

export function markLessonRead(lessonId: string) {
  const map = loadLessons();
  map[lessonId] = true;
  saveLessons(map);
}

export function topicLessonsDone(
  lessonIds: string[],
  map: LessonMap
): { done: number; total: number } {
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => map[id]).length;
  return { done, total };
}
