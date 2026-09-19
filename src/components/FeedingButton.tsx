"use client";

import { formatClock } from "@/lib/format";
import type { Breast } from "@/lib/types";

interface Props {
  breast: Breast;
  isActive: boolean;
  otherActive: boolean;
  seconds: number;
  onTap: () => void;
}

export default function FeedingButton({ breast, isActive, otherActive, seconds, onTap }: Props) {
  const label = breast === "left" ? "Sein gauche" : "Sein droit";
  const colorVar = breast === "left" ? "var(--left)" : "var(--right)";

  return (
    <button
      type="button"
      onClick={onTap}
      className={`relative flex-1 rounded-[28px] flex flex-col items-center justify-center gap-2 py-10 transition-all duration-200 active:scale-[0.98] select-none ${
        isActive ? "shadow-lg" : "border border-border"
      }`}
      style={{
        background: isActive ? colorVar : "var(--surface)",
        color: isActive ? "#fff" : "var(--text)",
        opacity: otherActive && !isActive ? 0.55 : 1,
      }}
      aria-pressed={isActive}
    >
      <span className="text-[15px] font-medium tracking-wide" style={{ opacity: isActive ? 0.9 : 0.6 }}>
        {label}
      </span>
      <span className="text-4xl font-semibold tabular-nums leading-none">
        {formatClock(seconds)}
      </span>
      <span className="text-[13px] font-medium mt-1" style={{ opacity: isActive ? 0.9 : 0.5 }}>
        {isActive ? "Toucher pour arrêter" : otherActive ? "Toucher pour changer" : "Toucher pour démarrer"}
      </span>
    </button>
  );
}
