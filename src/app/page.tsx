"use client";

import Link from "next/link";
import { useMemo } from "react";
import LastFeedingBanner from "@/components/LastFeedingBanner";
import ThemeToggle from "@/components/ThemeToggle";
import { computeAge } from "@/lib/age";
import { formatDuration, isToday } from "@/lib/format";
import { activeGroupNumber, groupFeedingSessions } from "@/lib/feedingGrouping";
import { useFeeding } from "@/lib/useFeeding";
import { useSleep } from "@/lib/useSleep";
import { useDiaper } from "@/lib/useDiaper";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Bon courage cette nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  if (h < 22) return "Bonsoir";
  return "Bon courage cette nuit";
}

export default function DashboardPage() {
  const { baby, active, sessions, elapsedSeconds } = useFeeding();
  const { active: sleepActive, sessions: sleepSessions, elapsedSeconds: sleepElapsedSeconds } =
    useSleep();
  const { events: diaperEvents } = useDiaper();

  const age = baby ? computeAge(baby.birthDate) : null;

  const todayDiaperCount = useMemo(
    () => diaperEvents.filter((e) => isToday(e.time)).length,
    [diaperEvents]
  );

  const today = useMemo(() => {
    const todaySessions = sessions.filter((s) => isToday(s.startTime));
    let total = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    if (active) total += elapsedSeconds(active.breast);
    const { groups } = groupFeedingSessions(todaySessions);
    const count = active ? Math.max(groups.length, activeGroupNumber(groups, active.startTime)) : groups.length;
    return { count, total };
  }, [sessions, active, elapsedSeconds]);

  const todaySleepTotal = useMemo(() => {
    const base = sleepSessions
      .filter((s) => isToday(s.startTime))
      .reduce((sum, s) => sum + s.durationSeconds, 0);
    return sleepActive ? base + sleepElapsedSeconds() : base;
  }, [sleepSessions, sleepActive, sleepElapsedSeconds]);

  const lastSession = sessions.slice().sort((a, b) => b.endTime.localeCompare(a.endTime))[0] ?? null;

  if (!baby || !age) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{greeting()} 👋</p>
          <h1 className="text-[22px] font-semibold mt-0.5">
            {baby.firstName} <span className="text-text-muted font-normal">· {age.label}</span>
          </h1>
        </div>
        <ThemeToggle />
      </div>

      {active && (
        <div
          className="mt-5 rounded-2xl p-4 flex items-center justify-between text-white"
          style={{ background: active.breast === "left" ? "var(--left)" : "var(--right)" }}
        >
          <div>
            <p className="text-xs opacity-90">Tétée en cours · {active.breast === "left" ? "sein gauche" : "sein droit"}</p>
            <p className="text-2xl font-semibold tabular-nums mt-0.5">
              {formatDuration(elapsedSeconds(active.breast))}
            </p>
          </div>
          <Link
            href="/feeding"
            className="text-sm font-medium bg-white/20 px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Ouvrir
          </Link>
        </div>
      )}

      {!active && sleepActive && (
        <div className="mt-5 rounded-2xl p-4 flex items-center justify-between text-white bg-accent">
          <div>
            <p className="text-xs opacity-90">Raphaël dort depuis</p>
            <p className="text-2xl font-semibold tabular-nums mt-0.5">
              {formatDuration(sleepElapsedSeconds())}
            </p>
          </div>
          <Link
            href="/sleep"
            className="text-sm font-medium bg-white/20 px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Ouvrir
          </Link>
        </div>
      )}

      {!active && !sleepActive && lastSession && (
        <div className="mt-5">
          <LastFeedingBanner lastSession={lastSession} />
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-surface border border-border p-3.5 flex flex-col gap-1">
          <span className="text-lg">🍼</span>
          <span className="text-base font-semibold tabular-nums">{today.count}</span>
          <span className="text-[11px] text-text-muted leading-tight">
            Tétées{today.total > 0 ? ` · ${formatDuration(today.total)}` : ""}
          </span>
        </div>
        <div className="rounded-2xl bg-surface border border-border p-3.5 flex flex-col gap-1">
          <span className="text-lg">😴</span>
          <span className="text-base font-semibold tabular-nums">
            {todaySleepTotal > 0 ? formatDuration(todaySleepTotal) : "—"}
          </span>
          <span className="text-[11px] text-text-muted leading-tight">Sommeil</span>
        </div>
        <div className="rounded-2xl bg-surface border border-border p-3.5 flex flex-col gap-1">
          <span className="text-lg">💧</span>
          <span className="text-base font-semibold tabular-nums">
            {todayDiaperCount > 0 ? todayDiaperCount : "—"}
          </span>
          <span className="text-[11px] text-text-muted leading-tight">Couches</span>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-[15px] font-semibold mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/feeding"
            className="rounded-2xl bg-accent text-white p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-xl">🍼</span>
            <span className="text-sm font-medium">Tétée</span>
          </Link>
          <Link
            href="/sleep"
            className="rounded-2xl bg-surface border border-border p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-xl">😴</span>
            <span className="text-sm font-medium">Sommeil</span>
          </Link>
          <Link
            href="/diaper"
            className="rounded-2xl bg-surface border border-border p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-xl">💧</span>
            <span className="text-sm font-medium">Couche</span>
          </Link>
          <Link
            href="/crying"
            className="rounded-2xl bg-surface border border-border p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-xl">😢</span>
            <span className="text-sm font-medium">Pleurs</span>
          </Link>
          <Link
            href="/milk"
            className="rounded-2xl bg-surface border border-border p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-xl">🍼</span>
            <span className="text-sm font-medium">Lait tiré</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
