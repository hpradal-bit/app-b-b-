"use client";

import { useEffect, useState } from "react";
import { applyTheme, initialTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Mirrors the class the anti-flash inline script already applied to
    // <html> before hydration — read once from the DOM/localStorage, not
    // derivable from server-rendered markup, so it can't move to render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(initialTheme() === "dark");
  }, []);

  if (dark === null) return <div className="w-9 h-9" />;

  return (
    <button
      type="button"
      aria-label={dark ? "Activer le mode jour" : "Activer le mode nuit"}
      onClick={() => {
        const next = !dark;
        setDark(next);
        applyTheme(next ? "dark" : "light");
      }}
      className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border border-border text-text-muted active:scale-95 transition-transform"
    >
      {dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
