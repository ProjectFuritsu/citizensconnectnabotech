import sourcesFile from "../Data/Procurement/sources.json";
import { AuditService } from "./AuditService";
import { groupBy } from "./shared/lists";
import { sumBy as sum } from "./shared/numbers";
import { byYear, cachedLoader } from "./shared/yearFiles";

// Procurement data, all in src/Data/Procurement/ (see its README), built from
// PhilGEPS records. Each notice carries its awards, so every amount appears
// once. The page loads:
// - every year's "summary" (the ?summary query bundles only that key), for the
//   year chips and office counts;
// - a year's notices (years/), the first time that year is opened;
// - a year's line items (items/), the first time someone opens a notice's items.
// records/ holds every PhilGEPS record per year, offered as a download.
const summaryFiles = import.meta.glob("../Data/Procurement/years/*.json", {
  query: "?summary",
  import: "summary",
  eager: true,
});
const noticeFiles = import.meta.glob("../Data/Procurement/years/*.json", { import: "default" });
const itemFiles = import.meta.glob("../Data/Procurement/items/*.json", { import: "default" });
const recordFiles = import.meta.glob("../Data/Procurement/records/*.json", {
  query: "?url",
  import: "default",
  eager: true,
});

// --- Plain-language labels ---

// Office types, only from PhilGEPS's own organization type of each office.
// The descriptions say what PhilGEPS lists, nothing more.
export const OFFICE_TYPES = [
  { id: "all", label: "All offices" },
  { id: "city", label: "City Government", about: "Offices PhilGEPS lists as “City Government”." },
  { id: "barangay", label: "Barangays", about: "Offices PhilGEPS lists as “Barangay”." },
  { id: "college", label: "State universities and colleges", about: "Offices PhilGEPS lists as “State Universities and Colleges (SUC)”." },
  {
    id: "national",
    label: "Departments and agencies",
    about: "Offices PhilGEPS lists as “Department”, “Attached Agency” or “Government Owned and/or Controlled Corp. (GOCC)”.",
  },
  { id: "unknown", label: "Type not given", about: "The PhilGEPS file gives no office type for these notices." },
];
export const officeTypeLabel = (id) => OFFICE_TYPES.find((t) => t.id === id)?.label ?? "Other";

// Procurement methods in plain words. Sources (src/Data/Procurement/sources.json,
// "lawSources"): RA 9184 2016 Revised IRR Sec. 48–53, and the GPPB's RA 12009
// explainers. Under RA 9184 public bidding was the default; RA 12009 (from
// 13 Aug 2024) treats it as one of eleven methods, chosen to fit the purchase.
const METHODS = [
  { id: "bidding", match: /^Public Bidding/i, label: "Public bidding", about: "The notice is posted publicly and any eligible supplier can bid." },
  { id: "small", match: /Small Value/i, label: "Small value procurement", about: "For smaller purchases. The office asks at least three suppliers for price quotes; one quote can be enough to proceed." },
  { id: "shopping", match: /^Shopping/i, label: "Shopping", about: "For ready-made items, such as regular office supplies. The office asks suppliers for price quotes." },
  { id: "failed", match: /Two Failed Biddings/i, label: "After two failed biddings", about: "The office negotiates with suppliers after public bidding failed twice." },
  { id: "emergency", match: /Emergency/i, label: "Emergency purchase", about: "For urgent needs, such as disasters or threats to life and property." },
  { id: "agency", match: /Agency to Agency/i, label: "Agency to agency", about: "Buying from another government office." },
  { id: "community", match: /Community Participation|NGO Participation/i, label: "Community or NGO participation", about: "Projects done with the help of the community, or with non-government organizations." },
  { id: "direct", match: /Direct Contracting/i, label: "Direct contracting", about: "Buying straight from the only maker or exclusive dealer." },
  { id: "special", match: /Scientific|Scholarly|Exclusive Tech/i, label: "Specialized work", about: "Scientific, artistic or exclusive technical work that only one supplier can do." },
];
const methodOf = (mode) =>
  METHODS.find((m) => m.match.test(mode ?? "")) ?? { id: mode ?? "unknown", label: mode ?? "Not given", about: null };

// Funding: PhilGEPS's "Funding Instrument" exactly as the office entered it,
// with no explanation added; an empty field reads "Not given"
const fundingOf = (instrument) => ({ id: instrument ?? "none", label: instrument ?? "Not given" });
// PhilGEPS's "Funding Source" when it names one, e.g. "Asian Development Bank (ADB)";
// skips the usual "Government of the Philippines (GOP)" and the unnamed "Others"
const namedFunder = (source) => (source && !/^Government of the Philippines|^Others$/i.test(source) ? source : null);

const CLASSIFICATIONS = {
  Goods: "Goods",
  "Goods - General Support Services": "Support services",
  "Civil Works": "Civil works (construction)",
  "Consulting Services": "Consulting services",
};

// Notice status in PhilGEPS's own words, from the furthest step any of its line
// items reached. Notes only say what this data holds, not why.
export const STATUSES = {
  Awarded: { label: "Awarded" },
  Active: { label: "Active" },
  Closed: { label: "Closed", about: "No award is posted in this data." },
  Failed: { label: "Failed" },
  Cancelled: { label: "Cancelled" },
};

export const QUARTERS = { Q1: "Jan–Mar", Q2: "Apr–Jun", Q3: "Jul–Sep", Q4: "Oct–Dec" };

// Where a winning supplier is based, as listed in PhilGEPS
const placeOf = (award) => {
  const city = award.supplierCity ?? "";
  if (!city && !award.supplierProvince) return "Not given";
  if (/panabo/i.test(city)) return "Panabo City";
  if (/^davao city$/i.test(city)) return "Davao City";
  if (/davao del norte/i.test(award.supplierProvince ?? "")) return "Elsewhere in Davao del Norte";
  return "Elsewhere in the Philippines";
};
// The same supplier is sometimes spelled differently ("ABC TRADING" / "Abc Trading.")
const supplierKey = (name) => (name ?? "").toUpperCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();

// --- A year's notices, ready for the page ---

function prepareYear(raw, year) {
  const notices = raw.notices.map((n, i) => {
    const method = methodOf(n.mode);
    const awards = n.awards.map((a) => ({ ...a, place: placeOf(a), supplierKey: supplierKey(a.supplier) }));
    return {
      ...n,
      id: `${n.quarter}-${n.row}-${i}`,
      awards,
      method,
      fundingInfo: fundingOf(n.funding),
      funder: namedFunder(n.fundingSource),
      classificationLabel: CLASSIFICATIONS[n.classification] ?? n.classification ?? "Not given",
      statusLabel: STATUSES[n.status]?.label ?? n.status ?? "Not given",
      contractAmount: awards.length ? sum(awards, (a) => a.amount) : null,
      search: [n.title, n.office, n.reference, n.category, n.mode, ...awards.map((a) => a.supplier)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
  return { year, summary: raw.summary, source: raw.source, notices };
}

// Groups as [{ key, items, ...extra(first item) }], in first-seen order
const groupsOf = (items, keyOf, extra = () => ({})) =>
  [...groupBy(items, keyOf)].map(([key, list]) => ({ key, items: list, ...extra(list[0]) }));

// Every figure the Overview needs, for the notices on screen (one office type or all)
function statsOf(notices) {
  const awarded = notices.filter((n) => n.awards.length > 0);
  const awards = awarded.flatMap((n) => n.awards.map((a) => ({ ...a, notice: n })));
  const approvedBudget = sum(notices, (n) => n.approvedBudget);
  const contractAmount = sum(awards, (a) => a.amount);
  const awardedBudget = sum(awarded, (n) => n.approvedBudget);

  const byNoticeValue = (keyOf, extra) =>
    groupsOf(notices, keyOf, extra)
      .map((g) => ({ ...g, count: g.items.length, value: sum(g.items, (n) => n.approvedBudget) }))
      .sort((a, b) => b.value - a.value);

  const suppliers = groupsOf(awards, (a) => a.supplierKey, (a) => ({ name: a.supplier, place: a.place }))
    .map((g) => ({
      ...g,
      count: g.items.length,
      value: sum(g.items, (a) => a.amount),
      offices: [...new Set(g.items.map((a) => a.notice.office))],
    }))
    .sort((a, b) => b.value - a.value);

  return {
    notices: notices.length,
    lineItems: notices.reduce((t, n) => t + n.lineItems, 0),
    approvedBudget,
    awardedNotices: awarded.length,
    awards: awards.length,
    contractAmount,
    // Winning bids as a share of the approved budgets of the same notices
    bidVsBudget: awardedBudget ? contractAmount / awardedBudget : null,
    publicBiddingShare: approvedBudget
      ? sum(notices.filter((n) => n.method.id === "bidding"), (n) => n.approvedBudget) / approvedBudget
      : null,
    endedWithoutContract: notices.filter((n) => n.status === "Failed" || n.status === "Cancelled").length,
    byQuarter: Object.keys(QUARTERS).map((q) => {
      const items = notices.filter((n) => n.quarter === q);
      return {
        key: q,
        label: `${q} · ${QUARTERS[q]}`,
        count: items.length,
        approvedBudget: sum(items, (n) => n.approvedBudget),
        contractAmount: sum(items.flatMap((n) => n.awards), (a) => a.amount),
      };
    }),
    byMethod: byNoticeValue((n) => n.method.id, (n) => ({ label: n.method.label, about: n.method.about })),
    byFunding: byNoticeValue((n) => n.fundingInfo.id, (n) => ({ label: n.fundingInfo.label })),
    // Funding sources other than "Government of the Philippines (GOP)" and "Others", as written
    byFunder: byNoticeValue((n) => n.funder, (n) => ({ label: n.funder })).filter((g) => g.key != null),
    byClassification: byNoticeValue((n) => n.classificationLabel, (n) => ({ label: n.classificationLabel })),
    byCategory: byNoticeValue((n) => n.category ?? "Not given", (n) => ({ label: n.category ?? "Not given" })),
    byOffice: byNoticeValue((n) => n.office, (n) => ({ label: n.office, context: officeTypeLabel(n.officeType) })),
    byStatus: groupsOf(notices, (n) => n.status, (n) => ({ label: n.statusLabel, about: STATUSES[n.status]?.about }))
      .map((g) => ({ ...g, count: g.items.length }))
      .sort((a, b) => b.count - a.count),
    suppliers,
    byPlace: groupsOf(awards, (a) => a.place, (a) => ({ name: a.place }))
      .map((g) => ({ key: g.key, name: g.name, value: sum(g.items, (a) => a.amount) }))
      .sort((a, b) => b.value - a.value),
  };
}

// --- CSV: one row per award, or one per notice without an award ---
const csvOf = (year, notices) => ({
  header: [
    "Year", "Quarter", "Office", "Office type", "PhilGEPS reference", "Notice title", "Method",
    "Classification", "Category", "Funding instrument", "Funding source", "Approved budget", "Published", "Status", "Line items",
    "Award reference", "Supplier", "Supplier city", "Contract amount", "Award date", "Row in PhilGEPS file",
  ],
  rows: notices.flatMap((n) => {
    const base = [
      year, n.quarter, n.office, officeTypeLabel(n.officeType), n.reference, n.title, n.mode,
      n.classification, n.category, n.funding, n.fundingSource, n.approvedBudget, n.published, n.status, n.lineItems,
    ];
    return n.awards.length
      ? n.awards.map((a) => [...base, a.reference, a.supplier, a.supplierCity, a.amount, a.awardDate, a.row])
      : [[...base, "", "", "", "", "", n.row]];
  }),
});

// Every PhilGEPS record of a year, as a download
const recordUrls = byYear(recordFiles);

// Every year's summary, newest first, with its records download
const years = [...byYear(summaryFiles)]
  .map(([year, summary]) => ({ year, ...summary, recordsUrl: recordUrls.get(year) ?? null }))
  .sort((a, b) => b.year - a.year);

export const ProcurementService = {
  years,
  sources: sourcesFile.officialSources,
  lawSources: sourcesFile.lawSources, // for the plain-language explanations of the law

  // The COA Annual Audit Report for a year (original files, see src/Data/Audit), or null
  auditReportFor: AuditService.reportFor,

  // A year's notices, loaded once per visit
  loadYear: cachedLoader(byYear(noticeFiles), "procurement", prepareYear),

  // A year's line items: { "<quarter>:<row>": [{ no, name, description, quantity, unit, budget }] }
  loadItems: cachedLoader(byYear(itemFiles), "items"),
  itemsKey: (notice) => `${notice.quarter}:${notice.row}`,

  forOffice: (notices, officeType) =>
    officeType === "all" ? notices : notices.filter((n) => n.officeType === officeType),

  stats: statsOf,

  // Rows for downloadCsv()
  csv: csvOf,
};
