import { ArrowDown, ArrowUp } from "lucide-react";

// Data tables (DESIGN.md "Data table"): a bordered card that scrolls sideways
// on small screens, with columns you can click to sort (sorting: useSort() in src/Hooks)

// `minWidth` is a Tailwind class, e.g. "min-w-[44rem]"
export const Table = ({ caption, minWidth, children }) => (
  <div className="overflow-hidden rounded-card border border-line bg-surface">
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${minWidth}`}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  </div>
);

// Header row: each column is a button that sorts by it.
// columns: [{ key, label, align: "left" | "right" (default) }]
export const SortHeader = ({ columns, sort, onSort }) => {
  const Arrow = sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wider text-muted">
      <tr>
        {columns.map((col) => {
          const active = sort.key === col.key;
          return (
            <th
              key={col.key}
              scope="col"
              aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              className={`px-4 py-3 font-semibold ${col.align === "left" ? "text-left" : "text-right"}`}
            >
              <button
                type="button"
                onClick={() => onSort(col.key)}
                className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {col.label}
                {active && <Arrow size={12} />}
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
