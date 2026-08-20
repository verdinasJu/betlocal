"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadLessons,
  markLessonRead,
  saveLessons,
  type LessonMap,
} from "@/lib/study/lessons";

export function useLessons() {
  const [map, setMap] = useState<LessonMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMap(loadLessons());
    setReady(true);
    const sync = () => setMap(loadLessons());
    window.addEventListener("estudia:lessons", sync);
    return () => window.removeEventListener("estudia:lessons", sync);
  }, []);

  const mark = useCallback((lessonId: string) => {
    markLessonRead(lessonId);
    setMap(loadLessons());
  }, []);

  const reset = useCallback(() => {
    saveLessons({});
    setMap({});
  }, []);

  return { map, ready, mark, reset };
}
