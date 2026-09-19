"use client";

import { useState } from "react";
import { deleteSleepSession, updateSleepSession } from "@/lib/repo";
import { formatDuration, formatTime } from "@/lib/format";
import type { SleepSession } from "@/lib/types";

function toInputTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function withInputTime(iso: string, hhmm: string): string {
  const d = new Date(iso);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export default function SleepSessionRow({ session }: { session: SleepSession }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(toInputTime(session.startTime));
  const [end, setEnd] = useState(toInputTime(session.endTime));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    updateSleepSession(session.id, {
      startTime: withInputTime(session.startTime, start),
      endTime: withInputTime(session.endTime, end),
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-accent" />
          <span className="text-sm font-medium">Sommeil</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex-1 text-xs text-text-muted">
            Endormissement
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
            />
          </label>
          <label className="flex-1 text-xs text-text-muted">
            Réveil
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="text-sm px-3 py-1.5 rounded-lg text-text-muted">
            Annuler
          </button>
          <button onClick={save} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white font-medium">
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-accent" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {formatTime(session.startTime)} — {formatTime(session.endTime)}
        </div>
        <div className="text-xs text-text-muted">{formatDuration(session.durationSeconds)}</div>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => deleteSleepSession(session.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-danger text-white font-medium"
          >
            Confirmer
          </button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1.5 text-text-muted">
            Annuler
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            aria-label="Modifier"
            onClick={() => setEditing(true)}
            className="w-8 h-8 flex items-center justify-center text-text-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            aria-label="Supprimer"
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center text-text-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
