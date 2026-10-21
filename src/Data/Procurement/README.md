# Procurement data

Data for the **Procurement Transparency** page (`/procurement`): bid notices and contract awards of government offices in Panabo City, from [PhilGEPS Open Data](https://philgeps.gov.ph/CmsHomePages/open-data).

The page shows the records **as they are**: every office in Panabo City (City Government, barangays, the state college and national offices), with no filtering to match other reports such as the budget.

## Files

| File | What it is | Used by |
| --- | --- | --- |
| `records/procurement-<year>.json` | **Every record** (one per line item), as PhilGEPS gives it, with the quarter file and row it came from. | The "All … records (JSON)" download. Copied into the build as a file, never bundled into the page. |
| `years/<year>.json` | **What the page loads**: one entry per notice, with its awards inside. `summary` holds the year's totals. | `ProcurementService` |
| `items/<year>.json` | Line items per notice (name, description, quantity, unit, item budget, as written), keyed `"<quarter>:<row>"`. Loaded only when someone opens a notice's items. Notices without item details are left out (every 2021 notice, and many others: PhilGEPS gives some notices no item rows). | `ProcurementService.loadItems` |
| `sources.json` | Official sources: the data (`officialSources`) and the procurement law behind the page's explanations (`lawSources`). | `ProcurementService` |

## How to update

1. Download the quarterly files from [PhilGEPS Open Data](https://philgeps.gov.ph/CmsHomePages/open-data) into a folder with one sub-folder per year, keeping the file names (they must start with `Q1`–`Q4`):
   ```
   PhilGeps/2024/Q1_2024_Jan-Mar.csv
   PhilGeps/2024/Q2_2024_Apr-Jun.csv
   ...
   ```
   Never edit these files. The scripts only read them.
2. Build every record, per year (about a minute for 4.5 GB):
   ```
   node scripts/procurement/convert-philgeps.cjs "<path to PhilGeps folder>"
   ```
3. Build the page files:
   ```
   node scripts/procurement/build-site-data.cjs
   ```
4. Check the page (`npm run dev`, then `/procurement`), and commit `records/`, `years/` and `items/`.

A new year folder is picked up by itself: it gets a year chip, and the "not yet added" note updates.

## How the numbers are counted

PhilGEPS gives one row per **line item**, and repeats:

- the **approved budget for the contract (ABC)** on every line of the same notice, and
- the **contract amount** on every line of the same award.

So `build-site-data.cjs` groups rows into notices (by office, PhilGEPS reference and title) and awards (by award reference), and each amount is counted **once per notice** and **once per award**. Adding up the rows instead overcounts: for 2024, ₱1.73B in approved budgets instead of ₱1.28B.

## What `convert-philgeps.cjs` does

- Keeps rows where `City/Municipality` is `Panabo City`.
- **2022 Q1** is in the old PhilGEPS format (an xlsx with no City/Municipality column). It keeps rows where the office name contains "PANABO", or the office is filed under Panabo City in the other files. Columns are renamed to the newer names, and two columns with personal data ("Created By", "Awardee Contact Person") are dropped.
- Some files have no header row (2021 Q4, 2022 Q2, 2022 Q4). It uses the header of another quarter of the same year.
- **Copies of another year are removed:** each 2021 quarter file also held the same 636 Panabo rows from 2024. Rows whose published date is in another year, and that are already in that year's file, are left out and listed under `excluded`.
- **Exact duplicate rows** (the same row twice in one file) are kept but marked with `duplicate_of_row`, and skipped by the page.
- Dates become `YYYY-MM-DD`, `NULL` becomes `null`, and amounts become numbers. Nothing else changes.
- Records the sha256 hash of every source file under `quarters`, so anyone can check the files were not changed.

## Known gaps (as of 21 October 2026)

| Year | Quarters | Award details (winner, contract amount) |
| --- | --- | --- |
| 2021 | Q1–Q4 | **Not in the files** |
| 2022 | Q1–Q4 | Yes |
| 2023 | **Not yet added** | – |
| 2024 | Q1–Q4 | Yes |
| 2025 | **Not yet added** | – |
| 2026 | Q1–Q3 | **Not in the files** |

## Wording rules

- **Say only what the data says.** Show PhilGEPS values as written (funding instrument, status, office type), without adding explanations of what they mean. An empty field reads "Not given"; never fill it from a guess or from other files. For example, the 2022 Q1 file has no office type, so its notices show "Type not given".
- A notice or an award is a public record, not a finding of wrongdoing. Describe methods such as negotiated procurement as facts; they are allowed by law.
- Every explanation of the law on the page cites `lawSources`. Under RA 9184 (2021–2024 notices) public bidding was the default; RA 12009 (in effect since 13 August 2024) makes it one of eleven methods. Don't call public bidding "the default" for later years.
- Don't cite the "1st Edition" IRR of RA 12009 (March 2026): the GPPB withdrew it (Public Advisory No. 09-2026). Cite the Official Gazette IRR.
