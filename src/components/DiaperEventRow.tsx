"use client";

import { useState } from "react";
import { deleteDiaperEvent, updateDiaperEvent } from "@/lib/repo";
import { formatTime } from "@/lib/format";
import type { DiaperEvent, DiaperKind } from "@/lib/types";

const KIND_LABEL: Record<DiaperKind, string> = {
  wet: "Mouillée",
  dirty: "Selle",
  both: "Les deux",
};

const KIND_EMOJI: Record<DiaperKind, string> = {
  wet: "💧",
  dirty: "💩",
  both: "💧💩",
};

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

const COMMENT_PRESETS = ["Petite quantité", "Quantité normale", "Grosse quantité", "Couleur inhabituelle"];

export default function DiaperEventRow({ event }: { event: DiaperEvent }) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(toInputTime(event.time));
  const [kind, setKind] = useState<DiaperKind>(event.kind);
  const [comment, setComment] = useState(event.comment ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    updateDiaperEvent(event.id, {
      time: withInputTime(event.time, time),
      kind,
      comment: comment.trim() || undefined,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          {(Object.keys(KIND_LABEL) as DiaperKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`flex-1 text-xs font-medium py-2 rounded-lg border ${
                kind === k ? "bg-accent text-white border-accent" : "border-border text-text-muted"
              }`}
            >
              {KIND_EMOJI[k]} {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <label className="text-xs text-text-muted">
          Heure
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
          />
        </label>
        <div>
          <span className="text-xs text-text-muted">Commentaire</span>
          <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
            {COMMENT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setComment(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-full border ${
                  comment === preset ? "bg-accent text-white border-accent" : "border-border text-text-muted"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex. gros caca, petit caca…"
            className="w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
          />
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
      <span className="text-lg shrink-0">{KIND_EMOJI[event.kind]}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{formatTime(event.time)}</div>
        <div className="text-xs text-text-muted">
          {KIND_LABEL[event.kind]}
          {event.comment ? <span className="italic"> · {event.comment}</span> : ""}
        </div>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => deleteDiaperEvent(event.id)}
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
