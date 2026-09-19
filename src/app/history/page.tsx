"use client";

import { useMemo } from "react";
import FeedingHistoryChart, { type FeedingDayPoint } from "@/components/FeedingHistoryChart";
import ThemeToggle from "@/components/ThemeToggle";
import { dateKey, formatDayLabel, formatDuration } from "@/lib/format";
import { useFeeding } from "@/lib/useFeeding";
import { useSleep } from "@/lib/useSleep";
import { useDiaper } from "@/lib/useDiaper";

interface DayStat {
  key: string;
  label: string;
  feedingTotal: number;
  left: number;
  right: number;
  unknown: number;
  feedingCount: number;
  sleepTotal: number;
  sleepCount: number;
  diaperCount: number;
  diaperWet: number;
  diaperDirty: number;
}

const CHART_DAYS = 14;

function shortDayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

export default function HistoryPage() {
  const { sessions } = useFeeding();
  const { sessions: sleepSessions } = useSleep();
  const { events: diaperEvents } = useDiaper();

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
        unknown: 0,
        feedingCount: 0,
        sleepTotal: 0,
        sleepCount: 0,
        diaperCount: 0,
        diaperWet: 0,
        diaperDirty: 0,
      };
      byDay.set(key, created);
      return created;
    };

    for (const s of sessions) {
      const entry = get(s.startTime);
      entry.feedingTotal += s.durationSeconds;
      entry.feedingCount += 1;
      if (s.breast === "left") entry.left += s.durationSeconds;
      else if (s.breast === "right") entry.right += s.durationSeconds;
      else entry.unknown += s.durationSeconds;
    }
    for (const s of sleepSessions) {
      const entry = get(s.startTime);
      entry.sleepTotal += s.durationSeconds;
      entry.sleepCount += 1;
    }
    for (const e of diaperEvents) {
      const entry = get(e.time);
      entry.diaperCount += 1;
      if (e.kind === "wet" || e.kind === "both") entry.diaperWet += 1;
      if (e.kind === "dirty" || e.kind === "both") entry.diaperDirty += 1;
    }

    return Array.from(byDay.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [sessions, sleepSessions, diaperEvents]);

  // Continuous last-N-days axis for the chart/table, even on days with no feeding logged,
  // so gaps in the routine are visible rather than silently skipped.
  const chartDays: FeedingDayPoint[] = useMemo(() => {
    const byKey = new Map(days.map((d) => [d.key, d]));
    const points: FeedingDayPoint[] = [];
    const today = new Date();
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d.toISOString());
      const stat = byKey.get(key);
      points.push({
        key,
        shortLabel: shortDayLabel(key),
        fullLabel: stat?.label ?? formatDayLabel(d.toISOString()),
        left: stat?.left ?? 0,
        right: stat?.right ?? 0,
        unknown: stat?.unknown ?? 0,
      });
    }
    return points;
  }, [days]);

  const hasFeedingHistory = chartDays.some((d) => d.left + d.right + d.unknown > 0);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Historique</h1>
        <ThemeToggle />
      </div>

      {hasFeedingHistory && (
        <section className="mb-6">
          <h2 className="text-[15px] font-semibold mb-3">Tétées — 14 derniers jours</h2>
          <div className="rounded-2xl bg-surface border border-border p-4">
            <FeedingHistoryChart days={chartDays} />
          </div>

          <details className="mt-3">
            <summary className="text-xs text-text-muted cursor-pointer list-none underline underline-offset-2">
              Voir en tableau
            </summary>
            <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface text-text-muted text-left">
                    <th className="px-3 py-2 font-medium">Jour</th>
                    <th className="px-3 py-2 font-medium text-right">Droit</th>
                    <th className="px-3 py-2 font-medium text-right">Gauche</th>
                    <th className="px-3 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chartDays].reverse().map((d) => (
                    <tr key={d.key} className="border-t border-border">
                      <td className="px-3 py-2">{d.shortLabel}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {d.right > 0 ? formatDuration(d.right) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {d.left > 0 ? formatDuration(d.left) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatDuration(d.left + d.right + d.unknown)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}

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
                    🍼 {d.feedingCount} tétée{d.feedingCount > 1 ? "s" : ""}
                    {d.left + d.right > 0
                      ? ` · Gauche ${formatDuration(d.left)} · Droit ${formatDuration(d.right)}`
                      : ""}
                    {d.unknown > 0 ? ` · Non précisé ${formatDuration(d.unknown)}` : ""}
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

              {d.diaperCount > 0 && (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    💧 {d.diaperWet} mouillée{d.diaperWet > 1 ? "s" : ""} · 💩 {d.diaperDirty} selle
                    {d.diaperDirty > 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{d.diaperCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
