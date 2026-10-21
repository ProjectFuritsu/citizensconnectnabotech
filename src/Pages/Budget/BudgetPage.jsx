import { useState } from "react";
import { Download, FileDown, PiggyBank } from "lucide-react";
import { DonutChart, Meter } from "../../Components/Charts";
import { Button, SearchInput, Tabs, YearChips } from "../../Components/Controls";
import { Container, Page, PageHeader } from "../../Components/Page";
import { Panel, Section } from "../../Components/Section";
import { SourceList, SourceNote } from "../../Components/Sources";
import { Stat, StatGrid } from "../../Components/Stat";
import { EmptyState, YearContent } from "../../Components/States";
import { useUrlState } from "../../Hooks/useUrlState";
import { useYearData } from "../../Hooks/useYearData";
import { BudgetService } from "../../Services/BudgetService";
import { downloadCsv } from "../../Services/shared/csv";
import { formatPercent, formatPeso, formatPesoCompact, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import { DivergingBars, PairedBars, YearsChart } from "./components/BudgetCharts";
import BudgetTable from "./components/BudgetTable";

// Data: src/Data/Budget (one JSON file per year), from the Commission on
// Audit's Annual Audit Reports. See src/Data/Budget/README.md and METHODOLOGY.md.
const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "spending", label: "Spending lines" },
  { id: "revenue", label: "Revenue" },
  { id: "table", label: "Table view" },
];

const years = BudgetService.years; // every year's headline figures, newest first

const signedPercent = (x) => `${x >= 0 ? "+" : "−"}${formatPercent(Math.abs(x))}`;
const matches = (row, term) => !term || `${row.key} ${row.label}`.toLowerCase().includes(term);

export default function BudgetPage() {
  usePageMeta({
    title: "Budget Transparency",
    description:
      "Panabo City's budget and actual spending by year, from the Commission on Audit's Annual Audit Reports: where the money came from, where it went, and how much of the budget was used.",
  });

  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  // Year and tab live in the address (/budget?year=2023&view=revenue)
  const url = useUrlState();
  const selected = years.find((y) => String(y.year) === url.params.get("year")) ?? years[0] ?? null;
  const view = url.get("view", VIEWS.map((v) => v.id), "overview");
  // Only the selected year's lines are loaded
  const yearData = useYearData(BudgetService.loadYear, selected?.year);

  return (
    <Page>
      <PageHeader
        title="Budget Transparency"
        path="/budget"
        intro="How Panabo City planned to spend, what it actually spent, and where the money came from, year by year."
      >
        {selected && (
          <>
            {/* Controls: one row that scopes everything below */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <YearChips years={years} value={selected.year} onChange={(y) => url.set({ year: y })} />
              <Button
                icon={Download}
                disabled={yearData.status !== "ready"}
                onClick={() =>
                  downloadCsv(`panabo-city-budget-${yearData.data.year}.csv`, BudgetService.csv(yearData.data))
                }
              >
                Download {selected.year} CSV
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-line">
              <Tabs label="Choose a view" tabs={VIEWS} value={view} onChange={(v) => url.set({ view: v })} />
              {view !== "overview" && (
                <div className="mb-2 w-full sm:w-72">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    label="Search budget lines"
                    placeholder="Search lines, e.g. Capital Outlay"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </PageHeader>

      <Container>
        {selected ? (
          <YearContent
            {...yearData}
            what="budget data"
            errorHint="Please check your connection and try again. You can also read the official reports linked below."
          >
            {(year) => (
              <>
                <SourceNote>
                  Source: {year.source}. The final budget includes supplemental budgets and realignments approved
                  during the year.
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
                </SourceNote>
                {view === "overview" && (
                  <OverviewView
                    year={year}
                    previous={BudgetService.getPreviousYear(year.year)}
                    onSelectYear={(y) => url.set({ year: y })}
                  />
                )}
                {view === "spending" && <SpendingView year={year} term={term} />}
                {view === "revenue" && <RevenueView year={year} term={term} />}
                {view === "table" && <TableView year={year} term={term} />}
              </>
            )}
          </YearContent>
        ) : (
          <EmptyState icon={PiggyBank} title="No budget figures posted yet">
            Figures will appear here, year by year, once they're added from official reports.
          </EmptyState>
        )}

        <SourceList sources={BudgetService.sources} />
      </Container>
    </Page>
  );
}

// --- Overview ---

function OverviewView({ year, previous, onSelectYear }) {
  const { budget, revenue, totalSpending, continuing, surplus } = year;
  const spentChange = previous ? (budget.actual - previous.budget.actual) / previous.budget.actual : null;

  return (
    <>
      <div className="mt-6">
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Final budget"
            value={formatPesoCompact(budget.final)}
            exact={formatPeso(budget.final)}
            note={`Original ${formatPesoCompact(budget.original)} · ${signedPercent(budget.change / budget.original)} during the year`}
          />
          <Stat
            label="Spent"
            value={formatPesoCompact(budget.actual)}
            exact={formatPeso(budget.actual)}
            note={spentChange != null ? `${signedPercent(spentChange)} vs ${previous.year}` : "First year on record"}
          />
          <Stat
            label="Unspent"
            value={formatPesoCompact(budget.unspent)}
            exact={formatPeso(budget.unspent)}
            note="Final budget minus spending"
          />
          <Stat label="Budget used" value={formatPercent(budget.used)} note="Share of the final budget spent">
            <Meter value={budget.used} fillClass="bg-expense" trackClass="bg-budget/50" label="Budget used" />
          </Stat>
          <Stat
            label="Revenue collected"
            value={formatPesoCompact(revenue.actual)}
            exact={formatPeso(revenue.actual)}
            note={`Target ${formatPesoCompact(revenue.final)}`}
          />
          <Stat label="Revenue vs target" value={formatPercent(revenue.collected)} note="Share of the revenue target collected">
            <Meter value={revenue.collected} fillClass="bg-revenue" trackClass="bg-revenue-target/50" label="Revenue vs target" />
          </Stat>
          <Stat
            label="Total spending"
            value={formatPesoCompact(totalSpending.actual)}
            exact={formatPeso(totalSpending.actual)}
            note={continuing ? `Incl. ${formatPesoCompact(continuing.actual)} from earlier years' budgets` : null}
          />
          <Stat
            label={surplus < 0 ? "Deficit" : "Surplus"}
            value={formatPesoCompact(Math.abs(surplus))}
            exact={formatPeso(Math.abs(surplus))}
            note="Revenue collected minus total spending"
          />
        </StatGrid>
      </div>

      <Panel
        title="Budget vs spending by sector"
        desc={`This year's budget (current appropriations) for ${year.year}, and how much of it was spent.`}
      >
        <SpendingBars rows={year.sectors.map((s) => ({ ...s, label: s.name }))} />
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

// Final budget vs spent, the pairing every spending chart uses
const SpendingBars = (props) => (
  <PairedBars
    budgetClass="bg-budget"
    actualClass="bg-expense"
    budgetLabel="Final budget"
    actualLabel="Spent"
    actualVerb="spent"
    {...props}
  />
);

// Target vs collected, for revenue
const RevenueBars = (props) => (
  <PairedBars
    budgetClass="bg-revenue-target"
    actualClass="bg-revenue"
    budgetLabel="Target"
    actualLabel="Collected"
    actualVerb="collected"
    {...props}
  />
);

// --- Spending lines ---

function SpendingView({ year, term }) {
  const lines = year.spendingLines.filter((l) => matches(l, term)).sort((a, b) => b.final - a.final);
  return (
    <>
      <Panel
        title={`All budget lines (${lines.length})`}
        desc="Every line of this year's budget: the final budget and how much was spent."
      >
        <SpendingBars rows={lines} emptyText={`No budget line matches “${term}”.`} />
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
            <SpendingBars rows={year.continuingSectors.map((s) => ({ ...s, label: s.name }))} />
          ) : (
            <p className="text-sm text-muted">
              The {year.year} report gives only the total:{" "}
              <span className="font-semibold text-ink tabular-nums">{formatPeso(year.continuing.actual)}</span> spent of{" "}
              <span className="font-semibold text-ink tabular-nums">{formatPeso(year.continuing.final)}</span> (
              {formatPercent(year.continuing.actual / year.continuing.final, 0)}).
            </p>
          )}
        </Panel>
      )}
    </>
  );
}

// --- Revenue ---

function RevenueView({ year, term }) {
  const lines = year.revenueLines
    .filter((l) => matches(l, term))
    .sort((a, b) => b.final - a.final || b.actual - a.actual);
  return (
    <>
      <Panel title="Revenue by category" desc={`Target (final budget) and amount collected in ${year.year}.`}>
        <RevenueBars rows={year.revenueCategories.map((c) => ({ ...c, label: c.name }))} />
      </Panel>
      <Panel
        title={`Revenue by source (${lines.length})`}
        desc="Includes loan proceeds (Receipts from Borrowings) where the report lists them."
      >
        <RevenueBars rows={lines} emptyText={`No revenue source matches “${term}”.`} />
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
      <Section
        title={`Spending, ${year.year}`}
        desc={`${pluralize(spending.length, "line")} of this year's budget (current appropriations). Click a column to sort.`}
      >
        <BudgetTable caption={`Spending lines, ${year.year}`} rows={spending} totals={term ? null : year.budget} />
      </Section>
      <Section title={`Revenue, ${year.year}`} desc={`${pluralize(revenue.length, "line")}.`}>
        <BudgetTable
          caption={`Revenue lines, ${year.year}`}
          rows={revenue}
          totals={term ? null : year.revenue}
          actualLabel="Collected"
        />
      </Section>
    </>
  );
}
