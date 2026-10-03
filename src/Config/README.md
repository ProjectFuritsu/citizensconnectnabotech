# Site configuration

`site.config.json` is the one place to add, remove, hide or disable links and tools. The navbar, footer, home page, page titles and sitemap all read from it.

In VS Code, hover over any field for an explanation. Typos such as `"disbled": true` are underlined in red; that checking comes from `site.config.schema.json`.

| File                       | What it is                                                       |
| -------------------------- | ---------------------------------------------------------------- |
| `site.config.json`         | **Edit this.** Site identity, pages, tools, resources, popular guides. |
| `hotlines.config.json`     | **Edit this.** Emergency hotline numbers.                        |
| `*.schema.json`            | Field descriptions and checks for the editor.                    |
| `links.js`                 | Turns the config into what each part of the site shows. No need to edit. |

Other content lives in `src/Data`: guides (`InfoLib/InfoData.json`) and news (`News/NewsData.json`).

## Where things show up

| Section         | Navbar          | Footer column | Home page                 |
| --------------- | --------------- | ------------- | ------------------------- |
| `pages`         | `"navbar": true` | Portal (`"footer": true`) | —             |
| `tools`         | `"navbar": true` (after the pages) | Tools (`"footer": true`) | Community tools card (`"home": true`) |
| `resources`     | —               | Resources (`"footer": true`) | —                  |
| `popularGuides` | —               | —             | "Popular:" links under the search bar |

Items appear in the order they're listed.

## Flags (work on every item)

- `"disabled": true`: still shown, but greyed out with a "Soon" label and not clickable.
- `"hidden": true`: not shown anywhere. Delete the flag to bring it back.

## Examples

**Disable a tool everywhere** (navbar, footer and home page card):

```json
{ "name": "PanaPresyo", "label": "Market Prices", ..., "disabled": true }
```

**Add a new tool:**

```json
{
  "name": "NaboJobs",
  "label": "Job Board",
  "title": "Find local jobs",
  "description": "Job openings from businesses and offices in Panabo City.",
  "url": "https://nabojobs.vercel.app",
  "icon": "Briefcase",
  "navbar": false,
  "footer": true,
  "home": true
}
```

`icon` is any icon name from [lucide.dev/icons](https://lucide.dev/icons), written in PascalCase (`map-pinned` becomes `MapPinned`).

**Show a page again** (News is currently hidden): remove `"hidden": true` from its entry.

**Add a page to the navbar:** the page must already exist as a route in `src/Routes/AppRoute.jsx`. Then add it to `pages`:

```json
{ "title": "Get Involved", "path": "/get-involved", "navbar": true, "footer": true }
```

**Add a "Popular" shortcut:** use the guide's `id` from `src/Data/InfoLib/InfoData.json`. If the id doesn't exist, the link is skipped and a warning appears in the browser console.

```json
{ "label": "Dental Services", "guideId": "PANABO-DENTAL-SERVICES-2026" }
```

**Update the emergency hotlines** in `hotlines.config.json`. They scroll in the bar above the navbar, and the home page counts them. Write numbers the way people should read them; spaces are removed automatically for tap-to-call. Update `lastUpdated` when you check the numbers.

```json
{ "name": "Police", "number": "0998 598 7104" }
```

Add `"hidden": true` to hide a number that's temporarily out of service.

**Move to a custom domain:** change `site.url` (no trailing slash). Page links, link previews, the sitemap and robots.txt all follow.

While `npm run dev` is running, saving the file makes the dev server restart itself and reload the page, so changes show up within a second or two.
