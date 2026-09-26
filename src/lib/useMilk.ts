"use client";

import { useCallback, useEffect, useState } from "react";
import { addMilkEntry, getActiveBaby, getMilkEntries, subscribe } from "./repo";
import type { Baby, MilkEntry } from "./types";

export function useMilk() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [entries, setEntries] = useState<MilkEntry[]>([]);

  const refresh = useCallback(() => {
    const b = getActiveBaby();
    setBaby(b);
    setEntries(getMilkEntries(b.id));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  const logPumped = (quantityMl?: number) => {
    if (!baby) return;
    addMilkEntry(baby.id, new Date().toISOString(), quantityMl);
    refresh();
  };

  return { baby, entries, logPumped };
}
