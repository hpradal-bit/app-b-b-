"use client";

import SessionRow from "./SessionRow";
import { formatDuration, formatTime } from "@/lib/format";
import type { FeedingGroup } from "@/lib/feedingGrouping";
import type { FeedingSession } from "@/lib/types";

/**
 * Sessions grouped into the same tétée (gap <=30min) render as one block —
 * a shared header for the tétée, with each pause/switch nested inside —
 * instead of looking like separate, unrelated feeds.
 */
export default function FeedingGroupBlock({
  group,
  sessions,
}: {
  group: FeedingGroup;
  sessions: FeedingSession[];
}) {
  const groupSessions = sessions.filter((s) => group.sessionIds.includes(s.id));

  if (groupSessions.length <= 1) {
    return groupSessions[0] ? (
      <SessionRow session={groupSessions[0]} groupNumber={group.number} />
    ) : null;
  }

  const total = groupSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums text-white bg-accent shrink-0">
          {group.number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {formatTime(group.startTime)} — {formatTime(group.endTime)}
          </div>
          <div className="text-xs text-text-muted">
            {groupSessions.length} reprises · {formatDuration(total)}
          </div>
        </div>
      </div>
      <div className="ml-8 mt-1 pl-3 border-l border-border">
        {groupSessions.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}
