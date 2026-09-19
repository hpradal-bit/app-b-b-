"use client";

import { useMemo } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { dateKey, formatDayLabel, formatDuration } from "@/lib/format";
import { useFeeding } from "@/lib/useFeeding";

export default function HistoryPage() {
  const { sessions } = useFeeding();

  const days = useMemo(() => {
    const byDay = new Map<
      string,
      { key: string; label: string; total: number; left: number; right: number; count: number }
    >();
    for (const s of sessions) {
      const key = dateKey(s.startTime);
      const entry = byDay.get(key) ?? {
        key,
        label: formatDayLabel(s.startTime),
        total: 0,
        left: 0,
        right: 0,
        count: 0,
      };
      entry.total += s.durationSeconds;
      entry.count += 1;
      if (s.breast === "left") entry.left += s.durationSeconds;
      else entry.right += s.durationSeconds;
      byDay.set(key, entry);
    }
    return Array.from(byDay.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [sessions]);

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Historique</h1>
        <ThemeToggle />
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          L&apos;historique des tétées apparaîtra ici.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {days.map((d) => (
            <div key={d.key} className="rounded-2xl bg-surface border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">{d.label}</span>
                <span className="text-sm font-semibold tabular-nums">{formatDuration(d.total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                <span>{d.count} tétée{d.count > 1 ? "s" : ""}</span>
                <span>
                  Gauche {formatDuration(d.left)} · Droit {formatDuration(d.right)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
