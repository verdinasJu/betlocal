"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type RiskSettings,
} from "@/lib/settings";

export function useSettings() {
  const [settings, setSettings] = useState<RiskSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);

    const sync = () => setSettings(loadSettings());
    window.addEventListener("betlocal:settings", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("betlocal:settings", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<RiskSettings>) => {
    saveSettings(patch);
    setSettings(loadSettings());
  }, []);

  return { settings, update, ready };
}
