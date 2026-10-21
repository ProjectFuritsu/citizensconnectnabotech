import { SortHeader, Table } from "../../../Components/Table";
import { useSort } from "../../../Hooks/useSort";
import { formatPercent, formatPeso } from "../../../Theme/display";

// Signed peso amount, e.g. "+₱66,685,000" / "−₱2,868,506"
const signed = (n) => (Math.round(n) === 0 ? "₱0" : `${n > 0 ? "+" : "−"}${formatPeso(Math.abs(n))}`);

const COLUMNS = [
  { key: "label", label: "Line", align: "left" },
  { key: "original", label: "Original budget" },
  { key: "final", label: "Final budget" },
  { key: "change", label: "Change during year" },
  { key: "actual", label: "Actual" },
  { key: "unspent", label: "Final − actual" },
  { key: "used", label: "Used" },
];

const cell = "whitespace-nowrap px-4 py-2.5 text-right";
const totalCell = "whitespace-nowrap px-4 py-3 text-right";

// Every line of a year, like the audit report's statement, with sortable
// columns and the report's own totals at the bottom
export default function BudgetTable({ caption, rows, totals, actualLabel = "Actual" }) {
  const { sorted, sort, toggle } = useSort(rows, { key: "final", dir: "desc" }, ["label"]);
  const columns = COLUMNS.map((col) => (col.key === "actual" ? { ...col, label: actualLabel } : col));

  return (
    <Table caption={caption} minWidth="min-w-[56rem]">
      <SortHeader columns={columns} sort={sort} onSort={toggle} />
      <tbody className="divide-y divide-line tabular-nums">
        {sorted.map((row) => (
          <tr key={row.key} className="hover:bg-canvas">
            <td className="px-4 py-2.5 text-left">
              <span className="font-medium">{row.label}</span>
              {row.context && <span className="block text-xs text-muted">{row.context}</span>}
            </td>
            <td className={`${cell} text-ink-soft`}>{formatPeso(row.original)}</td>
            <td className={cell}>{formatPeso(row.final)}</td>
            <td className={`${cell} text-ink-soft`}>{signed(row.change)}</td>
            <td className={`${cell} font-medium`}>{formatPeso(row.actual)}</td>
            <td className={`${cell} text-ink-soft`}>{signed(row.unspent)}</td>
            <td className={`${cell} text-muted`}>{row.used != null ? formatPercent(row.used, 0) : "—"}</td>
          </tr>
        ))}
      </tbody>
      {totals && (
        <tfoot className="border-t-2 border-line bg-canvas font-semibold tabular-nums">
          <tr>
            <td className="px-4 py-3 text-left">Total (as reported)</td>
            <td className={totalCell}>{formatPeso(totals.original)}</td>
            <td className={totalCell}>{formatPeso(totals.final)}</td>
            <td className={totalCell}>{signed(totals.final - totals.original)}</td>
            <td className={totalCell}>{formatPeso(totals.actual)}</td>
            <td className={totalCell}>{signed(totals.final - totals.actual)}</td>
            <td className={totalCell}>{totals.final ? formatPercent(totals.actual / totals.final, 0) : "—"}</td>
          </tr>
        </tfoot>
      )}
    </Table>
  );
}
