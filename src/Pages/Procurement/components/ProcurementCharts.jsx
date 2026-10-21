// Charts for the Procurement Transparency page. Plain HTML; colors come from
// the chart tokens in src/Theme/theme.css (see DESIGN.md): orange is money
// out, light for approved budgets and dark for contract amounts. Every value
// is also shown as text, so nothing depends on color alone.
import { Legend } from "../../../Components/Charts";
import { barWidth, formatPeso, formatPesoCompact, formatShare, pluralize } from "../../../Theme/display";

// --- One bar per row, e.g. approved budgets by category or contracts by supplier ---
export function ShareBars({ rows, barClass, countWord, total, emptyText = "Nothing to show." }) {
  if (rows.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key} className="py-3 first:pt-0 last:pb-0" title={`${row.label}: ${formatPeso(row.value)}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
            <p className="min-w-0 break-words">
              <span className="font-medium">{row.label}</span>
              {row.context && <span className="text-muted"> · {row.context}</span>}
            </p>
            <p className="tabular-nums">
              <span className="font-semibold">{formatPesoCompact(row.value)}</span>
              {total > 0 && <span className="text-muted"> · {formatShare(row.value / total)}</span>}
              {countWord && <span className="text-muted"> · {pluralize(row.count, countWord)}</span>}
            </p>
          </div>
          <div className="mt-2" aria-hidden="true">
            <div className={`h-2 rounded-r ${barClass}`} style={{ width: barWidth(row.value, max) }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Counts, e.g. notices by status; a neutral data bar ---
export function CountBars({ rows, total, countWord }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
            <p className="min-w-0">
              <span className="font-medium">{row.label}</span>
              {row.about && <span className="block text-xs text-muted">{row.about}</span>}
            </p>
            <p className="tabular-nums">
              <span className="font-semibold">{pluralize(row.count, countWord)}</span>
              {total > 0 && <span className="text-muted"> · {formatShare(row.count / total)}</span>}
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-600" style={{ width: barWidth(row.count, max) }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Quarters: approved budgets of the notices posted, and contracts awarded ---
export function QuarterBars({ rows, quarters, showAwards }) {
  const max = Math.max(...rows.flatMap((r) => [r.approvedBudget, showAwards ? r.contractAmount : 0]), 1);
  return (
    <>
      {showAwards && (
        <Legend
          items={[
            { label: "Approved budgets", className: "bg-budget" },
            { label: "Contract amounts", className: "bg-expense" },
          ]}
        />
      )}
      <ul className={`divide-y divide-line ${showAwards ? "mt-5" : ""}`}>
        {rows.map((row) => {
          const inData = quarters.includes(row.key);
          return (
            <li key={row.key} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
                <p className="font-medium">{row.label}</p>
                {inData ? (
                  <p className="tabular-nums">
                    <span className="font-semibold">{formatPesoCompact(row.approvedBudget)}</span>
                    <span className="text-muted"> approved · {pluralize(row.count, "notice")}</span>
                    {showAwards && (
                      <>
                        <span className="text-muted"> · </span>
                        <span className="font-semibold">{formatPesoCompact(row.contractAmount)}</span>
                        <span className="text-muted"> awarded</span>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-muted">Not in the data yet</p>
                )}
              </div>
              {inData && (
                <div className="mt-2 space-y-0.5" aria-hidden="true">
                  <div className="h-2 rounded-r bg-budget" style={{ width: barWidth(row.approvedBudget, max) }} />
                  {showAwards && (
                    <div className="h-2 rounded-r bg-expense" style={{ width: barWidth(row.contractAmount, max) }} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
