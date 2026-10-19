import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatPercent, formatPeso } from "../../../Theme/display";

// Signed peso amount, e.g. "+₱66,685,000" / "−₱2,868,506"
const signed = (n) =>
  Math.round(n) === 0 ? "₱0" : `${n > 0 ? "+" : "−"}${formatPeso(Math.abs(n))}`;

const COLUMNS = [
  { key: "label", label: "Line", align: "left" },
  { key: "original", label: "Original budget" },
  { key: "final", label: "Final budget" },
  { key: "change", label: "Change during year" },
  { key: "actual", label: "Actual" },
  { key: "unspent", label: "Final − actual" },
  { key: "used", label: "Used" },
];

/**
 * Every line of a year, like the audit report's statement, with sortable
 * columns and the report's own totals at the bottom
 */
export default function BudgetTable({ caption, rows, totals, actualLabel = "Actual" }) {
  const [sort, setSort] = useState({ key: "final", dir: "desc" });

  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key] ?? -Infinity;
    const bv = b[sort.key] ?? -Infinity;
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const toggle = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "label" ? "asc" : "desc" },
    );

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wider text-muted">
            <tr>
              {COLUMNS.map((col) => {
                const active = sort.key === col.key;
                const Icon = sort.dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={`px-4 py-3 font-semibold ${col.align === "left" ? "text-left" : "text-right"}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(col.key)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-ink ${active ? "text-ink" : ""}`}
                    >
                      {col.key === "actual" ? actualLabel : col.label}
                      {active && <Icon size={12} />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {sorted.map((row) => (
              <tr key={row.key} className="hover:bg-canvas">
                <td className="px-4 py-2.5 text-left">
                  <span className="font-medium">{row.label}</span>
                  {row.context && <span className="block text-xs text-muted">{row.context}</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-soft">{formatPeso(row.original)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">{formatPeso(row.final)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-soft">{signed(row.change)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium">{formatPeso(row.actual)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-soft">{signed(row.unspent)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted">
                  {row.used != null ? formatPercent(row.used, 0) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot className="border-t-2 border-line bg-canvas font-semibold tabular-nums">
              <tr>
                <td className="px-4 py-3 text-left">Total (as reported)</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatPeso(totals.original)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatPeso(totals.final)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{signed(totals.final - totals.original)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatPeso(totals.actual)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{signed(totals.final - totals.actual)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {totals.final ? formatPercent(totals.actual / totals.final, 0) : "—"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
