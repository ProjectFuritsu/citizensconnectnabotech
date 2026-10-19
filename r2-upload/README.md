# Budget data (Cloudflare R2)

This folder is the **master copy of the `budget-data` R2 bucket**. The Budget Transparency page (`/budget`) loads everything from the bucket; nothing here is bundled into the website. Keep this folder and the bucket identical: edit here, commit, then upload what changed.

```
budget/index.json            ← which years exist; the page reads this first
budget/sources.json          ← official source links, always shown on the page
budget/years/2021.json …     ← one file per fiscal year
budget/*.schema.json         ← editor help and checks (uploading them is optional)
aar/2021/… aar/2024/…        ← the original financial statements ("Download the original report")
```

## How the site reaches the bucket

Some internet providers in the Philippines block `r2.dev`, both the address lookup and the connection. So the browser never connects to the bucket. It asks the website for `/data/...` instead (`data.r2Url` is `"/data"` in `src/Config/site.config.json`):

| Where | `/data/...` comes from |
| --- | --- |
| Live site | `vercel.json` forwards it to the bucket at `https://pub-91dc9bb8dbe441e286321cf2a56274c8.r2.dev`. Vercel's servers do the fetching, so it works on every network. |
| `npm run dev` / `npm run preview` | `vite.config.js` forwards it to the live site, so you see what's in the bucket even on a network that blocks `r2.dev`. This only works once the `vercel.json` rule is deployed. |

**If the bucket's public URL changes,** update the `destination` in `vercel.json`.

**CORS policy (optional):** only needed if the browser fetches from the bucket directly, i.e. if `data.r2Url` is set to a bucket URL instead of `"/data"`. In Cloudflare: R2 → `budget-data` → Settings → CORS Policy → Add, then paste:

```json
[
  {
    "AllowedOrigins": [
      "https://citizensconnectnabotech.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:4173"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Add any other address the site runs on, such as a custom domain for the site, to `AllowedOrigins`.

**Rate limits:** Cloudflare limits `r2.dev` URLs and doesn't recommend them for production. If the page ever gets busy, connect a custom domain to the bucket (Settings → Custom Domains) and put it in the `vercel.json` `destination`.

**Don't** use `https://<account>.r2.cloudflarestorage.com/...`. That's the private S3 API endpoint: it rejects unsigned requests, and signing them would put your access keys in the website.

**Updating the bucket:**

1. Edit the files here and commit.
2. Upload the changed files to `budget-data`, keeping the paths (`budget/years/2021.json`, not `2021.json`).
3. Open `https://citizensconnectnabotech.vercel.app/data/budget/index.json` to check. It goes through Vercel, so it works on any network.

**How the page behaves:**

- **If the data can't be loaded:** it shows "Couldn't load the budget data" with a Try again button.
- **If `data.r2Url` is empty:** it says no budget figures are posted yet.
- **In both cases:** it still lists the official sources.

## Where the numbers come from

Each year comes from the **Commission on Audit's Annual Audit Report** for Panabo City, specifically Part 1 – Financial Statements, *Statement of Comparison of Budget and Actual Amounts* (SCBAA):

| Year | Source file (also in `aar/<year>/`)                    |
| ---- | ------------------------------------------------------ |
| 2021 | `08-PanaboCity2021_Part1-FS.xlsx`, sheet SCBAA         |
| 2022 | `09-PanaboCity2022_Part1-Financial_Statements.xlsx`, sheet SCBAA |
| 2023 | `09-PanaboCity2023_Part1-FS.xlsx`, sheet SCBAA         |
| 2024 | `09-PanaboCity2024_Part1-FS.pdf`, pages 5–7            |

The figures were extracted automatically, then checked against the report itself:

- **Differences:** for every line, the "Difference Original and Final Budget" and "Difference Final Budget and Actual" columns were recomputed and compared with the printed ones.
- **Totals:** the lines were checked to add up to the printed totals (revenue, current, continuing and total appropriations).

All four years match to the centavo. The page repeats the totals check every time it loads the data, and warns in the browser console if a file doesn't add up.

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
- **Amounts:** plain numbers in pesos (no commas or ₱). A negative is `-123.45`, not `(123.45)`.

Empty template rows from the report (all zeros) are left out.

**2024:** the report gives continuing appropriations as a single total without a sector breakdown. The page shows that total and says so.

## Adding a new year

1. **Create the year file:** from the new Annual Audit Report's SCBAA, create `budget/years/2025.json` in the format above. The extractor used for 2021–2024 can do this and runs the same checks; ask for it to be added to the project as a script.
2. **Add the original report:** put the financial statements file in `aar/2025/`.
3. **List the year:** add it to the top of `years` in `budget/index.json`:
   ```json
   { "year": 2025, "data": "budget/years/2025.json", "sourceDocument": "aar/2025/<file name>" }
   ```
4. **Publish:** commit, upload the new and changed files to the bucket, and open `/budget`. The new year appears as the first chip.
