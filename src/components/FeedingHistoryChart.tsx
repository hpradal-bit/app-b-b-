"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/format";

export interface FeedingDayPoint {
  key: string; // yyyy-mm-dd
  shortLabel: string; // "06/09"
  fullLabel: string; // "6 septembre"
  left: number; // seconds
  right: number; // seconds
  unknown: number; // seconds
}

const BAR_WIDTH = 14;
const GAP = 6;
const CHART_HEIGHT = 140;
const CAP_RADIUS = 3;

export default function FeedingHistoryChart({ days }: { days: FeedingDayPoint[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const maxTotal = Math.max(1, ...days.map((d) => d.left + d.right + d.unknown));
  const yMaxMinutes = Math.ceil(maxTotal / 60 / 30) * 30 || 30; // round up to nearest 30 min
  const yMaxSeconds = yMaxMinutes * 60;

  const width = days.length * (BAR_WIDTH + GAP) + GAP;
  const scaleY = (seconds: number) => (seconds / yMaxSeconds) * CHART_HEIGHT;

  const selected = days.find((d) => d.key === selectedKey) ?? days[days.length - 1];
  const hasUnknown = days.some((d) => d.unknown > 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--left)" }} />
          Gauche
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--right)" }} />
          Droit
        </span>
        {hasUnknown && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-border" />
            Non précisé
          </span>
        )}
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <svg
          viewBox={`0 0 ${width} ${CHART_HEIGHT + 24}`}
          width={Math.max(width, 280)}
          height={CHART_HEIGHT + 24}
          role="img"
          aria-label="Durée quotidienne des tétées, réparties par sein"
        >
          {/* gridlines */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={width}
              y1={CHART_HEIGHT - CHART_HEIGHT * f}
              y2={CHART_HEIGHT - CHART_HEIGHT * f}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}

          {days.map((d, i) => {
            const x = GAP + i * (BAR_WIDTH + GAP);
            const leftH = scaleY(d.left);
            const rightH = scaleY(d.right);
            const unkH = scaleY(d.unknown);
            const isSelected = d.key === selected?.key;

            // stack order bottom -> top: left, right, unknown
            let cursorY = CHART_HEIGHT;
            const segments: { y: number; h: number; fill: string }[] = [];
            if (d.left > 0) {
              cursorY -= leftH;
              segments.push({ y: cursorY, h: leftH, fill: "var(--left)" });
            }
            if (d.right > 0) {
              cursorY -= rightH;
              segments.push({ y: cursorY, h: rightH, fill: "var(--right)" });
            }
            if (d.unknown > 0) {
              cursorY -= unkH;
              segments.push({ y: cursorY, h: unkH, fill: "var(--border)" });
            }

            return (
              <g
                key={d.key}
                onClick={() => setSelectedKey(d.key)}
                style={{ cursor: "pointer" }}
                opacity={selectedKey && !isSelected ? 0.55 : 1}
              >
                <rect x={x} y={0} width={BAR_WIDTH} height={CHART_HEIGHT} fill="transparent" />
                {segments.map((seg, si) => (
                  <rect
                    key={si}
                    x={x}
                    y={seg.y + (si === segments.length - 1 ? 0 : 1)}
                    width={BAR_WIDTH}
                    height={Math.max(0, seg.h - (si === segments.length - 1 ? 0 : 1))}
                    fill={seg.fill}
                    rx={si === segments.length - 1 ? CAP_RADIUS : 0}
                  />
                ))}
                <text
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT + 16}
                  fontSize={9}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                >
                  {i % 2 === 0 || days.length <= 8 ? d.shortLabel.slice(0, 5) : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && (
        <div className="mt-2 rounded-xl bg-surface border border-border px-3 py-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selected.fullLabel}</span>
            <span className="font-semibold tabular-nums">
              {formatDuration(selected.left + selected.right + selected.unknown)}
            </span>
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            Gauche {formatDuration(selected.left)} · Droit {formatDuration(selected.right)}
            {selected.unknown > 0 ? ` · Non précisé ${formatDuration(selected.unknown)}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
