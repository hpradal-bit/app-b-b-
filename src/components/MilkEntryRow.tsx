"use client";

import { useEffect, useState } from "react";
import { deleteMilkEntry, markMilkFridged, updateMilkEntry } from "@/lib/repo";
import { formatTime } from "@/lib/format";
import { formatAgoMinutes } from "@/lib/relativeTime";
import { getMilkStatus } from "@/lib/milk";
import type { MilkEntry } from "@/lib/types";

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

export default function MilkEntryRow({ entry }: { entry: MilkEntry }) {
  const [editing, setEditing] = useState(false);
  const [pumpedTime, setPumpedTime] = useState(toInputTime(entry.pumpedAt));
  const [fridged, setFridged] = useState(Boolean(entry.fridgedAt));
  const [fridgedTime, setFridgedTime] = useState(
    entry.fridgedAt ? toInputTime(entry.fridgedAt) : toInputTime(new Date().toISOString())
  );
  const [quantity, setQuantity] = useState(entry.quantityMl?.toString() ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const status = getMilkStatus(entry);

  const save = () => {
    updateMilkEntry(entry.id, {
      pumpedAt: withInputTime(entry.pumpedAt, pumpedTime),
      fridgedAt: fridged ? withInputTime(entry.fridgedAt ?? entry.pumpedAt, fridgedTime) : undefined,
      quantityMl: quantity ? Number(quantity) : undefined,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="flex-1 text-xs text-text-muted">
            Tiré à
            <input
              type="time"
              value={pumpedTime}
              onChange={(e) => setPumpedTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
            />
          </label>
          <label className="flex-1 text-xs text-text-muted">
            Quantité (ml)
            <input
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Optionnel"
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={fridged}
            onChange={(e) => setFridged(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          Mis au frigo
        </label>
        {fridged && (
          <label className="text-xs text-text-muted">
            Heure de mise au frigo
            <input
              type="time"
              value={fridgedTime}
              onChange={(e) => setFridgedTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
            />
          </label>
        )}
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
      <span className="text-lg shrink-0">🍼</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          Tiré à {formatTime(entry.pumpedAt)}
          {entry.quantityMl ? ` · ${entry.quantityMl} ml` : ""}
        </div>
        <div className="text-xs" style={{ color: status.expired ? "var(--danger)" : "var(--text-muted)" }}>
          {entry.fridgedAt ? `Au frigo depuis ${formatTime(entry.fridgedAt)}` : "À température ambiante"}
          {" · "}
          {status.expired
            ? `Expiré depuis ${formatAgoMinutes(-status.minutesLeft)}`
            : `Encore ${formatAgoMinutes(status.minutesLeft)}`}
        </div>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => deleteMilkEntry(entry.id)}
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
          {!entry.fridgedAt && (
            <button
              onClick={() => markMilkFridged(entry.id)}
              className="text-[11px] font-medium px-2 py-1.5 rounded-lg bg-bg text-text-muted"
            >
              Au frigo
            </button>
          )}
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
