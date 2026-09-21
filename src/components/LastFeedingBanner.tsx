"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/format";
import { formatAgoMinutes, minutesSince } from "@/lib/relativeTime";
import type { FeedingSession } from "@/lib/types";

/**
 * Big, live-ticking "time since last feeding" — the number a tired parent
 * actually scans for to know whether it's about time to feed again.
 * Updates on its own every 10s, no refresh needed.
 */
export default function LastFeedingBanner({ lastSession }: { lastSession: FeedingSession | null }) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  if (!lastSession) return null;

  return (
    <div className="rounded-2xl bg-surface border border-border p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-text-muted">Dernière tétée</p>
        <p className="text-[28px] font-semibold tabular-nums leading-tight mt-0.5">
          il y a {formatAgoMinutes(minutesSince(lastSession.endTime))}
        </p>
      </div>
      <span className="text-xs text-text-muted text-right">
        terminée
        <br />à {formatTime(lastSession.endTime)}
      </span>
    </div>
  );
}
