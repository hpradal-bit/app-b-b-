"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addCryingEvent,
  getActiveBaby,
  getLastDiaperEvent,
  getLastFeedingEnd,
  getLastWakeTime,
  subscribe,
} from "./repo";
import type { Baby } from "./types";

export function useCryingContext() {
  const [baby, setBaby] = useState<Baby | null>(null);

  const refresh = useCallback(() => {
    setBaby(getActiveBaby());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  // Returned as a function (not a computed value) so the impure Date.now()
  // read happens in the caller's render, matching useFeeding/useSleep.
  const getContext = () => {
    if (!baby) {
      return { minutesSinceLastFeeding: null, minutesSinceLastDiaper: null, minutesAwake: 0 };
    }
    const lastFeeding = getLastFeedingEnd(baby.id);
    const lastDiaper = getLastDiaperEvent(baby.id);
    const lastWake = getLastWakeTime(baby.id);
    const now = Date.now();
    return {
      minutesSinceLastFeeding: lastFeeding
        ? Math.floor((now - new Date(lastFeeding).getTime()) / 60000)
        : null,
      minutesSinceLastDiaper: lastDiaper
        ? Math.floor((now - new Date(lastDiaper.time).getTime()) / 60000)
        : null,
      minutesAwake: lastWake ? Math.max(0, Math.floor((now - new Date(lastWake).getTime()) / 60000)) : 0,
    };
  };

  const logEpisode = (causes: string[]) => {
    if (!baby) return;
    addCryingEvent(baby.id, causes);
  };

  return { baby, getContext, logEpisode };
}
