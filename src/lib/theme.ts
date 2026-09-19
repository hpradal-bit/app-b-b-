"use client";

const KEY = "bb:theme"; // "light" | "dark"

export function getStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(KEY, theme);
}

export function initialTheme(): "light" | "dark" {
  const stored = getStoredTheme();
  if (stored) return stored;
  // Night mode by default between 20h and 7h — most feedings happen there.
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 7) return "dark";
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
