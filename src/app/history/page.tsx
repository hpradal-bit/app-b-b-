"use client";

import { useState, useMemo } from "react";
import DiaperEventRow from "@/components/DiaperEventRow";
import FeedingGroupList from "@/components/FeedingGroupList";
import FeedingHistoryChart, { type FeedingDayPoint } from "@/components/FeedingHistoryChart";
import SleepSessionRow from "@/components/SleepSessionRow";
import ThemeToggle from "@/components/ThemeToggle";
import { dateKey, formatDayLabel, formatDuration } from "@/lib/format";
import { groupFeedingSessions } from "@/lib/feedingGrouping";
import { importSeedFeedingHistory } from "@/lib/repo";
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
  const { baby, sessions } = useFeeding();
  const { sessions: sleepSessions } = useSleep();
  const { events: diaperEvents } = useDiaper();
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleImport = () => {
    if (!baby) return;
    const added = importSeedFeedingHistory(baby.id);
    setImportMessage(
      added > 0
        ? `${added} tétée${added > 1 ? "s" : ""} importée${added > 1 ? "s" : ""} depuis le carnet.`
        : "Le carnet était déjà entièrement importé."
    );
  };

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
      if (s.breast === "left") entry.left += s.durationSeconds;
      else if (s.breast === "right") entry.right += s.durationSeconds;
      else entry.unknown += s.durationSeconds;
    }
    // "Tétées" counted as grouped feeds (sessions <=30min apart count as one),
    // not raw chronometer sessions — grouping only makes sense within a day.
    const sessionsByDay = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const key = dateKey(s.startTime);
      const arr = sessionsByDay.get(key) ?? [];
      arr.push(s);
      sessionsByDay.set(key, arr);
    }
    for (const daySessions of sessionsByDay.values()) {
      const entry = get(daySessions[0].startTime);
      entry.feedingCount = groupFeedingSessions(daySessions).groups.length;
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

      <div className="mb-5 rounded-2xl bg-surface border border-border p-4">
        <p className="text-sm font-medium">Historique du carnet papier</p>
        <p className="text-xs text-text-muted mt-1">
          Recharge les tétées notées à la main depuis la naissance de Raphaël (6 au 19
          septembre) si elles n&apos;apparaissent pas ci-dessous.
        </p>
        <button
          type="button"
          onClick={handleImport}
          className="mt-3 text-sm font-medium bg-accent text-white rounded-xl px-4 py-2 active:scale-[0.98] transition-transform"
        >
          Importer l&apos;historique
        </button>
        {importMessage && <p className="mt-2 text-xs text-accent">{importMessage}</p>}
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
          {days.map((d) => {
            const expanded = expandedKey === d.key;
            const daySessions = sessions
              .filter((s) => dateKey(s.startTime) === d.key)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const { groups: dayGroups } = groupFeedingSessions(daySessions);
            const daySleep = sleepSessions
              .filter((s) => dateKey(s.startTime) === d.key)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const dayDiapers = diaperEvents
              .filter((e) => dateKey(e.time) === d.key)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={d.key} className="rounded-2xl bg-surface border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedKey(expanded ? null : d.key)}
                  className="w-full text-left p-4 text-text active:bg-bg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-medium">{d.label}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-text-muted transition-transform shrink-0"
                      style={{ transform: expanded ? "rotate(180deg)" : "none" }}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

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
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 pb-4">
                    {daySessions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                          Tétées
                        </p>
                        <FeedingGroupList groups={dayGroups} sessions={daySessions} />
                      </div>
                    )}
                    {daySleep.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                          Sommeil
                        </p>
                        {daySleep.map((s) => (
                          <SleepSessionRow key={s.id} session={s} />
                        ))}
                      </div>
                    )}
                    {dayDiapers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                          Couches
                        </p>
                        {dayDiapers.map((e) => (
                          <DiaperEventRow key={e.id} event={e} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
