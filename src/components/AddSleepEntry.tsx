"use client";

import { useState } from "react";
import { addSleepSession } from "@/lib/repo";
import { dateKey } from "@/lib/format";

function combine(date: string, time: string): Date {
  const d = new Date(`${date}T00:00:00`);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function AddSleepEntry({ babyId, onDone }: { babyId: string; onDone: () => void }) {
  const [date, setDate] = useState(() => dateKey(new Date().toISOString()));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const submit = () => {
    if (!start || !end) return;
    const startDate = combine(date, start);
    let endDate = combine(date, end);
    if (endDate.getTime() <= startDate.getTime()) {
      endDate = new Date(endDate.getTime() + 24 * 3600_000); // crosses midnight
    }
    addSleepSession(babyId, startDate.toISOString(), endDate.toISOString());
    onDone();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3 mb-3">
      <p className="text-sm font-medium">Ajouter un sommeil oublié</p>
      <label className="text-xs text-text-muted">
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
        />
      </label>
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
        <button onClick={onDone} className="text-sm px-3 py-1.5 rounded-lg text-text-muted">
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!start || !end}
          className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white font-medium disabled:opacity-40"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
