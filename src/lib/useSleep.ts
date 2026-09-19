"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getActiveBaby,
  getActiveSleep,
  getLastWakeTime,
  getSleepSessions,
  startSleep,
  stopActiveSleep,
  subscribe,
} from "./repo";
import type { ActiveSleep, Baby, SleepSession } from "./types";

export function useSleep() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [active, setActive] = useState<ActiveSleep | null>(null);
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [, forceTick] = useState(0);

  const refresh = useCallback(() => {
    const b = getActiveBaby();
    setBaby(b);
    setActive(getActiveSleep());
    setSessions(getSleepSessions(b.id));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Returned as functions (not computed values) so the impure Date.now()
  // read happens in the caller's render, not this hook's — same pattern as
  // useFeeding's elapsedSeconds.
  const elapsedSeconds = (): number => {
    if (!active) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000));
  };

  const lastWakeTime = (): string | null => {
    if (active || !baby) return null;
    return getLastWakeTime(baby.id);
  };

  const minutesAwake = (): number => {
    const lastWake = lastWakeTime();
    if (!lastWake) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(lastWake).getTime()) / 60000));
  };

  const toggle = () => {
    if (!baby) return;
    if (active) stopActiveSleep();
    else startSleep(baby.id);
    refresh();
  };

  return { baby, active, sessions, elapsedSeconds, minutesAwake, lastWakeTime, toggle };
}
