"use client";

import { useMemo, useState } from "react";
import BathEventRow from "@/components/BathEventRow";
import PastDaysAccordion, { type PastDayEntry } from "@/components/PastDaysAccordion";
import ThemeToggle from "@/components/ThemeToggle";
import { groupByDay, isToday } from "@/lib/format";
import { useBath } from "@/lib/useBath";

export default function BathPage() {
  const { baby, events, log } = useBath();
  const [justLogged, setJustLogged] = useState(false);

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
            {d.items.length} bain{d.items.length > 1 ? "s" : ""}
          </span>
        ),
        detail: (
          <div>
            {d.items.map((e) => (
              <BathEventRow key={e.id} event={e} />
            ))}
          </div>
        ),
      }));
  }, [events]);

  const handleLog = () => {
    log();
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1800);
  };

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Bain</h1>
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={handleLog}
        className="w-full rounded-[28px] flex flex-col items-center justify-center gap-2 py-10 border border-border transition-all active:scale-[0.98] select-none"
        style={{
          background: justLogged ? "var(--accent)" : "var(--surface)",
          color: justLogged ? "#fff" : "var(--text)",
        }}
      >
        <span className="text-2xl">🛁</span>
        <span className="text-[15px] font-medium">
          {justLogged ? "Enregistré ✓" : "Bain donné maintenant"}
        </span>
      </button>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">Bains du jour</h2>
          <span className="text-xs text-text-muted">{todayEvents.length}</span>
        </div>
        {todayEvents.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            Aucun bain enregistré aujourd&apos;hui.
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border px-4">
            {todayEvents.map((e) => (
              <BathEventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>

      {allDays.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[15px] font-semibold mb-2">Tous les bains</h2>
          <PastDaysAccordion days={allDays} />
        </div>
      )}
    </div>
  );
}
