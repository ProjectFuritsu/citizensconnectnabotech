import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  CloudOff,
  Download,
  FileDown,
  Info,
  PiggyBank,
  RefreshCw,
  Search,
} from "lucide-react";
import { useBudgetYear } from "../../Hooks/useBudgetYear";
import { BudgetService } from "../../Services/BudgetServices/BudgetService";
import Custom_SectionHeader from "../../Widgets/custom_SectionHeader";
import { formatPercent, formatPeso, formatPesoCompact, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import JsonLd from "../../SEO/JsonLd";
import { breadcrumbSchema } from "../../SEO/schema";
import { DivergingBars, DonutChart, Meter, PairedBars, YearsChart } from "./components/BudgetCharts";
import BudgetTable from "./components/BudgetTable";

// Data: src/Data/Budget (one JSON file per year), from the Commission on
// Audit's Annual Audit Reports. See src/Data/Budget/README.md.
const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "spending", label: "Spending lines" },
  { id: "revenue", label: "Revenue" },
  { id: "table", label: "Table view" },
];

const signedPercent = (x) => `${x >= 0 ? "+" : "−"}${formatPercent(Math.abs(x))}`;

const matches = (row, term) =>
  !term || `${row.key} ${row.label}`.toLowerCase().includes(term);

export default function BudgetPage() {
  usePageMeta({
    title: "Budget Transparency",
    description:
      "Panabo City's budget and actual spending by year, from the Commission on Audit's Annual Audit Reports: where the money came from, where it went, and how much of the budget was used.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const years = BudgetService.years; // every year's headline figures, newest first
  const [query, setQuery] = useState("");

  // Year and tab live in the URL (/budget?year=2023&view=revenue) so views can be shared
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = years.find((y) => y.year === Number(searchParams.get("year"))) ?? years[0] ?? null;
  // Only the selected year's lines are loaded. While another year loads,
  // `year` is still the one on screen.
  const { status, data: year, error, retry } = useBudgetYear(selected?.year);
  const view = VIEWS.some((v) => v.id === searchParams.get("view"))
    ? searchParams.get("view")
    : "overview";
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => next.set(k, String(v)));
    setSearchParams(next, { replace: true });
  };

  const downloadCsv = () => {
    // Leading BOM so Excel opens the peso sign and accents correctly
    const blob = new Blob(["\uFEFF" + BudgetService.toCsv(year)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `panabo-city-budget-${year.year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Budget Transparency", path: "/budget" },
        ])}
      />

      {/* Header */}
      <section className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
            <Link to="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <span aria-current="page" className="font-medium text-ink">
              Budget Transparency
            </span>
          </nav>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">Budget Transparency</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted text-pretty">
            How Panabo City planned to spend, what it actually spent, and where the money came
            from, year by year.
          </p>

          {selected && (
            <>
              {/* Controls: one row that scopes everything below */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <div role="group" aria-label="Choose a year" className="flex flex-wrap gap-2">
                  {years.map((y) => {
                    const active = y.year === selected.year;
                    return (
                      <button
                        key={y.year}
                        type="button"
                        onClick={() => update({ year: y.year })}
                        aria-pressed={active}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold tabular-nums transition-colors ${
                          active
                            ? "border-brand-200 bg-brand-50 text-brand-700"
                            : "border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700"
                        }`}
                      >
                        {y.year}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={downloadCsv}
                  disabled={status !== "ready"}
                  className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-brand-300 hover:text-brand-700 transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download size={16} />
                  Download {selected.year} CSV
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-line">
                <div role="group" aria-label="Choose a view" className="-mb-px flex gap-1 overflow-x-auto no-scrollbar">
                  {VIEWS.map((v) => {
                    const active = v.id === view;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => update({ view: v.id })}
                        aria-pressed={active}
                        className={`shrink-0 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
                          active
                            ? "border-brand-600 text-brand-700"
                            : "border-transparent text-muted hover:text-ink"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
                {view !== "overview" && (
                  <div className="relative mb-2 w-full sm:w-72">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search budget lines"
                      placeholder="Search lines, e.g. Capital Outlay"
                      className="w-full rounded-control border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Only before the first year has loaded; after that, switching years
            keeps the current one on screen (dimmed if it takes a moment) */}
        {status === "loading" && !year && (
          <div role="status" className="mt-10 flex items-center justify-center gap-3 rounded-card border border-line bg-surface px-6 py-16 text-sm text-muted">
            <RefreshCw size={18} className="animate-spin text-subtle motion-reduce:animate-none" />
            Loading budget data…
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="mt-10 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
            <CloudOff size={32} className="mx-auto text-subtle" />
            <h2 className="mt-3 text-lg font-semibold">Couldn't load the budget data</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Please check your connection and try again. You can also read the official reports
              linked below.
            </p>
            <p className="mt-2 text-xs text-subtle">{error?.message}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {status !== "error" && year && (
          <div
            aria-busy={status === "loading"}
            className={status === "loading" ? "opacity-60 transition-opacity delay-150" : undefined}
          >
            <p className="flex items-start gap-2 pt-6 text-sm text-muted">
              <Info size={16} className="mt-0.5 shrink-0 text-subtle" />
              <span>
                Source: {year.source}. The final budget includes supplemental budgets and
                realignments approved during the year.
                {year.sourceDocumentUrl && (
                  <a
                    href={year.sourceDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                  >
                    <FileDown size={14} />
                    Download the original report
                  </a>
                )}
              </span>
            </p>
            {view === "overview" && (
              <OverviewView
                year={year}
                years={years}
                previous={BudgetService.getPreviousYear(year.year)}
                onSelectYear={(y) => update({ year: y })}
              />
            )}
            {view === "spending" && <SpendingView year={year} term={query.trim().toLowerCase()} />}
            {view === "revenue" && <RevenueView year={year} term={query.trim().toLowerCase()} />}
            {view === "table" && <TableView year={year} term={query.trim().toLowerCase()} />}
          </div>
        )}

        {!selected && (
          <div className="mt-10 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
            <PiggyBank size={32} className="mx-auto text-subtle" />
            <h2 className="mt-3 text-lg font-semibold">No budget figures posted yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Figures will appear here, year by year, once they're added from official reports.
            </p>
          </div>
        )}

        <OfficialSources sources={BudgetService.sources} />
      </div>
    </div>
  );
}

// --- Shared bits ---

const Panel = ({ title, desc, children }) => (
  <section className="pt-10 md:pt-12">
    <Custom_SectionHeader title={title} desc={desc} />
    <div className="mt-6 rounded-card border border-line bg-surface p-5 md:p-6">{children}</div>
  </section>
);

// Headline figure: compact for reading, exact peso amount underneath
const StatTile = ({ label, value, exact, note, children }) => (
  <div className="bg-surface px-5 py-4">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="mt-1 text-3xl font-semibold">{value}</dd>
    {exact && <dd className="mt-0.5 text-xs text-muted tabular-nums">{exact}</dd>}
    {note && <dd className="mt-0.5 text-xs text-muted">{note}</dd>}
    {children}
  </div>
);

// --- Overview ---

function OverviewView({ year, years, previous, onSelectYear }) {
  const { budget, revenue, totalSpending, continuing, surplus } = year;
  const spentChange = previous ? (budget.actual - previous.budget.actual) / previous.budget.actual : null;

  return (
    <>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Final budget"
          value={formatPesoCompact(budget.final)}
          exact={formatPeso(budget.final)}
          note={`Original ${formatPesoCompact(budget.original)} · ${signedPercent(budget.change / budget.original)} during the year`}
        />
        <StatTile
          label="Spent"
          value={formatPesoCompact(budget.actual)}
          exact={formatPeso(budget.actual)}
          note={spentChange != null ? `${signedPercent(spentChange)} vs ${previous.year}` : "First year on record"}
        />
        <StatTile
          label="Unspent"
          value={formatPesoCompact(budget.unspent)}
          exact={formatPeso(budget.unspent)}
          note="Final budget minus spending"
        />
        <StatTile label="Budget used" value={formatPercent(budget.used)} note="Share of the final budget spent">
          <Meter value={budget.used} fillClass="bg-expense" trackClass="bg-budget/50" label="Budget used" />
        </StatTile>
        <StatTile
          label="Revenue collected"
          value={formatPesoCompact(revenue.actual)}
          exact={formatPeso(revenue.actual)}
          note={`Target ${formatPesoCompact(revenue.final)}`}
        />
        <StatTile label="Revenue vs target" value={formatPercent(revenue.collected)} note="Share of the revenue target collected">
          <Meter value={revenue.collected} fillClass="bg-revenue" trackClass="bg-revenue-target/50" label="Revenue vs target" />
        </StatTile>
        <StatTile
          label="Total spending"
          value={formatPesoCompact(totalSpending.actual)}
          exact={formatPeso(totalSpending.actual)}
          note={continuing ? `Incl. ${formatPesoCompact(continuing.actual)} from earlier years' budgets` : null}
        />
        <StatTile
          label={surplus < 0 ? "Deficit" : "Surplus"}
          value={formatPesoCompact(Math.abs(surplus))}
          exact={formatPeso(Math.abs(surplus))}
          note="Revenue collected minus total spending"
        />
      </dl>

      <Panel
        title="Budget vs spending by sector"
        desc={`This year's budget (current appropriations) for ${year.year}, and how much of it was spent.`}
      >
        <PairedBars
          rows={year.sectors.map((s) => ({ ...s, label: s.name }))}
          budgetClass="bg-budget"
          actualClass="bg-expense"
          budgetLabel="Final budget"
          actualLabel="Spent"
          actualVerb="spent"
        />
      </Panel>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Panel title="Where the money went" desc={`Spending by sector in ${year.year}.`}>
          <DonutChart
            items={year.sectors.map((s) => ({ key: s.key, name: s.name, value: s.actual }))}
            total={budget.actual}
            centerLabel="Spent"
          />
        </Panel>
        {years.length > 1 && (
          <Panel title="Revenue and spending over the years" desc="Select a year to see its details.">
            <YearsChart years={years} selected={year.year} onSelect={onSelectYear} />
          </Panel>
        )}
      </div>

      <Panel
        title="Budget changes during the year"
        desc="How much each sector's budget was raised or cut from the original, through supplemental budgets and realignments."
      >
        <DivergingBars
          rows={year.sectors.map((s) => ({ ...s, label: s.name }))}
          emptyText={`No sector budgets changed during ${year.year}.`}
        />
      </Panel>
    </>
  );
}

// --- Spending lines ---

function SpendingView({ year, term }) {
  const lines = year.spendingLines.filter((l) => matches(l, term)).sort((a, b) => b.final - a.final);
  const continuing = year.continuingSectors;
  return (
    <>
      <Panel
        title={`All budget lines (${lines.length})`}
        desc="Every line of this year's budget: the final budget and how much was spent."
      >
        <PairedBars
          rows={lines}
          budgetClass="bg-budget"
          actualClass="bg-expense"
          budgetLabel="Final budget"
          actualLabel="Spent"
          actualVerb="spent"
          emptyText={`No budget line matches “${term}”.`}
        />
      </Panel>

      <Panel
        title={`Lines changed during the year (${lines.filter((l) => Math.round(l.change) !== 0).length})`}
        desc="Raised or cut from the original budget."
      >
        <DivergingBars rows={lines} emptyText={term ? `No changed line matches “${term}”.` : "No lines changed."} />
      </Panel>

      {year.continuing && (
        <Panel
          title="Carried over from earlier years"
          desc="Continuing appropriations: budgets from earlier years that could still be spent this year."
        >
          {year.continuingItemized ? (
            <PairedBars
              rows={continuing.map((s) => ({ ...s, label: s.name }))}
              budgetClass="bg-budget"
              actualClass="bg-expense"
              budgetLabel="Final budget"
              actualLabel="Spent"
              actualVerb="spent"
            />
          ) : (
            <p className="text-sm text-muted">
              The {year.year} report gives only the total:{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatPeso(year.continuing.actual)}
              </span>{" "}
              spent of{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatPeso(year.continuing.final)}
              </span>{" "}
              ({formatPercent(year.continuing.actual / year.continuing.final, 0)}).
            </p>
          )}
        </Panel>
      )}
    </>
  );
}

// --- Revenue ---

function RevenueView({ year, term }) {
  const lines = year.revenueLines.filter((l) => matches(l, term)).sort((a, b) => b.final - a.final || b.actual - a.actual);
  return (
    <>
      <Panel title="Revenue by category" desc={`Target (final budget) and amount collected in ${year.year}.`}>
        <PairedBars
          rows={year.revenueCategories.map((c) => ({ ...c, label: c.name }))}
          budgetClass="bg-revenue-target"
          actualClass="bg-revenue"
          budgetLabel="Target"
          actualLabel="Collected"
          actualVerb="collected"
        />
      </Panel>
      <Panel
        title={`Revenue by source (${lines.length})`}
        desc="Includes loan proceeds (Receipts from Borrowings) where the report lists them."
      >
        <PairedBars
          rows={lines}
          budgetClass="bg-revenue-target"
          actualClass="bg-revenue"
          budgetLabel="Target"
          actualLabel="Collected"
          actualVerb="collected"
          emptyText={`No revenue source matches “${term}”.`}
        />
      </Panel>
    </>
  );
}

// --- Table view ---

function TableView({ year, term }) {
  const spending = year.spendingLines.filter((l) => matches(l, term));
  const revenue = year.revenueLines.filter((l) => matches(l, term));
  return (
    <>
      <section className="pt-10 md:pt-12">
        <Custom_SectionHeader
          title={`Spending, ${year.year}`}
          desc={`${pluralize(spending.length, "line")} of this year's budget (current appropriations). Click a column to sort.`}
        />
        <div className="mt-6">
          <BudgetTable
            caption={`Spending lines, ${year.year}`}
            rows={spending}
            totals={term ? null : year.budget}
          />
        </div>
      </section>
      <section className="pt-10 md:pt-12">
        <Custom_SectionHeader title={`Revenue, ${year.year}`} desc={`${pluralize(revenue.length, "line")}.`} />
        <div className="mt-6">
          <BudgetTable
            caption={`Revenue lines, ${year.year}`}
            rows={revenue}
            totals={term ? null : year.revenue}
            actualLabel="Collected"
          />
        </div>
      </section>
    </>
  );
}

// --- Official sources (always shown, from src/Data/Budget/sources.json) ---

function OfficialSources({ sources }) {
  if (sources.length === 0) return null;
  return (
    <section className="pt-10 md:pt-12">
      <Custom_SectionHeader title="Official sources" desc="Read the original reports for yourself." />
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full gap-4 rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
            >
              <div className="grow">
                <p className="font-semibold group-hover:text-brand-700 transition-colors">{source.name}</p>
                {source.description && <p className="mt-1 text-sm text-muted">{source.description}</p>}
              </div>
              <ArrowUpRight size={16} className="shrink-0 text-faint group-hover:text-brand-600 transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
