"use client";

import { useCallback, useEffect, useState } from "react";
import { addBathEvent, getActiveBaby, getBathEvents, subscribe } from "./repo";
import type { BathEvent, Baby } from "./types";

export function useBath() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [events, setEvents] = useState<BathEvent[]>([]);

  const refresh = useCallback(() => {
    const b = getActiveBaby();
    setBaby(b);
    setEvents(getBathEvents(b.id));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  const log = (comment?: string) => {
    if (!baby) return;
    addBathEvent(baby.id, new Date().toISOString(), comment);
    refresh();
  };

  return { baby, events, log };
}
