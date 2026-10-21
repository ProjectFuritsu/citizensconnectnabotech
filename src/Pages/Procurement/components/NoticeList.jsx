import { useState } from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "../../../Components/Controls";
import ShowMore from "../../../Components/ShowMore";
import { useShowMore } from "../../../Hooks/useShowMore";
import { EmptyState } from "../../../Components/States";
import { useYearData } from "../../../Hooks/useYearData";
import { officeTypeLabel, ProcurementService, STATUSES } from "../../../Services/ProcurementService";
import { formatDate, formatPeso, pluralize } from "../../../Theme/display";

const PAGE_SIZE = 20;

// Notices, newest first, each with its awards. Shows 20 at a time; the parent
// gives it a new `key` when filters change, so the list starts over.
export default function NoticeList({ notices, year, onClear, filtered }) {
  const { shown, showMore } = useShowMore(PAGE_SIZE);

  if (notices.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="No notices match"
        action={filtered && <Button onClick={onClear}>Clear filters</Button>}
      >
        Try other words, or another quarter or office.
      </EmptyState>
    );
  }

  return (
    <>
      <ul className="mt-6 space-y-3">
        {notices.slice(0, shown).map((n) => (
          <NoticeCard key={n.id} notice={n} year={year} />
        ))}
      </ul>
      <ShowMore shown={shown} total={notices.length} noun="notice" pageSize={PAGE_SIZE} onMore={showMore} />
    </>
  );
}

function NoticeCard({ notice: n, year }) {
  return (
    <li className="rounded-card border border-line bg-surface p-4 md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0">
          <p className="font-semibold break-words">{n.title}</p>
          <p className="mt-1 text-sm text-muted break-words">
            {n.office} · {officeTypeLabel(n.officeType)}
          </p>
        </div>
        <div className="shrink-0 md:text-right">
          <p className="text-lg font-semibold tabular-nums">
            {n.approvedBudget != null ? formatPeso(n.approvedBudget) : "—"}
          </p>
          <p className="text-xs text-muted">Approved budget</p>
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <div>
          <dt className="sr-only">Status</dt>
          <dd
            title={STATUSES[n.status]?.about}
            className="rounded-full border border-line bg-canvas px-2 py-0.5 font-medium text-ink-soft"
          >
            {n.statusLabel}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt>Method:</dt>
          <dd className="text-ink-soft">{n.method.label}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Funding:</dt>
          <dd className="text-ink-soft">{n.fundingInfo.label}</dd>
        </div>
        {n.funder && (
          <div className="flex gap-1">
            <dt>Funding source:</dt>
            <dd className="text-ink-soft">{n.funder}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt>Posted:</dt>
          <dd className="text-ink-soft tabular-nums">{n.published ? formatDate(n.published) : "—"}</dd>
        </div>
        {n.reference && (
          <div className="flex gap-1">
            <dt>PhilGEPS ref.</dt>
            <dd className="text-ink-soft tabular-nums">{n.reference}</dd>
          </div>
        )}
      </dl>

      {n.awards.length > 0 && (
        <ul className="mt-3 divide-y divide-line rounded-control bg-canvas px-3">
          {n.awards.map((a) => (
            <li key={a.reference} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
              <p className="min-w-0 break-words">
                <span className="text-muted">Won by </span>
                <span className="font-medium">{a.supplier ?? "—"}</span>
                {a.supplierCity && <span className="text-muted"> · {a.supplierCity}</span>}
              </p>
              <p className="tabular-nums">
                <span className="font-semibold">{a.amount != null ? formatPeso(a.amount) : "—"}</span>
                <span className="text-muted"> · {a.awardDate ? `awarded ${formatDate(a.awardDate)}` : "award date not given"}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
      {n.status === "Awarded" && n.awards.length === 0 && (
        <p className="mt-3 text-xs text-muted">Marked as awarded, but the winner and amount are not in this data.</p>
      )}

      <Items notice={n} year={year} />

      <p className="mt-3 text-xs text-subtle">
        Source: PhilGEPS {n.quarter} {year} file, row {n.row}
      </p>
    </li>
  );
}

// --- Line items: closed by default; the year's items load the first time one is opened ---

function Items({ notice, year }) {
  const [open, setOpen] = useState(false);

  if (notice.lineItems === 0) {
    return <p className="mt-3 text-xs text-muted">No item details in this data.</p>;
  }
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)} className="group mt-3 border-t border-line pt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 [&::-webkit-details-marker]:hidden">
        <ChevronRight size={16} className="transition-transform group-open:rotate-90 motion-reduce:transition-none" />
        {open ? "Hide" : "Show"} {pluralize(notice.lineItems, "item")}
      </summary>
      {open && <ItemList year={year} itemsKey={ProcurementService.itemsKey(notice)} />}
    </details>
  );
}

const quantityOf = (item) =>
  item.quantity == null ? "Quantity not given" : `${item.quantity.toLocaleString("en-US")} ${item.unit ?? ""}`.trim();

function ItemList({ year, itemsKey }) {
  const { status, data, retry } = useYearData(ProcurementService.loadItems, year);

  if (status === "loading") {
    return (
      <p role="status" className="mt-3 flex items-center gap-2 text-sm text-muted">
        <RefreshCw size={14} className="animate-spin text-subtle motion-reduce:animate-none" />
        Loading items…
      </p>
    );
  }
  if (status === "error") {
    return (
      <p role="alert" className="mt-3 text-sm text-muted">
        Couldn't load the items.{" "}
        <button
          type="button"
          onClick={retry}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Try again
        </button>
      </p>
    );
  }

  const items = data[itemsKey] ?? [];
  const noDescriptions = items.every((it) => it.description == null);
  return (
    <>
      <ol className="mt-3 divide-y divide-line rounded-control border border-line">
        {items.map((it, i) => (
          <li key={i} className="grid gap-1 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
            <div className="min-w-0">
              <p className="font-medium break-words">
                {it.no != null && <span className="text-muted tabular-nums">{it.no}. </span>}
                {it.name ?? "Item name not given"}
              </p>
              {it.description != null && it.description !== it.name && (
                <p className="mt-0.5 text-muted break-words whitespace-pre-line">{it.description}</p>
              )}
            </div>
            <p className="text-ink-soft tabular-nums sm:text-right">
              {quantityOf(it)}
              <span className="block text-xs text-muted">
                Item budget: {it.budget != null ? formatPeso(it.budget) : "not given"}
              </span>
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted">
        As listed in PhilGEPS.{noDescriptions && " No item descriptions are given for this notice."}
      </p>
    </>
  );
}
