/**
 * A "tétée" as the parent thinks of it isn't always one continuous
 * chronometer session: baby pausing, switching side, or being put back on
 * a few minutes later is still the *same* feed. Two sessions are grouped
 * into the same numbered tétée when the gap between one session's end and
 * the next session's start is 30 minutes or less; a longer gap starts a
 * new number.
 */

const GROUP_GAP_MINUTES = 30;

export interface FeedingGroup {
  number: number;
  startTime: string;
  endTime: string;
  sessionIds: string[];
}

export function groupFeedingSessions<T extends { id: string; startTime: string; endTime: string }>(
  sessions: T[]
): { groups: FeedingGroup[]; numberBySessionId: Map<string, number> } {
  const sorted = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groups: FeedingGroup[] = [];
  const numberBySessionId = new Map<string, number>();

  for (const s of sorted) {
    const last = groups[groups.length - 1];
    const gapMinutes = last
      ? (new Date(s.startTime).getTime() - new Date(last.endTime).getTime()) / 60000
      : Infinity;

    if (last && gapMinutes <= GROUP_GAP_MINUTES) {
      if (new Date(s.endTime).getTime() > new Date(last.endTime).getTime()) {
        last.endTime = s.endTime;
      }
      last.sessionIds.push(s.id);
    } else {
      groups.push({ number: groups.length + 1, startTime: s.startTime, endTime: s.endTime, sessionIds: [s.id] });
    }
    numberBySessionId.set(s.id, groups[groups.length - 1].number);
  }

  return { groups, numberBySessionId };
}

/**
 * Where a tétée currently in progress (no stored session yet) would land:
 * same number as the last group if it started within the grouping window
 * of that group's end, otherwise the next number.
 */
export function activeGroupNumber(groups: FeedingGroup[], activeStartTime: string): number {
  const last = groups[groups.length - 1];
  if (!last) return 1;
  const gapMinutes = (new Date(activeStartTime).getTime() - new Date(last.endTime).getTime()) / 60000;
  return gapMinutes <= GROUP_GAP_MINUTES ? last.number : groups.length + 1;
}
