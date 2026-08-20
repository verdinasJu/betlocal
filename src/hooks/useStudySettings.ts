"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_STUDY_SETTINGS,
  loadStudySettings,
  saveStudySettings,
  type StudySettings,
} from "@/lib/study/settings";

export function useStudySettings() {
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_STUDY_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadStudySettings());
    setReady(true);
    const sync = () => setSettings(loadStudySettings());
    window.addEventListener("estudia:settings", sync);
    return () => window.removeEventListener("estudia:settings", sync);
  }, []);

  const update = (partial: Partial<StudySettings>) => {
    saveStudySettings(partial);
    setSettings(loadStudySettings());
  };

  return { settings, update, ready };
}
