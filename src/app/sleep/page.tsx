"use client";

import { useMemo } from "react";
import SleepSessionRow from "@/components/SleepSessionRow";
import ThemeToggle from "@/components/ThemeToggle";
import { computeAge } from "@/lib/age";
import { formatDuration, formatTime, isToday } from "@/lib/format";
import { getDrowsinessInfo } from "@/lib/sleepMatrix";
import { predictNextSleep } from "@/lib/sleepPredictor";
import { useSleep } from "@/lib/useSleep";

export default function SleepPage() {
  const { baby, active, sessions, elapsedSeconds, minutesAwake, lastWakeTime, toggle } =
    useSleep();

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
  const lastWake = lastWakeTime();
  const drowsiness = !active && age ? getDrowsinessInfo(age.days, currentMinutesAwake) : null;

  const prediction = useMemo(() => {
    if (active || !age || !lastWake) return null;
    return predictNextSleep(age.days, sessions, lastWake);
  }, [active, age, lastWake, sessions]);

  const drowsinessTone: Record<string, string> = {
    just_woke: "var(--text-muted)",
    watch_soon: "var(--text)",
    watch_now: "var(--left)",
    overdue: "var(--danger)",
  };

  if (!baby) return null;

  const isEvening = new Date().getHours() >= 18;
  const adviceLabel = isEvening ? "Heure du coucher conseillée" : "Prochain endormissement conseillé";

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Sommeil</h1>
        <ThemeToggle />
      </div>

      {active ? (
        <div
          className="rounded-[28px] flex flex-col items-center justify-center gap-2 py-12"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <span className="text-2xl">😴</span>
          <span className="text-[13px] font-medium opacity-90">Raphaël dort depuis</span>
          <span className="text-4xl font-semibold tabular-nums leading-none">
            {formatDuration(elapsedSeconds())}
          </span>
        </div>
      ) : prediction ? (
        <div className="rounded-[28px] bg-surface border border-border p-6 flex flex-col items-center text-center gap-1.5">
          <span className="text-[13px] font-medium text-text-muted">{adviceLabel}</span>
          <span className="text-5xl font-semibold tabular-nums leading-none mt-1">
            {formatTime(prediction.recommended)}
          </span>
          <span className="text-sm text-text-muted mt-2">
            Entre {formatTime(prediction.earliest)} et {formatTime(prediction.latest)}
          </span>
          <span className="text-[11px] text-text-muted mt-3 max-w-[30ch] leading-relaxed">
            {prediction.basis === "personal"
              ? `Basé sur le rythme des derniers jours de Raphaël (${prediction.sampleSize} siestes récentes).`
              : prediction.basis === "blend"
                ? "Basé sur un mélange entre son rythme récent et les repères pour son âge."
                : "Basé sur les repères pour son âge — encore peu de données sur Raphaël, la prédiction s'affinera avec le temps."}
          </span>
        </div>
      ) : (
        <div className="rounded-[28px] bg-surface border border-border p-6 flex flex-col items-center text-center gap-1.5">
          <span className="text-2xl">🌤️</span>
          <span className="text-sm text-text-muted mt-1">
            Enregistre un premier sommeil pour obtenir une prédiction personnalisée.
          </span>
        </div>
      )}

      {!active && drowsiness && currentMinutesAwake > 0 && (
        <div
          className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm"
          style={{ color: drowsinessTone[drowsiness.level] }}
        >
          <span className="font-medium">Éveillé depuis {currentMinutesAwake} min. </span>
          <span className="text-text-muted">{drowsiness.message}</span>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        className="w-full mt-4 rounded-2xl py-3.5 text-sm font-medium border border-border bg-surface text-text active:scale-[0.98] transition-transform"
      >
        {active ? "Bébé se réveille — toucher pour arrêter" : "Bébé s'endort — toucher pour démarrer"}
      </button>

      <details className="mt-6 group">
        <summary className="flex items-center justify-between cursor-pointer list-none py-2">
          <span className="text-[15px] font-semibold">Détail du jour</span>
          <span className="text-xs text-text-muted">
            {formatDuration(totalToday)} · {todaySessions.length + (active ? 1 : 0)} sommeil
            {todaySessions.length + (active ? 1 : 0) > 1 ? "s" : ""}
          </span>
        </summary>
        <div className="mt-3">
          {todaySessions.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">
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
      </details>

      <p className="mt-6 text-[11px] text-text-muted text-center leading-relaxed px-4">
        Ces repères et prédictions sont des tendances, pas des objectifs. Chaque bébé a son
        propre rythme — ceci ne remplace pas l&apos;avis d&apos;un professionnel de santé.
      </p>
    </div>
  );
}
