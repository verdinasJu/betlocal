"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadProgress,
  saveProgress,
  reviewCard,
  todayReviewCount,
  type ProgressMap,
} from "@/lib/study/srs";

export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({});
  const [dailyCount, setDailyCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMap(loadProgress());
    setDailyCount(todayReviewCount());
    setReady(true);
    const sync = () => {
      setMap(loadProgress());
      setDailyCount(todayReviewCount());
    };
    window.addEventListener("estudia:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("estudia:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const grade = useCallback((cardId: string, ok: boolean) => {
    setMap((prev) => {
      const next = reviewCard(prev, cardId, ok);
      saveProgress(next);
      setDailyCount(todayReviewCount());
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    saveProgress({});
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("estudia.daily.v1");
    }
    setMap({});
    setDailyCount(0);
  }, []);

  return { map, ready, grade, reset, dailyCount };
}
