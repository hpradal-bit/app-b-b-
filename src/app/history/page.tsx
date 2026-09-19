"use client";

import { useMemo } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { dateKey, formatDayLabel, formatDuration } from "@/lib/format";
import { useFeeding } from "@/lib/useFeeding";
import { useSleep } from "@/lib/useSleep";

interface DayStat {
  key: string;
  label: string;
  feedingTotal: number;
  left: number;
  right: number;
  feedingCount: number;
  sleepTotal: number;
  sleepCount: number;
}

export default function HistoryPage() {
  const { sessions } = useFeeding();
  const { sessions: sleepSessions } = useSleep();

  const days = useMemo(() => {
    const byDay = new Map<string, DayStat>();
    const get = (iso: string): DayStat => {
      const key = dateKey(iso);
      const existing = byDay.get(key);
      if (existing) return existing;
      const created: DayStat = {
        key,
        label: formatDayLabel(iso),
        feedingTotal: 0,
        left: 0,
        right: 0,
        feedingCount: 0,
        sleepTotal: 0,
        sleepCount: 0,
      };
      byDay.set(key, created);
      return created;
    };

    for (const s of sessions) {
      const entry = get(s.startTime);
      entry.feedingTotal += s.durationSeconds;
      entry.feedingCount += 1;
      if (s.breast === "left") entry.left += s.durationSeconds;
      else entry.right += s.durationSeconds;
    }
    for (const s of sleepSessions) {
      const entry = get(s.startTime);
      entry.sleepTotal += s.durationSeconds;
      entry.sleepCount += 1;
    }

    return Array.from(byDay.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [sessions, sleepSessions]);

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Historique</h1>
        <ThemeToggle />
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          L&apos;historique des journées apparaîtra ici.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {days.map((d) => (
            <div key={d.key} className="rounded-2xl bg-surface border border-border p-4">
              <span className="text-[15px] font-medium">{d.label}</span>

              {d.feedingCount > 0 && (
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    🍼 {d.feedingCount} tétée{d.feedingCount > 1 ? "s" : ""} · Gauche{" "}
                    {formatDuration(d.left)} · Droit {formatDuration(d.right)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatDuration(d.feedingTotal)}
                  </span>
                </div>
              )}

              {d.sleepCount > 0 && (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    😴 {d.sleepCount} sommeil{d.sleepCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatDuration(d.sleepTotal)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
