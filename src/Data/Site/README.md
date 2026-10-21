# Site settings

`site.config.json` is the one place to add, remove, hide or disable links and tools. The navbar, footer, home page, page titles and sitemap all read from it.

In VS Code, hover over any field for an explanation. Typos such as `"disbled": true` are underlined in red; that checking comes from `site.config.schema.json`.

| File | What it is |
| --- | --- |
| `site.config.json` | **Edit this.** Site identity, pages, tools, resources, popular guides. |
| `hotlines.json` | **Edit this.** Emergency hotline numbers. |
| `*.schema.json` | Field descriptions and checks for the editor. |

`src/Services/SiteService.js` turns these files into what each part of the site shows; there's no need to edit it. The rest of the site's data is next door in `src/Data/` (see its README).

## Where things show up

| Section         | Navbar          | Footer column | Home page                 |
| --------------- | --------------- | ------------- | ------------------------- |
| `pages`         | `"navbar": true` | Portal, or its group's column (`"footer": true`) | — |
| `tools`         | `"navbar": true`: in its group's dropdown, or after the pages | Its group's column, or Tools (`"footer": true`) | — |
| `resources`     | —               | Resources (`"footer": true`) | —                  |
| `popularGuides` | —               | —             | "Popular:" links under the search bar |

Items appear in the order they're listed.

## Groups (navbar dropdowns)

Give pages and tools the same `"group"` to put them in one navbar dropdown and one footer column. Right now:

| Group | What's in it |
| ----- | ------------ |
| **Services** | Guide Hub, then every community tool (under "Community tools") |
| **Transparency** | Budget, Procurement |

Home and Emergency Hotlines have no group, so they stay plain links (and go under "Portal" in the footer).

- **Where a dropdown appears:** where its first page is listed in `pages`. To move a whole group, move its first page. A group with only tools comes after the pages.
- **Inside a dropdown:** pages first, each with its `icon` and one-line `description`, then tools with their icons.
- **On phones:** each group becomes a labelled section of the menu.
- **Group names** are matched exactly: `"Services"` and `"services"` would make two dropdowns.

```json
{
  "title": "Procurement",
  "path": "/procurement",
  "icon": "Gavel",
  "group": "Transparency",
  "description": "What offices put up for bidding, and who won the contracts",
  "navbar": true,
  "footer": true
}
```

To take an item out of its dropdown, delete its `"group"`; it becomes a plain link again.

## Flags (work on every item)

- `"disabled": true`: still shown, but greyed out with a "Soon" label and not clickable.
- `"hidden": true`: not shown anywhere. Delete the flag to bring it back.

## Examples

**Disable a tool everywhere** (navbar and footer):

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
  "group": "Services",
  "navbar": true,
  "footer": true
}
```

With `"group": "Services"` and `"navbar": true`, it's listed under Community tools in the Services dropdown.

Only `label`, `url` and `icon` are required. `name`, `title` and `description` aren't shown on the site right now (they were on the home page's tool cards), but are worth filling in for the record.

`icon` is any icon name from [lucide.dev/icons](https://lucide.dev/icons), written in PascalCase (`map-pinned` becomes `MapPinned`).

**Add a page to the navbar:** the page must already exist as a route in `src/Routes/AppRoute.jsx`. Then add it to `pages`:

```json
{ "title": "About", "path": "/about", "navbar": true, "footer": true }
```

**Hide a page for now:** add `"hidden": true` to its entry; remove the flag to bring it back.

**Add a "Popular" shortcut:** use the guide's `id` from `src/Data/Guides/guides.json`. If the id doesn't exist, the link is skipped and a warning appears in the browser console.

```json
{ "label": "Dental Services", "guideId": "PANABO-DENTAL-SERVICES-2026" }
```

**Update the emergency hotlines** in `hotlines.json`. They're used in three places:

- the Emergency Hotlines page (`/hotlines`);
- the scrolling bar above the navbar;
- the home page count.

Write numbers the way people should read them; spaces are removed automatically for tap-to-call. Update `lastUpdated` when you check the numbers, because the hotlines page shows it.

```json
{ "name": "Panabo Polyclinic", "number": "0912 345 6789", "category": "hospital", "description": "24/7 emergency room" }
```

- **`category`:** groups the number on the hotlines page. Use `"emergency"` (police, fire, rescue), `"hospital"`, `"towing"`, `"utility"` (power, water) or `"government"` (city offices). Numbers without a category go under "Other numbers". A group appears only once it has at least one number.
- **`description`:** optional; shown under the number.
- **`"hidden": true`:** hides a number that's temporarily out of service.

**Move to a custom domain:** change `site.url` (no trailing slash). Page links, link previews, the sitemap and robots.txt all follow.

While `npm run dev` is running, saving the file makes the dev server restart itself and reload the page, so changes show up within a second or two.
