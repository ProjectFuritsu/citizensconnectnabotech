// Step 1 of the procurement data: raw PhilGEPS quarterly files -> one
// procurement-<year>.json per year with every Panabo City record.
// See src/Data/Procurement/README.md.
//
// Usage: node scripts/procurement/convert-philgeps.cjs <PhilGeps folder> [output folder]
// The PhilGeps folder holds one folder per year (2021/, 2022/, ...) with the
// quarterly files as downloaded (Q1_..., Q2_...). They are only read, never changed.
// Output folder default: src/Data/Procurement/records
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { StringDecoder } = require('string_decoder');
const { openWorkbook } = require('./xlsx.cjs');

const base = process.argv[2];
const outDir = process.argv[3] || path.join(__dirname, '../../src/Data/Procurement/records');
if (!base) { console.error('Usage: node convert-philgeps.cjs <PhilGeps folder> [output folder]'); process.exit(1); }
const CITY = 'Panabo City';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());

// Old PhilGEPS format (2022 Q1 xlsx): rename columns to the newer names; drop personal data.
const RENAME = {
  'Procuring Entity': 'Procuring Entity (PE)',
  'Award No.': 'Award Reference No.',
  'Notice Status': 'Bid Notice Status',
  'Award Status': 'Award Notice Status',
  'Contract Efectivity Date': 'Contract Effectivity Date',
};
const DROP = new Set(['Created By', 'Awardee Contact Person']);

// ---------- CSV parsing (streamed, quote-aware, handles newlines inside quotes) ----------
class CsvParser {
  constructor(onRow) { Object.assign(this, { onRow, field: '', row: [], inQ: false, quotePending: false, skipLF: false, first: true }); }
  endRow() {
    this.row.push(this.field); this.field = '';
    const row = this.row; this.row = [];
    if (!(row.length === 1 && row[0] === '')) this.onRow(row);
  }
  push(s) {
    if (this.first) { this.first = false; if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); }
    let i = 0, start = 0;
    const n = s.length;
    if (this.quotePending) {
      this.quotePending = false;
      if (n && s.charCodeAt(0) === 34) { this.field += '"'; i = start = 1; } else this.inQ = false;
    }
    if (this.skipLF) { this.skipLF = false; if (!this.inQ && i < n && s.charCodeAt(i) === 10) i = start = i + 1; }
    while (i < n) {
      if (this.inQ) {
        const q = s.indexOf('"', i);
        if (q === -1) { this.field += s.slice(start); i = start = n; break; }
        this.field += s.slice(start, q);
        if (q + 1 === n) { this.quotePending = true; i = start = n; break; }
        if (s.charCodeAt(q + 1) === 34) { this.field += '"'; i = start = q + 2; continue; }
        this.inQ = false; i = start = q + 1; continue;
      }
      const c = s.charCodeAt(i);
      if (c === 44) { this.field += s.slice(start, i); this.row.push(this.field); this.field = ''; i = start = i + 1; }
      else if (c === 10 || c === 13) {
        this.field += s.slice(start, i); this.endRow();
        if (c === 13) { if (i + 1 < n) { if (s.charCodeAt(i + 1) === 10) i++; } else this.skipLF = true; }
        i = start = i + 1;
      }
      else if (c === 34 && i === start && this.field === '') { this.inQ = true; i = start = i + 1; }
      else i++;
    }
    this.field += s.slice(start);
  }
  end() { if (this.field !== '' || this.row.length) this.endRow(); }
}

function streamCsv(file, onRow) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const dec = new StringDecoder('utf8');
    const parser = new CsvParser(onRow);
    const s = fs.createReadStream(file, { highWaterMark: 1 << 22 });
    s.on('data', b => { hash.update(b); parser.push(dec.write(b)); });
    s.on('end', () => { parser.push(dec.end()); parser.end(); resolve(hash.digest('hex')); });
    s.on('error', reject);
  });
}

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(file, { highWaterMark: 1 << 22 }).on('data', b => hash.update(b)).on('end', () => resolve(hash.digest('hex'))).on('error', reject);
  });
}

function firstCsvLine(file) {
  const fd = fs.openSync(file, 'r'); const b = Buffer.alloc(8192); fs.readSync(fd, b, 0, 8192, 0); fs.closeSync(fd);
  const rows = []; new CsvParser(r => rows.push(r)).push(b.toString('utf8').split(/\r?\n/)[0] + '\n');
  return rows[0];
}
const isHeader = cells => /^Procuring Entity\b/.test(String(cells[0]).replace(/^﻿/, '').trim());

// ---------- value conversion ----------
const snake = h => h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const isDateCol = h => /date/i.test(h);
const isMoneyOrQty = h => /budget|amount|quantity/i.test(h);
const isIntCol = h => /^(line item no|contract duration)$/i.test(h.trim());
const pad = n => String(n).padStart(2, '0');
const validYMD = (y, m, d) => m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
function excelSerialToISO(serial) {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(serial * 86400000));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function convert(h, raw, stats) {
  if (raw == null) return null;
  if (typeof raw === 'number') { // xlsx number cell
    if (isDateCol(h)) { stats.serialDates++; return excelSerialToISO(raw); }
    return isMoneyOrQty(h) || isIntCol(h) ? raw : String(raw);
  }
  const v = String(raw).trim();
  if (v === '' || v.toUpperCase() === 'NULL') return null;
  if (isDateCol(h)) {
    let m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/);
    if (m && validYMD(+m[3], +m[2], +m[1])) { if (m[4]) stats.timeDropped++; return `${m[3]}-${pad(m[2])}-${pad(m[1])}`; }
    m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m && validYMD(+m[1], +m[2], +m[3])) return `${m[1]}-${m[2]}-${m[3]}`;
    (stats.badDates[h] = stats.badDates[h] || []).length < 5 && stats.badDates[h].push(v);
    stats.badDateCount++;
    return v;
  }
  if (isMoneyOrQty(h)) {
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)) return Number(v.replace(/,/g, ''));
    stats.badNumbers[h] = (stats.badNumbers[h] || 0) + 1;
    return v;
  }
  if (isIntCol(h) && /^\d+$/.test(v)) return Number(v);
  return v;
}

const recKey = r => [r.procuring_entity_pe, r.bid_reference_no, r.notice_title, r.line_item_no, r.item_name, r.award_reference_no, r.published_date].join('\u0001');

(async () => {
  const years = fs.readdirSync(base).filter(d => /^\d{4}$/.test(d) && fs.statSync(path.join(base, d)).isDirectory()).sort();
  const Y = {};
  const jobs = [];
  for (const year of years) {
    const dir = path.join(base, year);
    const files = fs.readdirSync(dir).filter(f => /^Q[1-4]/i.test(f) && /\.(csv|xlsx)$/i.test(f)).sort();
    if (!files.length) { console.log(`${year}: no quarterly files, skipped`); continue; }
    let fallbackHeader = null;
    for (const f of files.filter(f => /\.csv$/i.test(f))) { const l = firstCsvLine(path.join(dir, f)); if (isHeader(l)) { fallbackHeader = l; break; } }
    Y[year] = { quarters: {}, records: [], fields: {}, stats: { badDates: {}, badDateCount: 0, badNumbers: {}, timeDropped: 0, serialDates: 0 }, fallbackHeader };
    for (const f of files) jobs.push({ year, f, file: path.join(dir, f), q: f.match(/^Q([1-4])/i)[0].toUpperCase(), xlsx: /\.xlsx$/i.test(f) });
  }

  // CSV files first, so the list of entities filed under Panabo City is known before the old-format xlsx.
  const panaboEntities = new Set();
  jobs.sort((a, b) => a.xlsx - b.xlsx);

  for (const job of jobs) {
    const y = Y[job.year];
    let header = null, keep = null, headerNote = 'own header', filterNote = null, rowNo = 0, total = 0, kept = 0, widthIssues = 0;
    const handle = (cells, sourceRow) => {
      if (!header) {
        if (isHeader(cells)) { header = cells.map(c => String(c).replace(/^﻿/, '').trim()); }
        else { header = y.fallbackHeader; headerNote = 'no header row in the file; used the header of another quarter of the same year'; }
        const renamed = header.map(h => RENAME[h] || h);
        const cityIdx = header.indexOf('City/Municipality');
        const entIdx = renamed.indexOf('Procuring Entity (PE)');
        if (cityIdx >= 0) {
          filterNote = `City/Municipality = "${CITY}"`;
          keep = c => String(c[cityIdx] ?? '').trim().toLowerCase() === CITY.toLowerCase();
        } else {
          filterNote = 'Old PhilGEPS format with no City/Municipality column. Kept rows where the Procuring Entity name contains "PANABO", or the entity is filed under Panabo City in the other quarterly files.';
          keep = c => { const e = String(c[entIdx] ?? '').trim(); return /panabo/i.test(e) || panaboEntities.has(e.toUpperCase()); };
        }
        header = renamed;
        if (isHeader(cells)) return;
      }
      total++;
      if (cells.length !== header.length) widthIssues++;
      if (!keep(cells)) return;
      kept++;
      const rec = { quarter: job.q, source_row: sourceRow };
      header.forEach((h, i) => {
        if (DROP.has(h)) return;
        const k = snake(h);
        y.fields[k] = h;
        rec[k] = convert(h, cells[i], y.stats);
      });
      if (!job.xlsx) panaboEntities.add(String(rec.procuring_entity_pe).toUpperCase());
      // Deep copy: field strings are slices of 4 MB read chunks and would keep every chunk alive.
      y.records.push(JSON.parse(JSON.stringify(rec)));
    };

    let sha;
    if (!job.xlsx) sha = await streamCsv(job.file, cells => { rowNo++; handle(cells, rowNo); });
    else {
      const wb = openWorkbook(job.file);
      await wb.streamSheet(wb.sheets[0].path, ({ r, cells }) => {
        const vals = [];
        for (let i = 0; i < cells.length; i++) { const c = cells[i]; vals.push(!c || c.value == null ? null : (c.kind === 'n' || c.kind === 'date') ? c.value : String(c.value)); }
        if (!vals.some(v => v != null && v !== '')) return;
        handle(vals, r);
      });
      sha = await sha256File(job.file);
    }
    const dropped = header.filter(h => DROP.has(h));
    y.quarters[job.q] = {
      file: `${job.year}/${job.f}`, sha256: sha, rows_in_file: total, filter: filterNote, records: kept,
      ...(headerNote !== 'own header' ? { header: headerNote } : {}),
      ...(dropped.length ? { columns_removed: dropped.map(h => `${h} (personal data)`) } : {}),
    };
    console.log(`${job.year} ${job.q}  ${job.f}: ${total} rows, ${kept} kept${widthIssues ? `, ${widthIssues} rows with a different column count` : ''}${headerNote !== 'own header' ? ' [no header row]' : ''}`);
  }

  // Rows whose published date falls in another year and that already appear in that year's file are copies: take them out.
  const keysByYear = {};
  for (const [year, y] of Object.entries(Y)) keysByYear[year] = new Set(y.records.map(recKey));
  for (const [year, y] of Object.entries(Y)) {
    const out = { count: 0, by_quarter: {}, source_rows: {} };
    const keepRecs = [];
    for (const r of y.records) {
      const py = (r.published_date || '').slice(0, 4);
      if (py && py !== year && keysByYear[py] && keysByYear[py].has(recKey(r))) {
        out.count++; out.by_quarter[r.quarter] = (out.by_quarter[r.quarter] || 0) + 1;
        (out.source_rows[r.quarter] = out.source_rows[r.quarter] || []).push(r.source_row);
        out.copy_of = out.copy_of || new Set(); out.copy_of.add(py);
      } else keepRecs.push(r);
    }
    y.records = keepRecs;
    if (out.count) {
      const other = [...out.copy_of].join(', ');
      delete out.copy_of;
      y.excluded = { reason: `Copies of ${other} records. Their published date is in ${other}, and the same records are already in procurement-${other}.json.`, ...out };
    }
  }

  // Same fields on every record of a year (a quarter in the old format lacks some),
  // and exact copies of another row in the same file marked with that row's number.
  for (const y of Object.values(Y)) {
    const keys = Object.keys(y.fields);
    const firstRow = new Map();
    y.duplicates = {};
    y.records = y.records.map((r) => {
      const rec = { quarter: r.quarter, source_row: r.source_row };
      for (const k of keys) rec[k] = r[k] ?? null;
      const content = r.quarter + JSON.stringify(keys.map((k) => rec[k]));
      rec.duplicate_of_row = firstRow.get(content) ?? null;
      if (rec.duplicate_of_row == null) firstRow.set(content, r.source_row);
      else y.duplicates[r.quarter] = (y.duplicates[r.quarter] || 0) + 1;
      return rec;
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const [year, y] of Object.entries(Y)) {
    const counts = {};
    for (const q of Object.keys(y.quarters).sort()) counts[q] = y.records.filter(r => r.quarter === q).length;
    for (const q of Object.keys(y.quarters)) {
      y.quarters[q].records = counts[q];
      if (y.duplicates[q]) y.quarters[q].duplicate_rows = y.duplicates[q];
    }
    const duplicateCount = Object.values(y.duplicates).reduce((a, b) => a + b, 0);
    const pubYears = {};
    for (const r of y.records) { const k = r.published_date ? r.published_date.slice(0, 4) : 'none'; pubYears[k] = (pubYears[k] || 0) + 1; }

    const notes = [
      'Each record is one line item of a PhilGEPS notice, with its award if any.',
      'Approved Budget of the Contract repeats on every line item of the same notice. Count it once per notice, not once per record.',
      'Contract Amount repeats on every line item of the same award. Count it once per award (award_reference_no), not once per record.',
      'quarter is the quarterly PhilGEPS file the record came from. source_row is its row number in that file (header = row 1).',
      'Changes from the source: dates -> YYYY-MM-DD (times dropped); "NULL" and blank cells -> null; text trimmed; budget, amount and quantity as numbers.',
      'Field names are the source column names in snake_case. See "fields" for the original names.',
    ];
    if (Object.values(y.quarters).some(q => q.header)) notes.push('Some quarter files have no header row; the header of another quarter of the same year was used (same column count).');
    if (Object.values(y.quarters).some(q => !q.filter.startsWith('City'))) notes.push('One quarter uses the old PhilGEPS format: some columns were renamed to the newer names, and personal data columns were removed. See "quarters". Fields a quarter does not have are null.');
    if (y.excluded) notes.push(`${y.excluded.count} rows were taken out as copies of another year. See "excluded".`);
    if (duplicateCount) notes.push(`${duplicateCount} rows are exact copies of another row in the same file. They are kept, with duplicate_of_row set to that row's source_row; skip them when counting line items.`);

    const out = {
      title: `PhilGEPS procurement records, Panabo City, ${year}`,
      dataset: 'philgeps-procurement',
      source: 'PhilGEPS open data (Philippine Government Electronic Procurement System)',
      source_url: 'https://philgeps.gov.ph/CmsHomePages/open-data',
      year: Number(year),
      schema_version: '0.1',
      generated: today,
      notes,
      record_count: y.records.length,
      quarter_counts: counts,
      quarters: y.quarters,
      ...(y.excluded ? { excluded: y.excluded } : {}),
      fields: { ...y.fields, duplicate_of_row: 'source_row of the row this one is an exact copy of (null if none)' },
      records: y.records,
    };
    const outFile = path.join(outDir, `procurement-${year}.json`);
    // Readable header, one record per line: smaller than full indenting, and git diffs show changed records
    const { records, ...head } = out;
    const headJson = JSON.stringify(head, null, 2);
    fs.writeFileSync(outFile, `${headJson.slice(0, -2)},\n  "records": [\n${records.map((r) => '    ' + JSON.stringify(r)).join(',\n')}\n  ]\n}\n`);
    JSON.parse(fs.readFileSync(outFile, 'utf8')); // stop here if the hand-built JSON is broken
    console.log(`\n${year}: ${y.records.length} records ${JSON.stringify(counts)} -> ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB)`);
    console.log('  published_date years', JSON.stringify(pubYears));
    if (y.excluded) console.log('  excluded', y.excluded.count, JSON.stringify(y.excluded.by_quarter));
    if (y.stats.badDateCount) console.log('  unparsed dates', y.stats.badDateCount, JSON.stringify(y.stats.badDates));
    if (Object.keys(y.stats.badNumbers).length) console.log('  non-numeric amounts', JSON.stringify(y.stats.badNumbers));
    if (y.stats.timeDropped || y.stats.serialDates) console.log('  text dates with time', y.stats.timeDropped, '| xlsx date cells', y.stats.serialDates);
  }
})().catch(e => { console.error(e); process.exit(1); });
