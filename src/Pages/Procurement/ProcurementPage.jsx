import { useMemo, useState } from "react";
import { Download, FileDown } from "lucide-react";
import { DonutChart, Meter } from "../../Components/Charts";
import { Button, Chip, ChipGroup, SearchInput, Select, Tabs, YearChips } from "../../Components/Controls";
import { Container, Page, PageHeader } from "../../Components/Page";
import { Panel, Section } from "../../Components/Section";
import { SourceList, SourceNote } from "../../Components/Sources";
import { Stat, StatGrid } from "../../Components/Stat";
import { EmptyState, YearContent } from "../../Components/States";
import { useUrlState } from "../../Hooks/useUrlState";
import { useYearData } from "../../Hooks/useYearData";
import { OFFICE_TYPES, ProcurementService, QUARTERS, STATUSES } from "../../Services/ProcurementService";
import { downloadCsv } from "../../Services/shared/csv";
import { formatPercent, formatPeso, formatPesoCompact, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import { CountBars, QuarterBars, ShareBars } from "./components/ProcurementCharts";
import NoticeList from "./components/NoticeList";
import SupplierTable from "./components/SupplierTable";

// Data: src/Data/Procurement (one JSON file per year), built from PhilGEPS
// records of offices in Panabo City. See src/Data/Procurement/README.md.
// The page shows the records as they are: every office, no filtering to
// match other reports. Amounts are counted once per notice and once per award.
const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "notices", label: "Notices" },
  { id: "suppliers", label: "Suppliers" },
];

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "budget", label: "Largest approved budget" },
  { id: "contract", label: "Largest contract" },
];

const MONTHS = { Q1: ["January", "March"], Q2: ["April", "June"], Q3: ["July", "September"], Q4: ["October", "December"] };
// "January to December 2024", "January to September 2026"
const coverageOf = (year, quarters) =>
  quarters.length ? `${MONTHS[quarters[0]][0]} to ${MONTHS[quarters[quarters.length - 1]][1]} ${year}` : String(year);

const percentOrDash = (x) => (x == null ? "—" : formatPercent(x, 0));

// Plain-language summary of the procurement law; sources in sources.json "lawSources"
const STEPS = [
  { title: "Notice", text: "An office posts what it needs to buy and its approved budget for the contract: the most it may pay." },
  { title: "Bids", text: "Suppliers send their bids or price quotes." },
  { title: "Award", text: "The office picks the winning supplier. The contract amount is the winning bid. A bid above the approved budget is disqualified." },
];

// "Based on: RA 9184 rules · RA 12009 rules · …", linking each source of an explanation
const BasedOn = () => (
  <p className="mt-3 text-xs text-muted">
    Based on:{" "}
    {ProcurementService.lawSources.map((s, i) => (
      <span key={s.url}>
        {i > 0 && " · "}
        <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.description} className="link-quiet">
          {s.short}
        </a>
      </span>
    ))}
  </p>
);

const years = ProcurementService.years; // every year's summary, newest first

// Years between the first and last on file that have no data yet
const missingYears = years.length
  ? Array.from(
      { length: years[0].year - years[years.length - 1].year + 1 },
      (_, i) => years[years.length - 1].year + i,
    ).filter((y) => !years.some((x) => x.year === y))
  : [];

export default function ProcurementPage() {
  usePageMeta({
    title: "Procurement Transparency",
    description:
      "What government offices in Panabo City put up for bidding, how they chose to buy, and who won the contracts, from PhilGEPS records.",
  });

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const term = query.trim().toLowerCase();

  // Year, office type, tab, quarter and status live in the address, so views can be shared
  const url = useUrlState();
  const selected = years.find((y) => String(y.year) === url.params.get("year")) ?? years[0] ?? null;
  const view = url.get("view", VIEWS.map((v) => v.id), "overview");
  const office = url.get("office", OFFICE_TYPES.map((t) => t.id), "all");
  const quarter = url.get("quarter", Object.keys(QUARTERS), "all");
  const noticeStatus = url.get("status", Object.keys(STATUSES), "all"); // PhilGEPS's notice status
  const yearData = useYearData(ProcurementService.loadYear, selected?.year);

  // `data` is the year on screen; while another year loads it is still the last one
  const { data } = yearData;
  const notices = useMemo(() => (data ? ProcurementService.forOffice(data.notices, office) : []), [data, office]);
  const stats = useMemo(() => ProcurementService.stats(notices), [notices]);

  const officeCount = (id) => (id === "all" ? selected.all.notices : (selected.byOfficeType[id]?.notices ?? 0));
  const officeAbout = OFFICE_TYPES.find((t) => t.id === office)?.about;

  return (
    <Page>
      <PageHeader
        title="Procurement Transparency"
        path="/procurement"
        intro="What government offices in Panabo City put up for bidding, how they chose to buy, and who won the contracts, from the government's official procurement website."
      >
        {selected && (
          <>
            {/* Controls: year and office scope everything below */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <YearChips
                years={years}
                value={selected.year}
                onChange={(y) => url.set({ year: y, quarter: null, status: null })}
              >
                {missingYears.length > 0 && (
                  <span className="self-center text-sm text-subtle">{missingYears.join(" and ")}: not yet added</span>
                )}
              </YearChips>
              <Button
                icon={Download}
                disabled={yearData.status !== "ready"}
                onClick={() =>
                  downloadCsv(
                    `panabo-procurement-${data.year}${office === "all" ? "" : `-${office}`}.csv`,
                    ProcurementService.csv(data.year, notices),
                  )
                }
              >
                Download {selected.year} CSV
              </Button>
            </div>

            <div className="mt-4">
              <ChipGroup label="Choose offices">
                {OFFICE_TYPES.filter((t) => t.id !== "unknown" || officeCount(t.id) > 0).map((t) => (
                  <Chip
                    key={t.id}
                    active={t.id === office}
                    count={officeCount(t.id)}
                    onClick={() => url.set({ office: t.id === "all" ? null : t.id })}
                  >
                    {t.label}
                  </Chip>
                ))}
              </ChipGroup>
            </div>
            {officeAbout && <p className="mt-2 text-sm text-muted">{officeAbout}</p>}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-line">
              <Tabs label="Choose a view" tabs={VIEWS} value={view} onChange={(v) => url.set({ view: v })} />
              {(view === "notices" || view === "suppliers") && (
                <div className="mb-2 w-full sm:w-72">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    label={view === "notices" ? "Search notices" : "Search suppliers"}
                    placeholder={view === "notices" ? "Search, e.g. medicines or a supplier" : "Search suppliers"}
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
            what="procurement data"
            errorHint="Please check your connection and try again. You can also search the records on PhilGEPS, linked below."
          >
            {(year) => {
              const shown = years.find((y) => y.year === year.year);
              return (
                <>
                  <SourceNote>
                    Source:{" "}
                    {year.source.url ? (
                      <a href={year.source.url} target="_blank" rel="noopener noreferrer" className="link-quiet">
                        PhilGEPS open data
                      </a>
                    ) : (
                      "PhilGEPS"
                    )}{" "}
                    for offices in Panabo City, {coverageOf(year.year, shown.quarters)}.{" "}
                    {shown.hasAwards
                      ? "Amounts are counted once per notice and once per contract."
                      : "These files list notices only. They don't say who won or how much the contracts were."}
                    {shown.recordsUrl && (
                      <a
                        href={shown.recordsUrl}
                        download={`procurement-${year.year}.json`}
                        className="ml-1 inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                      >
                        <FileDown size={14} />
                        All {year.year} records (JSON)
                      </a>
                    )}
                  </SourceNote>

                  {view === "overview" && (
                    <OverviewView
                      stats={stats}
                      year={year.year}
                      hasAwards={shown.hasAwards}
                      quarters={shown.quarters}
                      suppliersLink={{ search: `?${new URLSearchParams({ ...Object.fromEntries(url.params), view: "suppliers" })}` }}
                    />
                  )}
                  {view === "notices" && (
                    <NoticesView
                      notices={notices}
                      year={year.year}
                      quarters={shown.quarters}
                      quarter={quarter}
                      noticeStatus={noticeStatus}
                      term={term}
                      sort={sort}
                      listKey={`${year.year}-${office}-${quarter}-${noticeStatus}-${term}-${sort}`}
                      onQuarter={(q) => url.set({ quarter: q === "all" ? null : q })}
                      onStatus={(s) => url.set({ status: s === "all" ? null : s })}
                      onSort={setSort}
                      onClear={() => {
                        setQuery("");
                        url.set({ quarter: null, status: null });
                      }}
                    />
                  )}
                  {view === "suppliers" && (
                    <SuppliersView
                      suppliers={stats.suppliers}
                      year={year.year}
                      hasAwards={shown.hasAwards}
                      term={term}
                      listKey={`${year.year}-${office}-${term}`}
                    />
                  )}
                </>
              );
            }}
          </YearContent>
        ) : (
          <EmptyState title="No procurement records posted here yet">
            Records will appear here, year by year, once they're added from PhilGEPS.
          </EmptyState>
        )}

        {selected && <AuditReport year={selected.year} />}

        <SourceList desc="Search the original records for yourself." sources={ProcurementService.sources} />
        <SourceList
          title="The procurement law"
          desc="Where the explanations on this page come from."
          sources={ProcurementService.lawSources}
        />
      </Container>
    </Page>
  );
}

// --- Overview ---

function OverviewView({ stats, year, hasAwards, quarters, suppliersLink }) {
  const localSuppliers = stats.suppliers.filter((s) => s.place === "Panabo City").length;
  const topCategories = stats.byCategory.slice(0, 8);
  const topOffices = stats.byOffice.slice(0, 10);

  return (
    <>
      <div className="mt-6">
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Notices posted"
            value={stats.notices.toLocaleString()}
            note={stats.lineItems > 0 ? `${pluralize(stats.lineItems, "item")} listed` : "No item details in this data"}
          />
          <Stat
            label="Approved budgets"
            value={formatPesoCompact(stats.approvedBudget)}
            exact={formatPeso(stats.approvedBudget)}
            note="The most the offices may pay, all notices"
          />
          <Stat label="Put to public bidding" value={percentOrDash(stats.publicBiddingShare)} note="Share of the approved budgets">
            <Meter value={stats.publicBiddingShare} fillClass="bg-budget" trackClass="bg-track" label="Put to public bidding" />
          </Stat>
          <Stat
            label="Failed or cancelled"
            value={stats.endedWithoutContract.toLocaleString()}
            note="Notices that ended without a contract"
          />
          {hasAwards && (
            <>
              <Stat
                label="Contracts awarded"
                value={stats.awards.toLocaleString()}
                note={`From ${pluralize(stats.awardedNotices, "notice")}`}
              />
              <Stat
                label="Contract amounts"
                value={formatPesoCompact(stats.contractAmount)}
                exact={formatPeso(stats.contractAmount)}
                note="Total of the winning bids"
              />
              <Stat
                label="Winning bids vs approved budgets"
                value={percentOrDash(stats.bidVsBudget)}
                note="For the notices that have an award"
              >
                <Meter value={stats.bidVsBudget} fillClass="bg-expense" trackClass="bg-budget/50" label="Winning bids vs approved budgets" />
              </Stat>
              <Stat
                label="Winning suppliers"
                value={stats.suppliers.length.toLocaleString()}
                note={`${localSuppliers.toLocaleString()} based in Panabo City`}
              />
            </>
          )}
        </StatGrid>
      </div>
      {!hasAwards && (
        <p className="mt-4 rounded-card border border-dashed border-line bg-surface px-5 py-4 text-sm text-muted">
          The PhilGEPS files for {year} list notices only. They don't say who won or how much the contracts were, so
          those figures aren't shown for {year}.
        </p>
      )}

      <Section
        title="How government buying works"
        desc="Three steps. This page shows steps 1 and 3, as posted on PhilGEPS."
      >
        <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-surface px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <BasedOn />
      </Section>

      <Panel
        title="By quarter"
        desc={
          hasAwards
            ? `Approved budgets of the notices posted each quarter of ${year}, and the contracts awarded from them.`
            : `Approved budgets of the notices posted each quarter of ${year}.`
        }
      >
        <QuarterBars rows={stats.byQuarter} quarters={quarters} showAwards={hasAwards} />
      </Panel>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Panel
          title="How offices chose to buy"
          desc="Share of the approved budgets by procurement method. All of these methods are allowed by law."
        >
          <ApprovedBudgetDonut stats={stats} items={stats.byMethod.map((m) => ({ key: m.key, name: m.label, value: m.value }))} />
          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            {stats.byMethod.map((m) => (
              <div key={m.key}>
                <dt className="font-medium">
                  {m.label} <span className="font-normal text-muted">· {pluralize(m.count, "notice")}</span>
                </dt>
                {m.about && <dd className="text-muted">{m.about}</dd>}
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
            Under RA 9184, the law for the 2021–2024 notices, public bidding was the default and the other methods were
            for specific cases. RA 12009, in effect since 13 August 2024, makes public bidding one of eleven methods,
            chosen to fit the purchase.
          </p>
          <BasedOn />
        </Panel>
        <Panel
          title="Where the money came from"
          desc="Share of the approved budgets, by the “Funding Instrument” each notice lists in PhilGEPS."
        >
          <ApprovedBudgetDonut
            stats={stats}
            items={stats.byFunding.map((f) => ({ key: f.key, name: `${f.label} (${pluralize(f.count, "notice")})`, value: f.value }))}
          />
          {stats.byFunder.length > 0 && (
            <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              Other funding sources listed:{" "}
              {stats.byFunder.map((f, i) => (
                <span key={f.key}>
                  {i > 0 && "; "}
                  {f.label} <span className="text-muted">({pluralize(f.count, "notice")})</span>
                </span>
              ))}
              .
            </p>
          )}
          <p className="mt-4 text-xs text-muted">Shown exactly as each office entered it in PhilGEPS.</p>
        </Panel>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Panel title="What happened to the notices" desc={`Status of the ${pluralize(stats.notices, "notice")}, as last posted on PhilGEPS.`}>
          <CountBars rows={stats.byStatus} total={stats.notices} countWord="notice" />
        </Panel>
        <Panel title="What was bought" desc="Approved budgets by type of purchase.">
          <ShareBars rows={stats.byClassification} barClass="bg-budget" countWord="notice" total={stats.approvedBudget} />
        </Panel>
      </div>

      <Panel
        title="Top categories"
        desc={
          stats.byCategory.length > topCategories.length
            ? `The ${topCategories.length} largest of ${stats.byCategory.length} categories, by approved budget.`
            : "By approved budget."
        }
      >
        <ShareBars rows={topCategories} barClass="bg-budget" countWord="notice" total={stats.approvedBudget} />
      </Panel>

      {hasAwards && (
        <div className="grid gap-x-12 lg:grid-cols-2">
          <Panel
            title="Who won the most"
            desc="The 10 suppliers with the largest contract amounts."
            link={stats.suppliers.length > 10 ? { to: suppliersLink, label: `View all ${stats.suppliers.length}` } : null}
          >
            <ShareBars
              rows={stats.suppliers.slice(0, 10).map((s) => ({ ...s, label: s.name ?? "—", context: s.place }))}
              barClass="bg-expense"
              countWord="contract"
              emptyText="No contracts awarded for these offices in the data."
            />
          </Panel>
          <Panel title="Where winning suppliers are based" desc="Share of the contract amounts, by the supplier's address in PhilGEPS.">
            {stats.contractAmount > 0 ? (
              <DonutChart items={stats.byPlace} total={stats.contractAmount} centerLabel="Contracts" />
            ) : (
              <p className="text-sm text-muted">No contracts awarded for these offices in the data.</p>
            )}
          </Panel>
        </div>
      )}

      {stats.byOffice.length > 1 && (
        <Panel
          title="By office"
          desc={
            stats.byOffice.length > topOffices.length
              ? `The ${topOffices.length} offices with the largest approved budgets, of ${stats.byOffice.length}.`
              : "Approved budgets of the notices each office posted."
          }
        >
          <ShareBars rows={topOffices} barClass="bg-budget" countWord="notice" total={stats.approvedBudget} />
        </Panel>
      )}
    </>
  );
}

// A donut of approved budgets, or a note when there are none
const ApprovedBudgetDonut = ({ stats, items }) =>
  stats.approvedBudget > 0 ? (
    <DonutChart items={items} total={stats.approvedBudget} centerLabel="Approved budgets" />
  ) : (
    <p className="text-sm text-muted">No approved budgets to show.</p>
  );

// --- Notices ---

const sorters = {
  newest: (a, b) => (b.published ?? "").localeCompare(a.published ?? "") || b.row - a.row,
  budget: (a, b) => (b.approvedBudget ?? -1) - (a.approvedBudget ?? -1),
  contract: (a, b) => (b.contractAmount ?? -1) - (a.contractAmount ?? -1),
};

function NoticesView({
  notices, year, quarters, quarter, noticeStatus, term, sort, listKey, onQuarter, onStatus, onSort, onClear,
}) {
  // Each row's counts follow the other row's choice, so the numbers match the list
  const inQuarter = quarter === "all" ? notices : notices.filter((n) => n.quarter === quarter);
  const inStatus = noticeStatus === "all" ? notices : notices.filter((n) => n.status === noticeStatus);
  const list = inQuarter
    .filter((n) => (noticeStatus === "all" || n.status === noticeStatus) && (!term || n.search.includes(term)))
    .sort(sorters[sort]);

  const quarterChips = [{ id: "all", label: "All quarters", count: inStatus.length }].concat(
    quarters.map((q) => ({ id: q, label: `${q} · ${QUARTERS[q]}`, count: inStatus.filter((n) => n.quarter === q).length })),
  );
  // Statuses in PhilGEPS's own words, only those this year's notices have
  const statusChips = [{ id: "all", label: "All statuses", count: inQuarter.length }].concat(
    Object.keys(STATUSES)
      .filter((s) => notices.some((n) => n.status === s))
      .map((s) => ({ id: s, label: STATUSES[s].label, count: inQuarter.filter((n) => n.status === s).length })),
  );

  return (
    <section className="pt-8">
      <div className="space-y-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterChips label="Choose a quarter" options={quarterChips} value={quarter} onChange={onQuarter} />
          <Select label="Sort" value={sort} onChange={onSort} options={SORTS} />
        </div>
        <FilterChips label="Choose a status" options={statusChips} value={noticeStatus} onChange={onStatus} />
      </div>
      <p aria-live="polite" className="sr-only">
        {pluralize(list.length, "notice")}
      </p>
      <NoticeList
        key={listKey}
        notices={list}
        year={year}
        filtered={quarter !== "all" || noticeStatus !== "all" || Boolean(term)}
        onClear={onClear}
      />
    </section>
  );
}

// A row of filter chips with counts; the first is "All"
const FilterChips = ({ label, options, value, onChange }) => (
  <ChipGroup label={label}>
    {options.map((option) => (
      <Chip key={option.id} active={option.id === value} count={option.count} onClick={() => onChange(option.id)}>
        {option.label}
      </Chip>
    ))}
  </ChipGroup>
);

// --- Suppliers ---

function SuppliersView({ suppliers, year, hasAwards, term, listKey }) {
  if (!hasAwards) {
    return (
      <EmptyState title={`No award details for ${year}`}>
        The PhilGEPS files for {year} list notices only, not who won. Choose another year, or search the awards on
        PhilGEPS.
      </EmptyState>
    );
  }
  const list = suppliers.filter((s) => !term || `${s.name} ${s.place}`.toLowerCase().includes(term));
  return (
    <Section title={`Winning suppliers, ${year}`} desc="Suppliers that won contracts, as named in PhilGEPS. Click a column to sort.">
      {list.length > 0 ? (
        <SupplierTable key={listKey} suppliers={list} caption={`Winning suppliers, ${year}`} />
      ) : (
        <p className="rounded-card border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-muted">
          {term ? `No supplier matches “${term}”.` : "No contracts awarded for these offices in the data."}
        </p>
      )}
    </Section>
  );
}

// --- COA audit report for the year (original files, from src/Data/Audit) ---

// Each part described by its own title in the report, nothing more
const AUDIT_PARTS = {
  findings: "Part 2 of the report: COA's observations and recommendations.",
  followUp: "Part 3 of the report: the status of recommendations from earlier years.",
};

const fileMeta = (f) => `${f.format} · ${f.sizeKB >= 1024 ? `${(f.sizeKB / 1024).toFixed(1)} MB` : `${f.sizeKB} KB`}`;

function AuditReport({ year }) {
  const report = ProcurementService.auditReportFor(year);
  return (
    <Section
      title={`COA audit report, ${year}`}
      desc="The Commission on Audit's Annual Audit Report on the City Government of Panabo, as the original files."
    >
      {report ? (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {report.files
              .filter((f) => f.role)
              .map((f) => (
                <li key={f.file}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full gap-4 rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
                  >
                    <FileDown size={20} className="mt-0.5 shrink-0 text-subtle group-hover:text-brand-600 transition-colors" />
                    <div className="grow">
                      <p className="font-semibold group-hover:text-brand-700 transition-colors">{f.label}</p>
                      <p className="mt-1 text-sm text-muted">{AUDIT_PARTS[f.role]}</p>
                      <p className="mt-2 text-xs text-subtle">{fileMeta(f)}</p>
                    </div>
                  </a>
                </li>
              ))}
          </ul>
          <details className="mt-4 rounded-card border border-line bg-surface px-5 py-4 text-sm">
            <summary className="cursor-pointer font-medium text-brand-600 hover:text-brand-700">
              All {report.files.length} parts of the original report
            </summary>
            <ul className="mt-3 divide-y divide-line">
              {report.files.map((f) => (
                <li key={f.file} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="link-quiet">
                    {f.label}
                  </a>
                  <span className="text-xs text-muted tabular-nums">{fileMeta(f)}</span>
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-surface px-5 py-4 text-sm text-muted">
          COA's audit report for {year} is not on this site yet.
        </p>
      )}
    </Section>
  );
}
