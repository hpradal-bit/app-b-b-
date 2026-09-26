"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DiaperEventRow from "@/components/DiaperEventRow";
import PastDaysAccordion, { type PastDayEntry } from "@/components/PastDaysAccordion";
import ThemeToggle from "@/components/ThemeToggle";
import { groupByDay, isToday } from "@/lib/format";
import { useDiaper } from "@/lib/useDiaper";
import type { DiaperKind } from "@/lib/types";

const BUTTONS: { kind: DiaperKind; label: string; emoji: string }[] = [
  { kind: "wet", label: "Mouillée", emoji: "💧" },
  { kind: "dirty", label: "Selle", emoji: "💩" },
  { kind: "both", label: "Les deux", emoji: "💧💩" },
];

export default function DiaperPage() {
  const { baby, events, log } = useDiaper();
  const [justLogged, setJustLogged] = useState<DiaperKind | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayEvents = useMemo(
    () => events.filter((e) => isToday(e.time)).sort((a, b) => b.time.localeCompare(a.time)),
    [events]
  );

  const allDays: PastDayEntry[] = useMemo(() => {
    return groupByDay(events, (e) => e.time)
      .filter((d) => !isToday(d.items[0].time))
      .map((d) => ({
        key: d.key,
        label: d.label,
        summary: (
          <span className="text-xs text-text-muted">
            {d.items.length} change{d.items.length > 1 ? "s" : ""}
          </span>
        ),
        detail: (
          <div>
            {d.items.map((e) => (
              <DiaperEventRow key={e.id} event={e} />
            ))}
          </div>
        ),
      }));
  }, [events]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLog = (kind: DiaperKind) => {
    log(kind);
    setJustLogged(kind);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustLogged(null), 1800);
  };

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Couche</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {BUTTONS.map((b) => (
          <button
            key={b.kind}
            type="button"
            onClick={() => handleLog(b.kind)}
            className="rounded-[24px] flex flex-col items-center justify-center gap-2 py-8 border border-border transition-all active:scale-[0.96] select-none"
            style={{
              background: justLogged === b.kind ? "var(--right)" : "var(--surface)",
              color: justLogged === b.kind ? "#fff" : "var(--text)",
            }}
          >
            <span className="text-2xl">{b.emoji}</span>
            <span className="text-[13px] font-medium">{b.label}</span>
          </button>
        ))}
      </div>

      {justLogged && (
        <p className="mt-3 text-sm text-center text-accent font-medium">Couche enregistrée ✓</p>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">Changes du jour</h2>
          <span className="text-xs text-text-muted">{todayEvents.length}</span>
        </div>
        {todayEvents.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            Aucun change enregistré pour l&apos;instant.
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border px-4">
            {todayEvents.map((e) => (
              <DiaperEventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>

      {allDays.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[15px] font-semibold mb-2">Toutes les couches</h2>
          <PastDaysAccordion days={allDays} />
        </div>
      )}
    </div>
  );
}
