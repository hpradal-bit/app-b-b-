"use client";

import { useMemo } from "react";
import PastDaysAccordion, { type PastDayEntry } from "@/components/PastDaysAccordion";
import ThemeToggle from "@/components/ThemeToggle";
import TimelineList from "@/components/TimelineList";
import { dateKey, relativeDayLabel } from "@/lib/format";
import { buildTimelineByDay, type TimelineEntry } from "@/lib/timeline";
import { useBath } from "@/lib/useBath";
import { useDiaper } from "@/lib/useDiaper";
import { useFeeding } from "@/lib/useFeeding";
import { useSleep } from "@/lib/useSleep";

export default function FilPage() {
  const { active: activeFeeding, sessions: feedingSessions } = useFeeding();
  const { active: activeSleep, sessions: sleepSessions } = useSleep();
  const { events: diaperEvents } = useDiaper();
  const { events: bathEvents } = useBath();

  const byDay = useMemo(
    () => buildTimelineByDay(feedingSessions, sleepSessions, diaperEvents, bathEvents),
    [feedingSessions, sleepSessions, diaperEvents, bathEvents]
  );

  const todayKey = dateKey(new Date().toISOString());

  const todayEntries: TimelineEntry[] = useMemo(() => {
    const entries = [...(byDay.get(todayKey) ?? [])];
    if (activeFeeding) {
      const sideLabel = { left: "sein gauche", right: "sein droit", unknown: "" }[
        activeFeeding.breast
      ];
      entries.push({
        id: "active-feeding",
        time: activeFeeding.startTime,
        kind: "feeding",
        icon: "🍼",
        title: `Tétée en cours — ${sideLabel}`,
      });
    }
    if (activeSleep) {
      entries.push({
        id: "active-sleep",
        time: activeSleep.startTime,
        kind: "sleep_start",
        icon: "💤",
        title: "Sommeil en cours",
      });
    }
    return entries.sort((a, b) => a.time.localeCompare(b.time));
  }, [byDay, todayKey, activeFeeding, activeSleep]);

  const pastDays: PastDayEntry[] = useMemo(() => {
    return Array.from(byDay.entries())
      .filter(([key]) => key !== todayKey)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, entries]) => ({
        key,
        label: relativeDayLabel(entries[0]?.time ?? `${key}T12:00:00`),
        summary: (
          <span className="text-xs text-text-muted">{entries.length} événements</span>
        ),
        detail: <TimelineList entries={entries} />,
      }));
  }, [byDay, todayKey]);

  const hasAnything = todayEntries.length > 0 || pastDays.length > 0;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Fil</h1>
        <ThemeToggle />
      </div>

      {!hasAnything ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Le fil de la journée apparaîtra ici au fur et à mesure des tétées, siestes et
          changes.
        </p>
      ) : (
        <>
          <section>
            <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
              Aujourd&apos;hui
            </h2>
            <div className="rounded-2xl bg-surface border border-border p-4">
              <TimelineList entries={todayEntries} />
            </div>
          </section>

          {pastDays.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                Jours précédents
              </h2>
              <PastDaysAccordion days={pastDays} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
