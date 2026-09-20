import { dateKey } from "./format";
import { groupFeedingSessions } from "./feedingGrouping";
import type { DiaperEvent, FeedingSession, SleepSession } from "./types";

export type TimelineEntry =
  | { id: string; time: string; kind: "feeding"; icon: "🍼"; title: string }
  | { id: string; time: string; kind: "sleep_start"; icon: "💤"; title: string }
  | { id: string; time: string; kind: "sleep_end"; icon: "☀️"; title: string }
  | { id: string; time: string; kind: "diaper"; icon: "🧷"; title: string };

const DIAPER_LABEL: Record<DiaperEvent["kind"], string> = {
  wet: "Couche changée (mouillée)",
  dirty: "Couche changée (selle)",
  both: "Couche changée",
};

function formatDur(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
  return `${m} min`;
}

/**
 * Builds one chronological, ascending timeline per day out of the three
 * independent event sources — the single source of truth every other
 * screen already reads from (repo.ts). Nothing here is a copy of the
 * data: it's a read-only projection for display.
 */
export function buildTimelineByDay(
  feedingSessions: FeedingSession[],
  sleepSessions: SleepSession[],
  diaperEvents: DiaperEvent[]
): Map<string, TimelineEntry[]> {
  const byDay = new Map<string, TimelineEntry[]>();
  const push = (iso: string, entry: TimelineEntry) => {
    const key = dateKey(iso);
    const arr = byDay.get(key) ?? [];
    arr.push(entry);
    byDay.set(key, arr);
  };

  // Feeding: one entry per grouped tétée (not per raw chronometer session),
  // anchored at the group's start.
  const feedingByDay = new Map<string, FeedingSession[]>();
  for (const s of feedingSessions) {
    const key = dateKey(s.startTime);
    const arr = feedingByDay.get(key) ?? [];
    arr.push(s);
    feedingByDay.set(key, arr);
  }
  for (const daySessions of feedingByDay.values()) {
    const { groups } = groupFeedingSessions(daySessions);
    for (const g of groups) {
      const groupSessions = daySessions.filter((s) => g.sessionIds.includes(s.id));
      const sides = new Set(groupSessions.map((s) => s.breast));
      const sideLabel =
        sides.size === 1
          ? { left: "sein gauche", right: "sein droit", unknown: "côté non précisé" }[
              groupSessions[0].breast
            ]
          : "des deux côtés";
      const total = groupSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      push(g.startTime, {
        id: `feeding-${g.number}-${g.startTime}`,
        time: g.startTime,
        kind: "feeding",
        icon: "🍼",
        title: `Tétée — ${sideLabel} — ${formatDur(total)}`,
      });
    }
  }

  for (const s of sleepSessions) {
    push(s.startTime, {
      id: `sleep-start-${s.id}`,
      time: s.startTime,
      kind: "sleep_start",
      icon: "💤",
      title: "Sommeil commencé",
    });
    push(s.endTime, {
      id: `sleep-end-${s.id}`,
      time: s.endTime,
      kind: "sleep_end",
      icon: "☀️",
      title: `Réveil — sommeil de ${formatDur(s.durationSeconds)}`,
    });
  }

  for (const e of diaperEvents) {
    push(e.time, {
      id: `diaper-${e.id}`,
      time: e.time,
      kind: "diaper",
      icon: "🧷",
      title: DIAPER_LABEL[e.kind],
    });
  }

  for (const entries of byDay.values()) {
    entries.sort((a, b) => a.time.localeCompare(b.time));
  }

  return byDay;
}
