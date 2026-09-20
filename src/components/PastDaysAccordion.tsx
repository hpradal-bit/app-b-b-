"use client";

import { useState, type ReactNode } from "react";

export interface PastDayEntry {
  key: string;
  label: string;
  summary: ReactNode;
  detail: ReactNode;
}

/** Shared "Jours précédents" list: tap a day to expand its detail. */
export default function PastDaysAccordion({ days }: { days: PastDayEntry[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (days.length === 0) {
    return <p className="text-sm text-text-muted py-4 text-center">Rien à afficher pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {days.map((d) => {
        const expanded = expandedKey === d.key;
        return (
          <div key={d.key} className="rounded-2xl bg-surface border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedKey(expanded ? null : d.key)}
              className="w-full text-left p-3.5 text-text active:bg-bg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.label}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-text-muted transition-transform shrink-0"
                  style={{ transform: expanded ? "rotate(180deg)" : "none" }}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-1">{d.summary}</div>
            </button>
            {expanded && <div className="border-t border-border px-3.5 pb-3">{d.detail}</div>}
          </div>
        );
      })}
    </div>
  );
}
