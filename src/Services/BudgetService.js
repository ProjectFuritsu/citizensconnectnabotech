import sourcesFile from "../Data/Budget/sources.json";
import { AuditService } from "./AuditService";
import { groupBy } from "./shared/lists";
import { ratio, round, sumBy } from "./shared/numbers";
import { byYear, cachedLoader } from "./shared/yearFiles";

// Budget data: one JSON file per fiscal year in src/Data/Budget/years/ (see
// src/Data/Budget/README.md). The page loads only what it shows:
// - every year's "totals", for the year chips, the years chart and "vs last
//   year". The ?totals query makes this a separate import, so only the totals
//   are bundled, not the lines;
// - a year's lines, loaded the first time that year is opened.
const totalsFiles = import.meta.glob("../Data/Budget/years/*.json", {
  query: "?totals",
  import: "totals",
  eager: true,
});
const lineFiles = import.meta.glob("../Data/Budget/years/*.json", { import: "default" });

const AMOUNTS = ["original", "final", "actual"];
const amountsOf = (items) =>
  Object.fromEntries(AMOUNTS.map((key) => [key, sumBy(items, (item) => item[key])]));

// Lines must add up to the report's printed totals; warn when data breaks that
const verify = (year, label, items, reported) => {
  if (!reported || items.length === 0) return;
  const ours = amountsOf(items);
  for (const key of AMOUNTS) {
    if (Math.abs(ours[key] - reported[key]) > 0.05) {
      console.warn(
        `Budget ${year}: ${label} lines add up to ${ours[key].toLocaleString()} (${key}) but the report's total is ${reported[key].toLocaleString()}.`,
      );
    }
  }
};

// Adds the figures every chart needs to a line or group
const withStats = (row) => ({
  ...row,
  change: round(row.final - row.original), // raised (+) or cut (−) during the year
  unspent: round(row.final - row.actual), // negative = spent more than budgeted
  used: ratio(row.actual, row.final), // share of the final budget actually used
});

// Sum lines into groups by a field, largest final budget first
const groupLines = (lines, field) =>
  [...groupBy(lines, (line) => line[field])]
    .map(([name, items]) => withStats({ key: name, name, ...amountsOf(items), lines: items }))
    .sort((a, b) => b.final - a.final);

// A year's headline figures, from its printed totals alone
const summarize = (year, t) => ({
  year,
  budget: withStats(t.currentAppropriations), // this year's budget
  revenue: { ...t.revenue, collected: ratio(t.revenue.actual, t.revenue.final) },
  continuing: t.continuingAppropriations ?? null, // carried over from earlier years
  totalSpending: t.totalAppropriations, // current + continuing
  surplus: t.surplus?.actual ?? round(t.revenue.actual - t.totalAppropriations.actual),
});

// A year's headline figures plus every line, grouped for the charts
function prepareYear(raw, year) {
  if (raw.year !== year) {
    console.warn(`Budget: years/${year}.json says "year": ${raw.year}; the file name wins.`);
  }
  const current = raw.expenditures.filter((e) => e.appropriation === "current");
  const continuing = raw.expenditures.filter((e) => e.appropriation === "continuing");
  const t = raw.totals;

  verify(year, "revenue", raw.revenue, t.revenue);
  verify(year, "current appropriation", current, t.currentAppropriations);
  verify(year, "continuing appropriation", continuing, t.continuingAppropriations);

  const spendingLines = current.map((l) =>
    withStats({
      ...l,
      key: [l.sector, l.group, l.item].filter(Boolean).join(" › "),
      label: l.group ? `${l.group}: ${l.item}` : l.item,
      context: l.sector,
    }),
  );
  const revenueLines = raw.revenue.map((l) =>
    withStats({
      ...l,
      key: [l.category, l.group, l.item].filter(Boolean).join(" › "),
      label: l.item,
      context: l.group ?? l.category,
    }),
  );

  return {
    ...summarize(year, t),
    source: raw.source,
    // The original report, from the COA audit report files
    sourceDocumentUrl: raw.sourceDocument ? AuditService.fileUrl(raw.sourceDocument) : null,
    raw, // as stored, for the CSV download
    continuingItemized: continuing.length > 0,
    sectors: groupLines(spendingLines, "sector"),
    spendingLines,
    continuingSectors: groupLines(
      continuing.map((l) => withStats({ ...l, key: `${l.sector} › ${l.item}` })),
      "sector",
    ),
    revenueCategories: groupLines(revenueLines, "category"),
    revenueLines,
  };
}

// Every year's headline figures, newest first
const years = [...byYear(totalsFiles)]
  .map(([year, totals]) => summarize(year, totals))
  .sort((a, b) => b.year - a.year);

export const BudgetService = {
  years,
  sources: sourcesFile.officialSources,

  // The closest earlier year, for "vs last year" comparisons
  getPreviousYear: (year) => years.find((y) => y.year < year) ?? null,

  // A year's headline figures plus every line, loaded once per visit
  loadYear: cachedLoader(byYear(lineFiles), "budget", prepareYear),

  // Every line of a year, as in the report, for downloadCsv()
  csv: ({ raw }) => {
    const row = (type, appropriation, l) => [
      type, appropriation, l.category ?? l.sector, l.group, l.item,
      l.original, l.final, round(l.original - l.final), l.actual, round(l.final - l.actual),
    ];
    return {
      header: [
        "Type", "Appropriation", "Category or sector", "Group", "Item",
        "Original budget", "Final budget", "Difference original and final",
        "Actual", "Difference final and actual",
      ],
      rows: [
        ...raw.revenue.map((l) => row("Revenue", "", l)),
        ...raw.expenditures.map((l) => row("Expenditure", l.appropriation, l)),
      ],
    };
  },
};
