// Charts only the Budget page uses. Shared ones (Legend, Meter, DonutChart)
// are in src/Components/Charts.jsx; colors come from the chart tokens in
// src/Theme/theme.css (see DESIGN.md). Every value is also shown as text.
import { useState } from "react";
import { barWidth, formatPercent, formatPeso, formatPesoCompact } from "../../../Theme/display";
import { Legend } from "../../../Components/Charts";

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
              <div className={`h-2 rounded-r ${budgetClass}`} style={{ width: barWidth(row.final, max) }} />
              <div className={`h-2 rounded-r ${actualClass}`} style={{ width: barWidth(row.actual, max) }} />
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
