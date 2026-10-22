# Service guides (Guide Hub)

`guides.json` holds every guide on the Guide Hub (`/info`), each guide's own page (`/info/<id>`), the home page search and its "At a glance" counts. Add a guide here and it appears everywhere, including the sitemap.

**Source:** the [Panabo City Citizen's Charter](https://panabocity.gov.ph/citizens-charter/). Copy requirements, fees and steps as the charter states them.

```json
{
  "metadata": { "last_updated": "Feb. 18, 2026", "author": "BetterPanabo", "version": "1.0.0", "slug": "/info" },
  "data": [ { …one guide… } ]
}
```

## One guide

```json
{
  "id": "PANABO-MARRIAGE-LICENSE-2026",
  "title": "Application for Marriage License",
  "date": "2026-02-18",
  "desc": "Application for a Marriage License (AML) at the City Civil Registrar's Office…",
  "tags": ["Civil Registry", "Marriage License"],
  "fee": "PHP 1,877.00",
  "total_duration": "10 Days, 2 hours and 43 minutes",
  "icon_type": "Heart",
  "icon_color": "text-red-600",
  "button_text": "View Details",
  "requirements": ["Certificate of No Marriage (CENOMAR) - (1 original & 1 photocopy)"],
  "situational_requirements": [
    { "condition": "Applicants aged 18–25 years old", "docs": ["Valid IDs of parents - (2 photocopies)"] }
  ],
  "guidelines": [{ "step": 1, "action": "Fill out the application…", "duration": "30 minutes" }],
  "sources": { "name": "Panabo City Citizen's Charter", "url": "https://panabocity.gov.ph/citizens-charter/" }
}
```

| Field | What it is |
| --- | --- |
| `id` | Unique, never changed once published: it's the page address (`/info/<id>`). `site.config.json`'s "Popular" shortcuts point to it. |
| `title`, `desc` | The guide's name and a one-sentence summary. |
| `date` | When the guide was last checked against the charter, `YYYY-MM-DD`. Shown as "Updated …"; the newest date is the Guide Hub's "Updated". |
| `tags` | The **first tag is the category**: it gets a filter chip, an icon (set in `src/Theme/display.js`, `categoryIcons`) and the "More … guides" list. Further tags only help search. |
| `fee` | As the charter writes it. Exactly `"None"` shows as **Free** and counts as free of charge. |
| `total_duration` | Processing time, as written. |
| `icon_type` | A [lucide](https://lucide.dev/icons) icon name in PascalCase, e.g. `"Heart"`. Unknown names show a folder icon. |
| `icon_color` | A Tailwind text color class for the icon, e.g. `"text-red-600"`. |
| `button_text` | The card's link text, usually `"View Details"`. |
| `requirements` | What to bring. End an item with ` - (1 original & 1 photocopy)` to show the copies as a separate label. |
| `situational_requirements` | Extra requirements that apply only in some cases: each has a `condition` and its `docs`. Use `[]` when there are none. |
| `guidelines` | The steps in order: `step` (number), `action`, and an optional `duration`. |
| `sources` | The official source: `name` and `url`. |
