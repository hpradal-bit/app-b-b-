"use client";

import { useMemo } from "react";
import FeedingButton from "@/components/FeedingButton";
import SessionRow from "@/components/SessionRow";
import ThemeToggle from "@/components/ThemeToggle";
import { formatDuration } from "@/lib/format";
import { isToday } from "@/lib/format";
import { activeGroupNumber, groupFeedingSessions } from "@/lib/feedingGrouping";
import { useFeeding } from "@/lib/useFeeding";

export default function FeedingPage() {
  const { baby, active, sessions, elapsedSeconds, tap } = useFeeding();

  const todaySessions = useMemo(
    () => sessions.filter((s) => isToday(s.startTime)).sort((a, b) => b.startTime.localeCompare(a.startTime)),
    [sessions]
  );

  const totals = useMemo(() => {
    let left = 0;
    let right = 0;
    let unknown = 0;
    for (const s of todaySessions) {
      if (s.breast === "left") left += s.durationSeconds;
      else if (s.breast === "right") right += s.durationSeconds;
      else unknown += s.durationSeconds;
    }
    const activeExtra = active ? elapsedSeconds(active.breast) : 0;
    if (active?.breast === "left") left += activeExtra;
    if (active?.breast === "right") right += activeExtra;
    const total = left + right + unknown;
    return { left, right, unknown, total };
  }, [todaySessions, active, elapsedSeconds]);

  const { groups, numberBySessionId } = useMemo(
    () => groupFeedingSessions(todaySessions),
    [todaySessions]
  );
  const tetteeCount = active
    ? Math.max(groups.length, activeGroupNumber(groups, active.startTime))
    : groups.length;

  const sideTotal = totals.left + totals.right;
  const leftPct = sideTotal > 0 ? Math.round((totals.left / sideTotal) * 100) : 0;
  const rightPct = sideTotal > 0 ? 100 - leftPct : 0;

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Tétée</h1>
        <ThemeToggle />
      </div>

      <div className="flex gap-3">
        <FeedingButton
          breast="left"
          isActive={active?.breast === "left"}
          otherActive={active?.breast === "right"}
          seconds={elapsedSeconds("left")}
          onTap={() => tap("left")}
        />
        <FeedingButton
          breast="right"
          isActive={active?.breast === "right"}
          otherActive={active?.breast === "left"}
          seconds={elapsedSeconds("right")}
          onTap={() => tap("right")}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-surface border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Total aujourd&apos;hui</span>
          <span className="text-lg font-semibold tabular-nums">{formatDuration(totals.total)}</span>
        </div>
        {sideTotal > 0 && (
          <>
            <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-border">
              <div style={{ width: `${leftPct}%`, background: "var(--left)" }} />
              <div style={{ width: `${rightPct}%`, background: "var(--right)" }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span>Gauche {leftPct}% · {formatDuration(totals.left)}</span>
              <span>Droit {rightPct}% · {formatDuration(totals.right)}</span>
            </div>
          </>
        )}
        {totals.unknown > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            + {formatDuration(totals.unknown)} sans côté précisé
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">Sessions du jour</h2>
          <span className="text-xs text-text-muted">{tetteeCount}</span>
        </div>
        {todaySessions.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            {active ? "Première tétée en cours…" : "Aucune tétée enregistrée pour l'instant."}
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border px-4">
            {todaySessions.map((s) => (
              <SessionRow key={s.id} session={s} groupNumber={numberBySessionId.get(s.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
