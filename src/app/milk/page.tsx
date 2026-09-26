"use client";

import { useMemo, useState } from "react";
import MilkEntryRow from "@/components/MilkEntryRow";
import ThemeToggle from "@/components/ThemeToggle";
import { isToday } from "@/lib/format";
import { getMilkStatus } from "@/lib/milk";
import { useMilk } from "@/lib/useMilk";

export default function MilkPage() {
  const { baby, entries, logPumped } = useMilk();
  const [justLogged, setJustLogged] = useState(false);

  const todayEntries = useMemo(
    () => entries.filter((e) => isToday(e.pumpedAt)).sort((a, b) => b.pumpedAt.localeCompare(a.pumpedAt)),
    [entries]
  );

  const activeCount = useMemo(
    () => entries.filter((e) => !getMilkStatus(e).expired).length,
    [entries]
  );

  const handleLog = () => {
    logPumped();
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1800);
  };

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Lait tiré</h1>
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
        <span className="text-2xl">🍼</span>
        <span className="text-[15px] font-medium">
          {justLogged ? "Enregistré ✓" : "Lait tiré maintenant"}
        </span>
      </button>

      <p className="mt-4 text-[11px] text-text-muted text-center leading-relaxed px-4">
        Repères usuels : environ 4h à température ambiante, 48h au réfrigérateur une fois
        mis au frigo. En cas de doute, suis les consignes de ta maternité ou de ton pédiatre.
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">En réserve</h2>
          <span className="text-xs text-text-muted">{activeCount}</span>
        </div>
        {todayEntries.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            Aucun lait tiré enregistré aujourd&apos;hui.
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border px-4">
            {todayEntries.map((e) => (
              <MilkEntryRow key={e.id} entry={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
