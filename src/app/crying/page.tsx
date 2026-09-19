"use client";

import { useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { CHECK_ITEMS, RED_FLAGS, buildCauseHints } from "@/lib/cryingGuide";
import { useCryingContext } from "@/lib/useCryingContext";

function formatSince(minutes: number | null): string {
  if (minutes === null) return "aucune donnée aujourd'hui";
  if (minutes < 60) return `il y a ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `il y a ${h} h${m > 0 ? ` ${m.toString().padStart(2, "0")}` : ""}`;
}

export default function CryingPage() {
  const { baby, getContext, logEpisode } = useCryingContext();
  const [redFlags, setRedFlags] = useState<Set<string>>(new Set());
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [logged, setLogged] = useState(false);

  const context = getContext();

  const hints = useMemo(
    () =>
      buildCauseHints({
        minutesSinceLastFeeding: context.minutesSinceLastFeeding,
        minutesSinceLastDiaper: context.minutesSinceLastDiaper,
        minutesAwake: context.minutesAwake,
        checkedIds: Array.from(checks),
      }),
    [checks, context.minutesSinceLastFeeding, context.minutesSinceLastDiaper, context.minutesAwake]
  );

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  };

  const hasRedFlag = redFlags.size > 0;

  const finish = () => {
    logEpisode(hints.map((h) => h.label));
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
    setChecks(new Set());
  };

  if (!baby) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">Pourquoi bébé pleure ?</h1>
        <ThemeToggle />
      </div>

      {hasRedFlag && (
        <div className="rounded-2xl p-4 mb-4 text-white" style={{ background: "var(--danger)" }}>
          <p className="text-sm font-semibold">Consultez un professionnel de santé sans tarder</p>
          <p className="text-xs mt-1 opacity-95">
            Un ou plusieurs signes que tu as cochés peuvent nécessiter un avis médical rapide.
            En cas de doute, il vaut toujours mieux consulter trop tôt.
          </p>
        </div>
      )}

      <section className="mb-5">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
          À vérifier d&apos;abord
        </h2>
        <div className="rounded-2xl bg-surface border border-border px-4">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag.id}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 text-sm"
            >
              <input
                type="checkbox"
                checked={redFlags.has(flag.id)}
                onChange={() => toggle(redFlags, setRedFlags, flag.id)}
                className="w-4 h-4 accent-[var(--danger)] shrink-0"
              />
              {flag.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
          Contexte
        </h2>
        <div className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Dernière tétée</span>
            <span>{formatSince(context.minutesSinceLastFeeding)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Dernier change</span>
            <span>{formatSince(context.minutesSinceLastDiaper)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Éveillé depuis</span>
            <span>{context.minutesAwake} min</span>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
          Ce que tu observes
        </h2>
        <div className="rounded-2xl bg-surface border border-border px-4">
          {CHECK_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 text-sm"
            >
              <input
                type="checkbox"
                checked={checks.has(item.id)}
                onChange={() => toggle(checks, setChecks, item.id)}
                className="w-4 h-4 accent-[var(--accent)] shrink-0"
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-2">
          Ce qui peut aider
        </h2>
        {hints.length === 0 ? (
          <p className="text-sm text-text-muted px-1">
            Coche ce que tu observes ci-dessus pour obtenir des pistes concrètes.
          </p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-4">
            {hints.map((h) => (
              <div key={h.label}>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-accent">{h.label}</span>
                  <span className="text-[11px] text-text-muted">— {h.reason}</span>
                </div>
                <p className="text-sm mt-0.5">{h.suggestion}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-text-muted mt-2 px-1 leading-relaxed">
          Plusieurs causes peuvent expliquer ces pleurs en même temps. Ceci n&apos;est pas un
          diagnostic et ne remplace pas l&apos;avis d&apos;un professionnel de santé.
        </p>
      </section>

      {hints.length > 0 && (
        <button type="button" onClick={finish} className="text-xs text-text-muted underline underline-offset-2">
          {logged ? "Épisode enregistré ✓" : "Garder une trace de cet épisode dans l'historique"}
        </button>
      )}
    </div>
  );
}
