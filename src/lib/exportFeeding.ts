import { dateKey, formatDuration, formatTime } from "./format";
import type { FeedingSession } from "./types";

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const SIDE_LABEL = { left: "G", right: "D", unknown: "?" } as const;

function shortDayHeader(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}/${month}`;
}

/**
 * Plain-text dump of the whole feeding history, close to the parents' own
 * paper carnet notation — meant to be copied into a Notes app as a manual
 * backup, independent of this device/app.
 */
export function buildFeedingExportText(sessions: FeedingSession[], babyName: string): string {
  const byDay = new Map<string, FeedingSession[]>();
  for (const s of sessions) {
    const key = dateKey(s.startTime);
    const arr = byDay.get(key) ?? [];
    arr.push(s);
    byDay.set(key, arr);
  }

  const days = Array.from(byDay.keys()).sort();
  const lines: string[] = [`Historique des tétées — ${babyName}`, ""];

  for (const key of days) {
    const daySessions = [...byDay.get(key)!].sort((a, b) => a.startTime.localeCompare(b.startTime));
    lines.push(shortDayHeader(key));
    let total = 0;
    daySessions.forEach((s, i) => {
      total += s.durationSeconds;
      const range = `${formatTime(s.startTime)}-${formatTime(s.endTime)}`;
      lines.push(`${i + 1}. ${range} (${formatDuration(s.durationSeconds)}, ${SIDE_LABEL[s.breast]})`);
    });
    lines.push(`TOTAL ${formatDuration(total)}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}
