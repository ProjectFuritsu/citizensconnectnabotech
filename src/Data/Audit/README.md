# COA audit reports

The Commission on Audit's **Annual Audit Reports (AAR)** on the City Government of Panabo, as the original files COA released. They're used by:
- **Procurement Transparency:** links the selected year's report.
- **Budget Transparency:** its "Download the original report" link opens the year's Part 1 financial statements.

| File | What it is |
| --- | --- |
| `reports/<year>/` | The original report files, one per part (cover, Part 1 financial statements, Part 2 observations and recommendations, Part 3 status of earlier recommendations, Part 4 annexes, and so on). |
| `reports.json` | The list of parts per year: plain-language `label`, `file` (its path inside `reports/`, e.g. `"2024/09-PanaboCity2024_Part1-FS.pdf"`), `format`, `sizeKB`, the `originalName` as received and its `sha256` hash. `role` marks the two parts the page shows first: `findings` (Part 2) and `followUp` (Part 3). |

`src/Services/AuditService.js` gives each file its web address when the site is built. A file listed in `reports.json` but missing from `reports/` shows a warning in the browser console.

## Adding a year

1. Copy the report's numbered files (`01-…`, `02-…`) into `reports/<year>/`. Don't edit them. Take out apostrophes and spaces from file names, since they break links (e.g. `Auditor's_Report` → `Auditors_Report`), and keep the original name in `originalName`.
2. Add the year to `reports.json` in the same shape as the others.
3. For the Budget page, point that year's `sourceDocument` (in `src/Data/Budget/years/<year>.json`) at the Part 1 financial statements file.

The report covers the City Government only. Barangays, the state college and national offices are audited separately.

COA's observations are audit findings, not proof of wrongdoing. Link the original report and describe its contents in neutral words.
