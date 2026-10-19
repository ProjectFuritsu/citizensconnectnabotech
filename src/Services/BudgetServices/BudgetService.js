// Budget data: one JSON file per fiscal year in src/Data/Budget/years/ (see
// src/Data/Budget/README.md). The files are split out of the main bundle and
// only loaded when the Budget page opens.
const yearFiles = import.meta.glob("../../Data/Budget/years/*.json", { import: "default" });
const loadSources = () => import("../../Data/Budget/sources.json").then((m) => m.default);

const round = (n) => Math.round(n * 100) / 100;
const sumBy = (items, key) => round(items.reduce((t, i) => t + (i[key] ?? 0), 0));
const amountsOf = (items) => ({
  original: sumBy(items, "original"),
  final: sumBy(items, "final"),
  actual: sumBy(items, "actual"),
});
const ratio = (part, whole) => (whole ? part / whole : null);

// Lines must add up to the report's printed totals; warn when data breaks that
const verify = (year, label, items, reported) => {
  if (!reported || items.length === 0) return;
  for (const key of ["original", "final", "actual"]) {
    const ours = sumBy(items, key);
    if (Math.abs(ours - reported[key]) > 0.05) {
      console.warn(
        `Budget ${year}: ${label} lines add up to ${ours.toLocaleString()} (${key}) but the report's total is ${reported[key].toLocaleString()}.`,
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
const groupLines = (lines, field) => {
  const groups = new Map();
  for (const line of lines) {
    const name = line[field];
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(line);
  }
  return [...groups]
    .map(([name, items]) => withStats({ key: name, name, ...amountsOf(items), lines: items }))
    .sort((a, b) => b.final - a.final);
};

function prepareYear(raw) {
  const current = raw.expenditures.filter((e) => e.appropriation === "current");
  const continuing = raw.expenditures.filter((e) => e.appropriation === "continuing");
  const t = raw.totals;

  verify(raw.year, "revenue", raw.revenue, t.revenue);
  verify(raw.year, "current appropriation", current, t.currentAppropriations);
  verify(raw.year, "continuing appropriation", continuing, t.continuingAppropriations);

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

  const totalSpending = t.totalAppropriations;
  return {
    year: raw.year,
    source: raw.source,
    sourceDocumentUrl: raw.sourceDocument ?? null, // the original report, when available
    raw, // as stored, for the CSV download
    budget: withStats(t.currentAppropriations), // this year's budget
    revenue: { ...t.revenue, collected: ratio(t.revenue.actual, t.revenue.final) },
    continuing: t.continuingAppropriations ?? null, // carried over from earlier years
    continuingItemized: continuing.length > 0,
    totalSpending, // current + continuing
    surplus: t.surplus?.actual ?? round(t.revenue.actual - totalSpending.actual),
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

async function loadData() {
  const [sources, ...rawYears] = await Promise.all([
    loadSources(),
    ...Object.values(yearFiles).map((load) => load()),
  ]);
  return { years: rawYears.map(prepareYear), sources: sources.officialSources };
}

// One CSV with every line of a year, as in the report
const csvCell = (v) =>
  v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);

const toCsv = (raw) => {
  const header = [
    "Type", "Appropriation", "Category or sector", "Group", "Item",
    "Original budget", "Final budget", "Difference original and final",
    "Actual", "Difference final and actual",
  ];
  const rows = [
    ...raw.revenue.map((l) => ["Revenue", "", l.category, l.group, l.item, l.original, l.final, round(l.original - l.final), l.actual, round(l.final - l.actual)]),
    ...raw.expenditures.map((l) => ["Expenditure", l.appropriation, l.sector, l.group, l.item, l.original, l.final, round(l.original - l.final), l.actual, round(l.final - l.actual)]),
  ];
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
};

// Wraps loaded data with the lookups the page uses
const toBudget = ({ years, sources }) => {
  const sorted = [...years].sort((a, b) => b.year - a.year); // newest first
  return {
    years: sorted,
    sources,
    getYear: (year) => sorted.find((y) => y.year === year) ?? null,
    // The closest earlier year, for "vs last year" comparisons
    getPreviousYear: (year) => sorted.find((y) => y.year < year) ?? null,
    toCsv: (year) => {
      const found = sorted.find((y) => y.year === year);
      return found ? toCsv(found.raw) : "";
    },
  };
};

// Loaded once per visit; a failed load can be retried
let pending = null;

export const BudgetService = {
  load: () => {
    pending ??= loadData().then(toBudget).catch((error) => {
      pending = null;
      throw error;
    });
    return pending;
  },
};
