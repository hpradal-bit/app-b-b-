"use client";

import { useMemo } from "react";
import SleepSessionRow from "@/components/SleepSessionRow";
import ThemeToggle from "@/components/ThemeToggle";
import { computeAge } from "@/lib/age";
import { formatDuration, isToday } from "@/lib/format";
import { getDrowsinessInfo } from "@/lib/sleepMatrix";
import { useSleep } from "@/lib/useSleep";

export default function SleepPage() {
  const { baby, active, sessions, elapsedSeconds, minutesAwake, toggle } = useSleep();

  const todaySessions = useMemo(
    () => sessions.filter((s) => isToday(s.startTime)).sort((a, b) => b.startTime.localeCompare(a.startTime)),
    [sessions]
  );

  const totalToday = useMemo(() => {
    const base = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    return active ? base + elapsedSeconds() : base;
  }, [todaySessions, active, elapsedSeconds]);

  const age = baby ? computeAge(baby.birthDate) : null;
  const currentMinutesAwake = minutesAwake();
  const drowsiness = !active && age ? getDrowsinessInfo(age.days, currentMinutesAwake) : null;

  const drowsinessTone: Record<string, string> = {
    just_woke: "var(--text-muted)",
    watch_soon: "var(--text)",
    watch_now: "var(--left)",
    overdue: "var(--danger)",
  };

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Sommeil</h1>
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={toggle}
        className="w-full rounded-[28px] flex flex-col items-center justify-center gap-2 py-12 transition-all active:scale-[0.98] select-none"
        style={{
          background: active ? "var(--accent)" : "var(--surface)",
          color: active ? "#fff" : "var(--text)",
          border: active ? "none" : "1px solid var(--border)",
        }}
      >
        <span className="text-2xl">{active ? "😴" : "🌤️"}</span>
        <span className="text-4xl font-semibold tabular-nums leading-none">
          {formatDuration(active ? elapsedSeconds() : 0)}
        </span>
        <span className="text-[13px] font-medium" style={{ opacity: active ? 0.9 : 0.6 }}>
          {active ? "Toucher au réveil" : "Toucher pour démarrer le sommeil"}
        </span>
      </button>

      {!active && drowsiness && currentMinutesAwake > 0 && (
        <div
          className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm"
          style={{ color: drowsinessTone[drowsiness.level] }}
        >
          <span className="font-medium">Éveillé depuis {currentMinutesAwake} min. </span>
          <span className="text-text-muted">{drowsiness.message}</span>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-surface border border-border p-4 flex items-center justify-between">
        <span className="text-sm text-text-muted">Total aujourd&apos;hui</span>
        <span className="text-lg font-semibold tabular-nums">{formatDuration(totalToday)}</span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">Sessions du jour</h2>
          <span className="text-xs text-text-muted">{todaySessions.length + (active ? 1 : 0)}</span>
        </div>
        {todaySessions.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            {active ? "Premier sommeil en cours…" : "Aucun sommeil enregistré pour l'instant."}
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border px-4">
            {todaySessions.map((s) => (
              <SleepSessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] text-text-muted text-center leading-relaxed px-4">
        Les repères affichés sont des tendances générales, pas des objectifs. Chaque bébé a son
        propre rythme — ceci ne remplace pas l&apos;avis d&apos;un professionnel de santé.
      </p>
    </div>
  );
}
