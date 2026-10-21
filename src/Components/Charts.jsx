// Charts used by more than one page. Plain HTML/SVG; colors come from the
// validated chart tokens in src/Theme/theme.css (see DESIGN.md "Chart colors").
// Every value is also shown as text, so nothing depends on color or hover alone.
import { useState } from "react";
import { formatPercent, formatPesoCompact, formatShare } from "../Theme/display";

// --- Legend: always shown when a chart has two or more series ---
export const Legend = ({ items }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
    {items.map((item) => (
      <li key={item.label} className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-sm ${item.className}`} />
        {item.label}
      </li>
    ))}
  </ul>
);

// --- Meter: share of a budget used; track is a lighter step of the same hue ---
export const Meter = ({ value, fillClass, trackClass, label }) => (
  <div
    role="meter"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round((value ?? 0) * 100)}
    className={`mt-3 h-1.5 overflow-hidden rounded-full ${trackClass}`}
  >
    <div
      className={`h-full rounded-full ${fillClass}`}
      style={{ width: `${Math.min((value ?? 0) * 100, 100)}%` }}
    />
  </div>
);

// --- Donut: share of a total, top 5 + the rest (<= 6 slices) ---
const SLICE_STROKES = ["stroke-slice-1", "stroke-slice-2", "stroke-slice-3", "stroke-slice-4", "stroke-slice-5"];
const SLICE_FILLS = ["bg-slice-1", "bg-slice-2", "bg-slice-3", "bg-slice-4", "bg-slice-5"];

export function DonutChart({ items, total, centerLabel }) {
  const [active, setActive] = useState(null);
  const sorted = [...items].filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, sorted.length > 6 ? 5 : 6);
  const rest = sorted.slice(top.length);
  const slices = [
    ...top.map((s, i) => ({ ...s, stroke: SLICE_STROKES[i] ?? "stroke-slice-other", fill: SLICE_FILLS[i] ?? "bg-slice-other" })),
    ...(rest.length
      ? [{ key: "other", name: `Other (${rest.length})`, value: rest.reduce((t, s) => t + s.value, 0), stroke: "stroke-slice-other", fill: "bg-slice-other" }]
      : []),
  ];

  const r = 46;
  const circumference = 2 * Math.PI * r;
  const gap = 1.5; // surface gap between slices
  let offset = 0;
  const shown = active != null ? slices[active] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          {slices.map((s, i) => {
            const length = (s.value / total) * circumference;
            const dash = Math.max(length - gap, 0.5);
            const el = (
              <circle
                key={s.key}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                strokeWidth="16"
                className={`${s.stroke} transition-opacity ${active != null && active !== i ? "opacity-30" : ""}`}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            );
            offset += length;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="max-w-[7.5rem] text-xs text-muted leading-tight">
            {shown ? shown.name : centerLabel}
          </span>
          <span className="mt-0.5 text-lg font-semibold">
            {shown ? formatPercent(shown.value / total) : formatPesoCompact(total)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2 text-sm">
        {slices.map((s, i) => (
          <li
            key={s.key}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center gap-2.5 rounded-control px-2 py-1 -mx-2 transition-colors ${active === i ? "bg-canvas" : ""}`}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${s.fill}`} />
            <span className="min-w-0 grow">{s.name}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold">{formatShare(s.value / total)}</span>
              <span className="text-muted"> · {formatPesoCompact(s.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
