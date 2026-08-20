"use client";

/**
 * Preferencias ligeras de Estudia (meta diaria, curso activo).
 */

export type StudySettings = {
  dailyGoal: number;
  activeCourseId: string;
};

const KEY = "estudia.settings.v1";

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  dailyGoal: 15,
  activeCourseId: "sf-admin-es",
};

export function loadStudySettings(): StudySettings {
  if (typeof window === "undefined") return DEFAULT_STUDY_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STUDY_SETTINGS;
    return { ...DEFAULT_STUDY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STUDY_SETTINGS;
  }
}

export function saveStudySettings(partial: Partial<StudySettings>) {
  if (typeof window === "undefined") return;
  const next = { ...loadStudySettings(), ...partial };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("estudia:settings"));
}
