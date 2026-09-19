"use client";

import { useCallback, useEffect, useState } from "react";
import { addDiaperEvent, getActiveBaby, getDiaperEvents, subscribe } from "./repo";
import type { Baby, DiaperEvent, DiaperKind } from "./types";

export function useDiaper() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [events, setEvents] = useState<DiaperEvent[]>([]);

  const refresh = useCallback(() => {
    const b = getActiveBaby();
    setBaby(b);
    setEvents(getDiaperEvents(b.id));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  const log = (kind: DiaperKind) => {
    if (!baby) return;
    addDiaperEvent(baby.id, kind, new Date().toISOString());
    refresh();
  };

  return { baby, events, log };
}
