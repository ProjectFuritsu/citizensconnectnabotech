// Charts for the Budget Transparency page. Plain HTML/SVG; colors come from
// the validated chart tokens in src/Theme/theme.css (see DESIGN.md). Every
// value is also shown as text, so nothing depends on color or hover alone.
import { useState } from "react";
import { formatPercent, formatPeso, formatPesoCompact } from "../../../Theme/display";

const width = (value, max) =>
  value > 0 ? `${Math.max((value / max) * 100, 0.75)}%` : "0%";

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

// --- Paired bars: budgeted vs actual, one row per sector / line ---
export function PairedBars({
  rows,
  budgetClass,
  actualClass,
  budgetLabel,
  actualLabel,
  actualVerb,
  emptyText = "Nothing to show.",
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;
  const max = Math.max(...rows.flatMap((r) => [r.final, r.actual]), 1);
  return (
    <>
      <Legend
        items={[
          { label: budgetLabel, className: budgetClass },
          { label: actualLabel, className: actualClass },
        ]}
      />
      <ul className="mt-5 divide-y divide-line">
        {rows.map((row) => (
          <li
            key={row.key}
            className="py-3 first:pt-0 last:pb-0"
            title={`${row.label}: ${budgetLabel.toLowerCase()} ${formatPeso(row.final)}, ${actualLabel.toLowerCase()} ${formatPeso(row.actual)}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
              <p className="min-w-0">
                <span className="font-medium">{row.label}</span>
                {row.context && <span className="text-muted"> · {row.context}</span>}
              </p>
              <p className="tabular-nums">
                <span className="font-semibold">{formatPesoCompact(row.actual)}</span>
                <span className="text-muted">
                  {row.final > 0
                    ? ` ${actualVerb} of ${formatPesoCompact(row.final)} · ${formatPercent(row.used, 0)}`
                    : ` ${actualVerb} · not budgeted`}
                </span>
              </p>
            </div>
            <div className="mt-2 space-y-0.5" aria-hidden="true">
              <div className={`h-2 rounded-r ${budgetClass}`} style={{ width: width(row.final, max) }} />
              <div className={`h-2 rounded-r ${actualClass}`} style={{ width: width(row.actual, max) }} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

// --- Diverging bars: raised (+) right of the axis, cut (−) left ---
export function DivergingBars({ rows, emptyText = "No changes." }) {
  const changed = rows.filter((r) => Math.round(r.change) !== 0).sort((a, b) => b.change - a.change);
  if (changed.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;
  const max = Math.max(...changed.map((r) => Math.abs(r.change)), 1);
  const half = (v) => `${Math.max((Math.abs(v) / max) * 50, 0.5)}%`;
  return (
    <>
      <Legend
        items={[
          { label: "Raised during the year", className: "bg-increase" },
          { label: "Cut during the year", className: "bg-decrease" },
        ]}
      />
      <ul className="mt-5 space-y-3">
        {changed.map((row) => {
          const up = row.change > 0;
          return (
            <li
              key={row.key}
              className="grid gap-1 text-sm md:grid-cols-[minmax(0,15rem)_1fr_7rem] md:items-center md:gap-4"
            >
              <p className="min-w-0">
                <span className="font-medium">{row.label}</span>
                {row.context && <span className="block text-xs text-muted">{row.context}</span>}
              </p>
              <div className="relative h-5" aria-hidden="true">
                <div className="absolute inset-y-0 left-1/2 w-px bg-faint" />
                <div
                  className={`absolute top-1/2 h-2.5 -translate-y-1/2 ${up ? "left-1/2 rounded-r bg-increase" : "right-1/2 rounded-l bg-decrease"}`}
                  style={{ width: half(row.change) }}
                />
              </div>
              <p className="tabular-nums md:text-right">
                <span className="font-semibold">
                  {up ? "+" : "−"}
                  {formatPesoCompact(Math.abs(row.change))}
                </span>
                <span className="text-muted md:hidden"> {up ? "raised" : "cut"}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}

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
              <span className="font-semibold">{formatPercent(s.value / total, 0)}</span>
              <span className="text-muted"> · {formatPesoCompact(s.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Years: revenue collected vs total spending, oldest to newest ---
// Axis with clean steps (1, 2, 2.5 or 5 × 10ⁿ): the smallest step that
// covers the data in at most 6 gridlines, so bars use most of the height
const niceScale = (max, maxSteps = 6) => {
  if (!max) return { top: 1, ticks: [0] };
  const magnitude = 10 ** Math.floor(Math.log10(max / maxSteps));
  const step = [1, 2, 2.5, 5, 10, 20]
    .map((m) => m * magnitude)
    .find((s) => Math.ceil(max / s) <= maxSteps);
  const steps = Math.ceil(max / step);
  return { top: step * steps, ticks: Array.from({ length: steps + 1 }, (_, i) => i * step) };
};

export function YearsChart({ years, selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const chronological = [...years].reverse();
  const max = Math.max(...chronological.flatMap((y) => [y.revenue.actual, y.totalSpending.actual]));
  const { top, ticks } = niceScale(max);
  const pct = (v) => `${((v ?? 0) / top) * 100}%`;

  return (
    <>
      <Legend
        items={[
          { label: "Revenue collected", className: "bg-revenue" },
          { label: "Total spending", className: "bg-expense" },
        ]}
      />
      <div className="mt-6 flex">
        <div className="relative h-56 w-16 shrink-0 text-right text-xs text-muted tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="absolute right-3 translate-y-1/2" style={{ bottom: pct(t) }}>
              {t === 0 ? "₱0" : formatPesoCompact(t)}
            </span>
          ))}
        </div>
        <div className="relative h-56 grow">
          {ticks.map((t) => (
            <div key={t} aria-hidden="true" className="absolute inset-x-0 h-px bg-line" style={{ bottom: pct(t) }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around">
            {chronological.map((y) => {
              const isSelected = y.year === selected;
              return (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => onSelect(y.year)}
                  onMouseEnter={() => setHovered(y.year)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(y.year)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={isSelected}
                  aria-label={`${y.year}: revenue collected ${formatPeso(y.revenue.actual)}, total spending ${formatPeso(y.totalSpending.actual)}`}
                  className={`relative flex h-full items-end justify-center gap-0.5 rounded-t-control px-2 sm:px-4 transition-colors ${isSelected ? "bg-canvas" : "hover:bg-canvas/60"}`}
                >
                  <span className="w-4 rounded-t bg-revenue sm:w-6" style={{ height: pct(y.revenue.actual) }} />
                  <span className="w-4 rounded-t bg-expense sm:w-6" style={{ height: pct(y.totalSpending.actual) }} />
                  {hovered === y.year && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-3 py-2 text-left text-xs text-white shadow-lg"
                    >
                      <span className="block font-semibold">{y.year}</span>
                      <TooltipRow color="bg-revenue" label="Revenue collected" value={y.revenue.actual} />
                      <TooltipRow color="bg-expense" label="Total spending" value={y.totalSpending.actual} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-16 mt-2 flex justify-around text-xs tabular-nums">
        {chronological.map((y) => (
          <span key={y.year} className={y.year === selected ? "font-semibold text-ink" : "text-muted"}>
            {y.year}
          </span>
        ))}
      </div>

      <details className="mt-5 border-t border-line pt-4 text-sm">
        <summary className="cursor-pointer font-medium text-brand-600 hover:text-brand-700">
          View as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-4 font-semibold">Year</th>
                <th className="py-2 pr-4 text-right font-semibold">Revenue collected</th>
                <th className="py-2 pr-4 text-right font-semibold">Total spending</th>
                <th className="py-2 text-right font-semibold">Surplus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {years.map((y) => (
                <tr key={y.year}>
                  <td className="py-2 pr-4">{y.year}</td>
                  <td className="py-2 pr-4 text-right">{formatPeso(y.revenue.actual)}</td>
                  <td className="py-2 pr-4 text-right">{formatPeso(y.totalSpending.actual)}</td>
                  <td className="py-2 text-right">{formatPeso(y.surplus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

// Tooltip row: value leads, label follows, keyed by a short line of the series color
const TooltipRow = ({ color, label, value }) => (
  <span className="mt-1 flex items-center gap-2">
    <span className={`h-0.5 w-3 rounded-full ${color}`} />
    <span className="font-semibold tabular-nums">{formatPeso(value)}</span>
    <span className="text-white/70">{label}</span>
  </span>
);
