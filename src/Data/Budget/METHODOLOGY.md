# How the budget figures were made

Every number on the Budget Transparency page (`/budget`) comes from one kind of official document: the **Annual Audit Report** for the City Government of Panabo, prepared by the **Commission on Audit (COA)**. Nothing was typed in by hand, estimated, or taken from anywhere else.

This document explains, in order:

1. [The source documents](#1-the-source-documents)
2. [What the report's columns mean](#2-what-the-reports-columns-mean)
3. [How the report maps to the data files](#3-how-the-report-maps-to-the-data-files)
4. [How the numbers were extracted](#4-how-the-numbers-were-extracted)
5. [How they were checked](#5-how-they-were-checked)
6. [How each figure on the page is calculated](#6-how-each-figure-on-the-page-is-calculated)
7. [Things to keep in mind](#7-things-to-keep-in-mind)
8. [Reference figures for spot checks](#8-reference-figures-for-spot-checks)

For editing the files or adding a year, see [README.md](README.md).

---

## 1. The source documents

COA audits every local government each year and publishes an Annual Audit Report on its website ([coa.gov.ph](https://www.coa.gov.ph/)). Each report has several parts; the figures here come from **Part 1 – Financial Statements**, from one table in it: the **Statement of Comparison of Budget and Actual Amounts** (SCBAA). That table lists, line by line, what the city planned to collect and spend, and what it actually collected and spent.

| Year | Report file | Where the table is |
| ---- | ----------- | ------------------ |
| 2021 | `08-PanaboCity2021_Part1-FS.xlsx` | sheet **SCBAA** |
| 2022 | `09-PanaboCity2022_Part1-Financial_Statements.xlsx` | sheet **SCBAA** |
| 2023 | `09-PanaboCity2023_Part1-FS.xlsx` | sheet **SCBAA** |
| 2024 | `09-PanaboCity2024_Part1-FS.pdf` | **pages 5–7** |

All four files are in `src/Data/Audit/reports/<year>/`, with the rest of each year's audit report. Visitors can download them from the page ("Download the original report") and compare them with the dashboard themselves.

## 2. What the report's columns mean

The SCBAA has five number columns:

| Column in the report | Meaning | Stored? |
| -------------------- | ------- | ------- |
| **Budgeted Amounts: Original** | The yearly budget as first approved by the Sangguniang Panlungsod (for 2021, approved on March 29, 2021). | Yes, as `original` |
| **Budgeted Amounts: Final** | The original budget plus supplemental budgets and realignments approved during the year. | Yes, as `final` |
| **Difference Original and Final Budget** | Original minus Final. | No; worked out from the two above |
| **Actual Amounts** | What was actually collected or spent. | Yes, as `actual` |
| **Difference Final Budget and Actual** | Final minus Actual. | No; worked out from the two above |

Two facts from the report's *Notes to the Financial Statements* (read from the 2021 report) shape how the page describes these numbers:

- **Basis:** "The annual budget is prepared on the modified cash basis." The Actual column is on the same basis, so it's broadly money actually received and paid out during the year. That's why the page says **Collected** and **Spent**.
- **Scope:** the budget is "appropriated from the General Fund and Economic Enterprise for the operation of the City Government", and also includes "the appropriation from Special Education Fund for Local School Board (LSB) operations". So the figures cover the city's General Fund, its economic enterprises and the Special Education Fund.

## 3. How the report maps to the data files

Each year is one file, `years/<year>.json`. Each row of the report's table becomes one line in the file, in the same order and with the same names:

| Part of the report | In the file | Example |
| ------------------ | ----------- | ------- |
| **Revenue** (Local Sources, External Sources, Receipts from Borrowings) | `revenue`: one line per source, with `category`, optional `group` (Tax Revenue, Non-Tax Revenue) and `item` | Local Sources › Tax Revenue › Tax Revenue - Property |
| **Current Appropriations**: this year's budget, by sector | `expenditures` with `"appropriation": "current"`: one line per sector and expense class (Personnel Services, MOOE, Capital Outlay) | General Public Services › Personnel Services |
| Lines under **Other Purposes** | the same, plus a `group` | Other Purposes › Debt Service › … |
| **Continuing Appropriations**: earlier years' budgets still available | `expenditures` with `"appropriation": "continuing"` | General Public Services › Capital Outlay |
| The printed totals (Total Revenue and Receipts, Total Current Appropriations, Total Continuing Appropriations, Total Appropriations, Surplus/Deficit) | `totals` | |

The six sectors are General Public Services; Education; Health, Nutrition and Population Control; Social Services and Social Welfare; Economic Services; and Other Purposes.

Each file also records `source` (shown on the page), `sourceFile` (the exact file and sheet or pages) and `sourceDocument` (the download link).

## 4. How the numbers were extracted

The extraction was done by a script, not by retyping:

1. **Read the table.**
   - **2021–2023 (Excel):** the script read the SCBAA sheet cell by cell, so the stored values are exactly what's in the spreadsheet, centavos included.
   - **2024 (PDF):** the script read the text of pages 5–7 together with each piece of text's position on the page, and assigned every number to a column by where it sits horizontally. This avoids mixing up columns when a cell is blank.
2. **Convert the numbers:** commas and peso signs removed; amounts in parentheses, the accounting way of writing negatives, stored as negative numbers.
3. **Keep only real lines:** rows that are blank templates in the report, with zero in every column, were left out. No other rows were dropped.
4. **Make names consistent across years**, so the same line lines up from year to year. Only two names changed:
   - "MPBF" (2021–2023) and "Miscellaneous Personnel Benefits Fund (PS)" (2024) both became **"Miscellaneous Personnel Benefits Fund (MPBF)"**.
   - 2022's "Share from the National Internal Revenue Taxes" became **"Share from the National Internal Revenue Taxes (IRA)"**, as in the other years.
5. **Save the printed totals** alongside the lines, for the checks below.

The script itself isn't part of the project. It can be added as a project script to extract future years the same way.

## 5. How they were checked

Before anything was saved, every year passed two checks against the report itself:

- **Every line:** both "Difference" columns were recomputed from Original, Final and Actual, and compared with the numbers printed in the report.
- **Every total:** the lines were added up and compared with the report's printed totals for revenue, current appropriations, continuing appropriations and total appropriations.

**All four years matched to the centavo.**

The page checks again every time a year loads. If the lines in a file stop adding up to its saved totals (for example, after a typo while editing), a warning appears in the browser console naming the year, the section and both amounts.

## 6. How each figure on the page is calculated

All amounts are for the selected year. "The report's" means the stored Original, Final and Actual columns.

**Overview tiles**

| On the page | Calculated from |
| ----------- | --------------- |
| **Final budget**, and "Original … during the year" | *Total Current Appropriations*: Final, Original, and (Final − Original) ÷ Original |
| **Spent** | *Total Current Appropriations*: Actual |
| "… vs \<last year>" | This year's Spent compared with the closest earlier year's |
| **Unspent** | *Total Current Appropriations*: Final − Actual (the report's "Difference Final Budget and Actual") |
| **Budget used** | *Total Current Appropriations*: Actual ÷ Final |
| **Revenue collected**, "Target" | *Total Revenue and Receipts*: Actual, Final |
| **Revenue vs target** | *Total Revenue and Receipts*: Actual ÷ Final |
| **Total spending** | *Total Appropriations*: Actual. Includes money spent from earlier years' budgets (continuing appropriations) |
| **Surplus** or **Deficit** | *Surplus (Deficit)*: Actual. This equals revenue collected minus total spending |

**Charts and tabs**

| On the page | Calculated from |
| ----------- | --------------- |
| Budget vs spending by sector | Each sector's current-appropriation lines added up: Final and Actual |
| Where the money went | The same sector totals (Actual), as shares of Spent |
| Revenue and spending over the years | Each year's Revenue collected and Total spending |
| Budget changes during the year | Each sector's Final − Original: raised (+) or cut (−) |
| Spending lines › All budget lines | Every current-appropriation line: Final and Actual |
| Spending lines › Lines changed during the year | Every line whose Final differs from its Original |
| Spending lines › Carried over from earlier years | The continuing-appropriation lines, added up by sector |
| Revenue › by category, by source | The revenue lines, grouped by category, and one by one |
| Table view | Every current-appropriation and revenue line: Original, Final, Actual, the change during the year (Final − Original), Final − Actual, and Actual ÷ Final |
| **Download CSV** | Every line exactly as stored, including continuing appropriations, with both Difference columns worked out the way the report does |

Headline amounts are rounded for reading (₱2.01B), with the exact peso amount shown underneath. Percentages are rounded to one decimal place.

## 7. Things to keep in mind

- **Loans count as revenue.** The report lists *Receipts from Borrowings* under revenue, so "Revenue collected" includes loan proceeds in years with borrowing. The Revenue tab says so.
- **The final budget is usually much larger than the original,** because supplemental budgets and realignments are added during the year. In 2021 it went from ₱1.24 billion to ₱2.08 billion.
- **A large "Unspent" amount isn't necessarily waste or savings.** It's what the report shows as budgeted but not paid out during the year. Part of it can still be spent the following year, as continuing appropriations.
- **2024's continuing appropriations** are given in the report only as a single total, with no breakdown by sector. The page shows that total and says so.
- **This dashboard isn't an audit.** It presents the audited figures as COA published them, in an easier-to-read form. For COA's findings and recommendations, see the other parts of each Annual Audit Report.
- **Mistakes and corrections:** if a figure on the page doesn't match the report, the report is correct. Compare the year's file in `years/` with the report, fix it, and the page's own check will confirm the totals still add up.

## 8. Reference figures for spot checks

Exact amounts from the report's totals, as stored in each year's file. Pick any one, find it in the original report, and it should match exactly.

| Year | Revenue collected | Final budget | Spent (current) | Total spending | Surplus |
| ---- | ----------------- | ------------ | --------------- | -------------- | ------- |
| 2021 | ₱1,766,730,944.67 | ₱2,079,244,197.11 | ₱1,200,515,258.07 | ₱1,480,737,912.90 | ₱285,993,031.77 |
| 2022 | ₱2,702,195,642.23 | ₱1,830,252,244.03 | ₱1,211,487,737.65 | ₱1,684,998,398.05 | ₱1,017,197,244.18 |
| 2023 | ₱2,568,572,915.40 | ₱1,856,173,663.77 | ₱1,280,058,362.93 | ₱1,638,003,887.03 | ₱930,569,028.37 |
| 2024 | ₱2,582,763,976.54 | ₱2,013,398,477.15 | ₱1,362,542,542.19 | ₱1,628,200,253.18 | ₱954,563,723.36 |

Number of lines stored:

| Year | Revenue lines | Current-appropriation lines | Continuing-appropriation lines |
| ---- | ------------- | --------------------------- | ------------------------------ |
| 2021 | 12 | 26 | 7 |
| 2022 | 10 | 24 | 5 |
| 2023 | 10 | 25 | 5 |
| 2024 | 13 | 24 | 0 (total only) |
