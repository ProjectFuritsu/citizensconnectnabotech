import ShowMore from "../../../Components/ShowMore";
import { useShowMore } from "../../../Hooks/useShowMore";
import { SortHeader, Table } from "../../../Components/Table";
import { useSort } from "../../../Hooks/useSort";
import { formatPeso, pluralize } from "../../../Theme/display";

const PAGE_SIZE = 25;

const COLUMNS = [
  { key: "name", label: "Supplier", align: "left" },
  { key: "place", label: "Based in", align: "left" },
  { key: "count", label: "Contracts" },
  { key: "value", label: "Contract amount" },
];

// Winning suppliers with their contracts, largest total first; sortable.
// Shows 25 rows at a time; the parent gives it a new `key` when filters change.
export default function SupplierTable({ suppliers, caption }) {
  const { sorted, sort, toggle } = useSort(suppliers, { key: "value", dir: "desc" }, ["name", "place"]);
  const { shown, showMore } = useShowMore(PAGE_SIZE);

  return (
    <>
      <Table caption={caption} minWidth="min-w-[44rem]">
        <SortHeader columns={COLUMNS} sort={sort} onSort={toggle} />
        <tbody className="divide-y divide-line tabular-nums">
          {sorted.slice(0, shown).map((s) => (
            <tr key={s.key} className="hover:bg-canvas">
              <td className="px-4 py-2.5 text-left">
                <span className="font-medium">{s.name ?? "—"}</span>
                <span className="block text-xs text-muted">
                  {s.offices.length === 1 ? s.offices[0] : pluralize(s.offices.length, "office")}
                </span>
              </td>
              <td className="px-4 py-2.5 text-left text-ink-soft">{s.place}</td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-soft">{s.count}</td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium">{formatPeso(s.value)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <ShowMore shown={shown} total={sorted.length} noun="supplier" pageSize={PAGE_SIZE} onMore={showMore} />
    </>
  );
}
