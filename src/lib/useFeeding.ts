"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getActiveBaby,
  getActiveFeeding,
  getFeedingSessions,
  startFeeding,
  stopActiveFeeding,
  subscribe,
  switchFeeding,
} from "./repo";
import type { ActiveFeeding, Baby, Breast, FeedingSession } from "./types";

export function useFeeding() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [active, setActive] = useState<ActiveFeeding | null>(null);
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  // Ticks once a second purely to re-render the live chronometer; the actual
  // duration is always recomputed from real timestamps, never accumulated.
  const [, forceTick] = useState(0);

  const refresh = useCallback(() => {
    const b = getActiveBaby();
    setBaby(b);
    setActive(getActiveFeeding());
    setSessions(getFeedingSessions(b.id));
  }, []);

  useEffect(() => {
    // Initial load from localStorage (an external system, unavailable during
    // SSR) plus a subscription to future writes from repo.ts mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const unsubscribe = subscribe(refresh);
    return unsubscribe;
  }, [refresh]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const elapsedSeconds = (breast: Breast): number => {
    if (!active || active.breast !== breast) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000));
  };

  const tap = (breast: Breast) => {
    if (!baby) return;
    if (active?.breast === breast) {
      // same breast tapped again -> stop & save
      stopActiveFeeding();
    } else if (active) {
      // other breast tapped while one is running -> atomic switch, no data loss
      switchFeeding(baby.id, breast);
    } else {
      startFeeding(baby.id, breast);
    }
    refresh();
  };

  return { baby, active, sessions, elapsedSeconds, tap, refresh };
}
