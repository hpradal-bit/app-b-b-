export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h} h ${m.toString().padStart(2, "0")}`;
  if (m > 0) return `${m} min ${s.toString().padStart(2, "0")}`;
  return `${s} sec`;
}

/** mm:ss or hh:mm:ss live chronometer display */
export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function dateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

export function isToday(iso: string): boolean {
  return dateKey(iso) === dateKey(new Date().toISOString());
}

function isYesterday(iso: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateKey(iso) === dateKey(yesterday.toISOString());
}

/** "Aujourd'hui" / "Hier" / "samedi 19 septembre" — for day-list headings. */
export function relativeDayLabel(iso: string): string {
  if (isToday(iso)) return "Aujourd'hui";
  if (isYesterday(iso)) return "Hier";
  return formatDayLabel(iso);
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/**
 * Buckets any timestamped list into calendar days, most recent day first
 * and each day's items most-recent-first — the shared "browse every day"
 * pattern used by the simple per-event modules (couches, lait, bain).
 */
export function groupByDay<T>(items: T[], getTime: (item: T) => string): DayGroup<T>[] {
  const byDay = new Map<string, T[]>();
  for (const item of items) {
    const key = dateKey(getTime(item));
    const arr = byDay.get(key) ?? [];
    arr.push(item);
    byDay.set(key, arr);
  }
  return Array.from(byDay.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, dayItems]) => ({
      key,
      label: relativeDayLabel(getTime(dayItems[0])),
      items: [...dayItems].sort((a, b) => getTime(b).localeCompare(getTime(a))),
    }));
}
