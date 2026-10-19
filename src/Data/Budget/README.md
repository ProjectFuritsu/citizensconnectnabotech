# Budget data

The Budget Transparency page (`/budget`) reads these files. They're part of the website: edit, commit and deploy, and the page updates.

```
years/2021.json …     ← one file per fiscal year; new files are picked up automatically
sources.json          ← official source links, always shown on the page
*.schema.json         ← field descriptions and checks for the editor
```

The original reports behind the "Download the original report" button are in `public/reports/budget/`.

**Only what's shown is loaded:**

- **Every year's `totals`:** bundled with the site, a few numbers per year. They drive the year buttons, the "Revenue and spending over the years" chart and the "vs last year" figures.
- **A year's lines** (`revenue` and `expenditures`): loaded only when that year is opened, so a visitor who looks at 2024 never downloads 2021–2023.

The file name sets the year: `years/2025.json` is 2025. Keep `"year"` inside the file the same; if they differ, the browser console says so.

## Where the numbers come from

Each year comes from the **Commission on Audit's Annual Audit Report** for Panabo City, specifically Part 1 – Financial Statements, *Statement of Comparison of Budget and Actual Amounts* (SCBAA):

| Year | Source file (in `public/reports/budget/`)               |
| ---- | ------------------------------------------------------- |
| 2021 | `08-PanaboCity2021_Part1-FS.xlsx`, sheet SCBAA          |
| 2022 | `09-PanaboCity2022_Part1-Financial_Statements.xlsx`, sheet SCBAA |
| 2023 | `09-PanaboCity2023_Part1-FS.xlsx`, sheet SCBAA          |
| 2024 | `09-PanaboCity2024_Part1-FS.pdf`, pages 5–7             |

The figures were extracted automatically, then checked against the report itself:

- **Differences:** for every line, the "Difference Original and Final Budget" and "Difference Final Budget and Actual" columns were recomputed and compared with the printed ones.
- **Totals:** the lines were checked to add up to the printed totals (revenue, current, continuing and total appropriations).

All four years match to the centavo. The page repeats the totals check every time it loads, and warns in the browser console if a file doesn't add up.

Two item names were made consistent across years so the years line up:

- "MPBF" (2021–2023) and "Miscellaneous Personnel Benefits Fund (PS)" (2024) became **"Miscellaneous Personnel Benefits Fund (MPBF)"**.
- 2022's "Share from the National Internal Revenue Taxes" became **"… (IRA)"**, as in the other years.

## The format

One line per row of the report. Only Original, Final and Actual are stored; the page works out the differences.

```json
{ "appropriation": "current", "sector": "General Public Services", "item": "Personnel Services", "original": 274852405.2, "final": 271983899, "actual": 239243955.87 }
```

- **`appropriation`:** `"current"` is this year's budget; `"continuing"` is budgets carried over from earlier years.
- **`group`:** only on lines under Other Purposes, e.g. `"Debt Service"`, `"LDRRMF"`, `"20% Development Fund"`, `"Others"`.
- **Revenue lines:** use `category` (Local Sources, External Sources, Receipts from Borrowings), an optional `group` (Tax Revenue, Non-Tax Revenue) and `item`.
- **`totals`:** copies the report's printed totals, used for the check above.
- **`sourceDocument`:** link to the original report, e.g. `"/reports/budget/09-PanaboCity2024_Part1-FS.pdf"`. Leave it out to hide the download button.
- **Amounts:** plain numbers in pesos (no commas or ₱). A negative is `-123.45`, not `(123.45)`.

Empty template rows from the report (all zeros) are left out.

**2024:** the report gives continuing appropriations as a single total without a sector breakdown. The page shows that total and says so.

In VS Code, hover over any field for an explanation; mistakes are underlined in red.

## Adding a new year

1. **Create the year file:** from the new Annual Audit Report's SCBAA, create `years/2025.json` in the format above. The extractor used for 2021–2024 can do this and runs the same checks; ask for it to be added to the project as a script.
2. **Add the original report:** put the financial statements file in `public/reports/budget/` and set `sourceDocument` to `"/reports/budget/<file name>"`.
3. **Publish:** commit and deploy, then open `/budget`. The new year appears as the first chip.
