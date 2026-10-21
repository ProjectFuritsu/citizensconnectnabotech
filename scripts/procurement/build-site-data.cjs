// Step 2 of the procurement data: src/Data/Procurement/records/procurement-<year>.json
// (every record) -> src/Data/Procurement/years/<year>.json (what the page loads)
// and items/<year>.json (line items, loaded when a notice is opened).
// See src/Data/Procurement/README.md.
//
// Usage: node scripts/procurement/build-site-data.cjs
//
// PhilGEPS gives one row per line item, and repeats the approved budget on every
// line of a notice and the contract amount on every line of an award. This
// groups the rows into notices, each with its awards, so every amount appears once.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const inDir = path.join(root, 'src/Data/Procurement/records');
const outDir = path.join(root, 'src/Data/Procurement/years');
// Line items per notice, in their own file so the page loads them only when asked
const itemsDir = path.join(root, 'src/Data/Procurement/items');

const files = fs.readdirSync(inDir).filter((f) => /^procurement-\d{4}\.json$/.test(f)).sort();
const years = files.map((f) => JSON.parse(fs.readFileSync(path.join(inDir, f), 'utf8')));

// Office type, only from PhilGEPS's own organization type. When a file gives
// none (the old-format 2022 Q1 file), it stays "unknown": never guessed.
const officeType = (r) => {
  const orgType = r.pe_organization_type;
  if (!orgType) return 'unknown';
  if (orgType === 'City Government') return 'city';
  if (orgType === 'Barangay') return 'barangay';
  if (/State Universities/i.test(orgType)) return 'college';
  return 'national'; // Department, Attached Agency, GOCC
};

// One status per notice: the furthest step any of its line items reached
const STATUS_ORDER = ['Awarded', 'Active', 'Closed', 'Failed', 'Cancelled'];
const rank = (s) => (STATUS_ORDER.indexOf(s) === -1 ? STATUS_ORDER.length : STATUS_ORDER.indexOf(s));

const round = (n) => Math.round(n * 100) / 100;
const emptyTotals = () => ({ notices: 0, approvedBudget: 0, awards: 0, contractAmount: 0 });

fs.mkdirSync(outDir, { recursive: true });
for (const y of years) {
  const notices = new Map();
  for (const r of y.records) {
    if (r.duplicate_of_row != null) continue; // exact copy of another row
    const key = [r.procuring_entity_pe, r.bid_reference_no, r.notice_title].join('\u0001');
    let n = notices.get(key);
    if (!n) {
      n = {
        quarter: r.quarter,
        row: r.source_row,
        office: r.procuring_entity_pe,
        officeType: officeType(r),
        reference: r.bid_reference_no && r.bid_reference_no !== '0' ? r.bid_reference_no : null,
        title: r.notice_title,
        mode: r.procurement_mode,
        classification: r.classification,
        category: r.business_category ?? r.procurement_category ?? null,
        funding: r.funding_instrument, // which budget pays, as the office entered it
        fundingSource: r.funding_source ?? r.source_of_funds ?? null, // e.g. GOP, or a foreign lender
        approvedBudget: r.approved_budget_of_the_contract,
        published: r.published_date,
        status: r.bid_notice_status,
        lineItems: 0,
        awards: [],
        awardRefs: new Map(),
        items: [],
      };
      notices.set(key, n);
    }
    // A line item as written in PhilGEPS. Many rows carry the notice with no item
    // details at all (every 2021 row, for example); those are not counted as items.
    const item = {
      no: r.line_item_no,
      name: r.item_name,
      description: r.item_description,
      quantity: r.quantity,
      unit: r.uom,
      budget: r.item_budget,
    };
    if (Object.values(item).some((v) => v != null)) {
      n.lineItems++;
      n.items.push(item);
    }
    if (n.approvedBudget == null) n.approvedBudget = r.approved_budget_of_the_contract;
    if (rank(r.bid_notice_status) < rank(n.status)) n.status = r.bid_notice_status;
    if (r.award_reference_no && !n.awardRefs.has(r.award_reference_no)) {
      const award = {
        reference: r.award_reference_no,
        row: r.source_row,
        supplier: r.awardee_organization_name,
        supplierCity: r.city_municipality_of_awardee ?? null,
        supplierProvince: r.province_of_awardee ?? null,
        supplierSize: r.awardee_size ?? null,
        amount: r.contract_amount,
        awardDate: r.award_date,
      };
      n.awardRefs.set(r.award_reference_no, award);
      n.awards.push(award);
    }
  }

  const list = [...notices.values()].map(({ awardRefs, items, ...n }) => n);

  // Items keyed "<quarter>:<row>", the notice's quarter file and first row (unique
  // within a year); notices without item details are left out
  const itemsByNotice = {};
  for (const n of notices.values()) {
    const key = `${n.quarter}:${n.row}`;
    if (itemsByNotice[key]) throw new Error(`${y.year}: two notices share the key ${key}`);
    if (n.items.length) itemsByNotice[key] = n.items;
  }
  fs.mkdirSync(itemsDir, { recursive: true });
  const itemsFile = path.join(itemsDir, `${y.year}.json`);
  fs.writeFileSync(itemsFile, `{\n${Object.entries(itemsByNotice).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`);
  JSON.parse(fs.readFileSync(itemsFile, 'utf8'));
  const summary = {
    quarters: Object.keys(y.quarters).sort(),
    hasAwards: list.some((n) => n.awards.length > 0),
    all: emptyTotals(),
    byOfficeType: {},
  };
  for (const n of list) {
    for (const t of [summary.all, (summary.byOfficeType[n.officeType] ??= emptyTotals())]) {
      t.notices++;
      t.approvedBudget += n.approvedBudget ?? 0;
      t.awards += n.awards.length;
      t.contractAmount += n.awards.reduce((s, a) => s + (a.amount ?? 0), 0);
    }
  }
  for (const t of [summary.all, ...Object.values(summary.byOfficeType)]) {
    t.approvedBudget = round(t.approvedBudget);
    t.contractAmount = round(t.contractAmount);
  }

  const out = {
    year: y.year,
    summary,
    source: {
      name: y.source,
      url: y.source_url,
      generated: y.generated,
      filters: [...new Set(Object.values(y.quarters).map((q) => q.filter))],
      excludedCopies: y.excluded ? y.excluded.count : 0,
      duplicateRows: y.records.filter((r) => r.duplicate_of_row != null).length,
    },
    notices: list,
  };
  const outFile = path.join(outDir, `${y.year}.json`);
  const { notices: rows, ...head } = out;
  const headJson = JSON.stringify(head, null, 2);
  fs.writeFileSync(outFile, `${headJson.slice(0, -2)},\n  "notices": [\n${rows.map((n) => '    ' + JSON.stringify(n)).join(',\n')}\n  ]\n}\n`);
  JSON.parse(fs.readFileSync(outFile, 'utf8')); // stop here if the hand-built JSON is broken
  console.log(`${y.year}: ${list.length} notices, ${summary.all.awards} awards, approved budgets ${summary.all.approvedBudget.toLocaleString()}, contracts ${summary.all.contractAmount.toLocaleString()} -> ${path.relative(root, outFile)} (${(fs.statSync(outFile).size / 1e3).toFixed(0)} KB)`);
}
