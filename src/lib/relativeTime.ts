/**
 * "il y a X" formatting, always computed from real timestamps (never from
 * already-rendered text). Rule: minutes below 60 read as "32 min"; 60+
 * read as "1h15", or just "2h" when the remainder is exactly 0.
 */
export function formatAgoMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h}h` : `${h}h${rest.toString().padStart(2, "0")}`;
}

export function minutesSince(iso: string, now: number = Date.now()): number {
  return (now - new Date(iso).getTime()) / 60000;
}
