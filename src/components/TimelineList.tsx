import { formatTime } from "@/lib/format";
import type { TimelineEntry } from "@/lib/timeline";

export default function TimelineList({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted py-4 text-center">Rien enregistré pour ce jour.</p>;
  }

  return (
    <div className="flex flex-col">
      {entries.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center w-11 shrink-0">
            <span className="text-[11px] text-text-muted tabular-nums pt-0.5">
              {formatTime(entry.time)}
            </span>
            <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
            {i < entries.length - 1 && <span className="flex-1 w-px bg-border" />}
          </div>
          <div className="flex-1 pb-4 pt-0.5">
            <span className="text-sm">
              {entry.icon} {entry.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
