"use client";

import { useEffect } from "react";

const CHECK_INTERVAL_MS = 5 * 60_000;

/**
 * Detects when a new deployment has gone live and silently reloads the
 * page to fetch it. Exists because the iPhone "Add to Home Screen" icon
 * otherwise keeps running whatever build was cached when it launched,
 * with no way for the parent to know an update exists — checking here
 * (on load, when the app is foregrounded, and periodically) means they
 * never need to manually reinstall it. A reload never touches
 * localStorage, so no feeding/sleep data is ever at risk.
 */
export default function VersionWatcher() {
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const data = await res.json();
        const current = process.env.NEXT_PUBLIC_BUILD_ID;
        if (!cancelled && data.buildId && current && data.buildId !== current) {
          window.location.reload();
        }
      } catch {
        // offline or request failed — just try again next time
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", check);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", check);
    };
  }, []);

  return null;
}
