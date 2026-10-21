# Data

Everything the site shows lives in this one folder: settings, content and the original documents. Each sub-folder has a README with its file format and how to update it. Changing data never needs a code change.

```
src/Data/
├── Site/          menus and links, site name and search text, emergency hotlines
├── Guides/        service guides (Guide Hub and the home page search)
├── Budget/        Budget Transparency: one file per year, plus METHODOLOGY.md
├── Procurement/   Procurement Transparency: PhilGEPS records, per year
└── Audit/         COA Annual Audit Reports: the original files
```

| On the site | Stored in | Source |
| ----------- | --------- | ------ |
| Navbar, footer, page titles and descriptions, sitemap | [Site/site.config.json](Site/README.md) | Set by the site team |
| Emergency hotlines (hotlines page, scrolling bar, home page count) | [Site/hotlines.json](Site/README.md) | Entered by the site team. Its `lastUpdated` date is shown on the hotlines page; re-check the numbers against official announcements regularly. |
| Guide Hub, guide pages, home page search | [Guides/guides.json](Guides/README.md) | [Panabo City Citizen's Charter](https://panabocity.gov.ph/citizens-charter/) |
| Budget Transparency (`/budget`) | [Budget/](Budget/README.md) | COA Annual Audit Reports 2021–2024, Statement of Comparison of Budget and Actual Amounts. [METHODOLOGY.md](Budget/METHODOLOGY.md) explains exactly how. |
| Procurement Transparency (`/procurement`) | [Procurement/](Procurement/README.md) | [PhilGEPS Open Data](https://philgeps.gov.ph/CmsHomePages/open-data), built by the scripts in `scripts/procurement/` |
| COA audit report downloads (Procurement and Budget pages) | [Audit/](Audit/README.md) | The Commission on Audit's original files |

**How the files reach visitors:**
- **JSON** is bundled with the site. Per-year files (budget lines, procurement notices and items) are split out and load only when that year is opened.
- **Original documents** (COA reports, full procurement records) are copied into the build as files with their own address. They're never bundled, so they don't slow pages down.

The code that reads these files is in `src/Services/`, one service per folder.

**The aim for everything here:** official sources only, with links back to them so residents can check for themselves.
