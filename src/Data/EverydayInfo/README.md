# Everyday Info data

These three files feed the **Everyday Info** page (`/everyday`). They start empty on purpose: only add information you have verified, because residents will act on it.

In VS Code, hover over any field for help. Typos and wrong formats (e.g. `"Mon"` instead of `"Monday"`) are underlined in red; that checking comes from the `*.schema.json` files next to each one.

Emergency hotlines live separately in `src/Config/hotlines.config.json` (see `src/Config/README.md`). They have their own page at `/hotlines`.

| File                         | Section on the page    | Starts with                                  |
| ---------------------------- | ---------------------- | -------------------------------------------- |
| `service-interruptions.json` | Service interruptions  | No outages, and Davao Light as an official source |
| `barangays.json`             | Barangay directory     | All 40 barangay names, other fields blank    |
| `garbage-schedule.json`      | Garbage collection     | All 40 barangays, no pickup days             |

The barangay names come from the Philippine Statistics Authority's official list. Keep them identical in `barangays.json` and `garbage-schedule.json`; a mismatch shows a warning in the browser console.

## Service interruptions

Add one entry per announced outage. Times are in Philippine time (`+08:00`). Entries disappear from the page once their `end` time has passed, so you don't have to delete old ones right away.

```json
{
  "type": "power",
  "provider": "Davao Light",
  "title": "Scheduled line maintenance",
  "start": "2026-10-10T08:00:00+08:00",
  "end": "2026-10-10T17:00:00+08:00",
  "areas": ["Gredu (Poblacion)", "San Francisco (Poblacion)"],
  "details": "Replacement of old poles along the national highway.",
  "sourceUrl": "https://www.davaolight.com/"
}
```

- **`type`:** `"power"` or `"water"`.
- **Status:** the page labels each entry **Ongoing** or **Upcoming** by itself, based on the current time.
- **`officialSources`:** always shown under the list, so people know where to check when nothing is posted here. Add the local water district's advisory page once you have its official link (`"type": "water"`).

## Barangay directory

Fill in what you've verified; any field left as `""` shows "Not yet posted". A barangay with no details at all shows "Details not yet posted."

```json
{
  "name": "Cacao",
  "captain": "Hon. Juan Dela Cruz",
  "hallAddress": "Purok 2, beside the covered court",
  "mapUrl": "https://maps.app.goo.gl/…",
  "hotline": "0912 345 6789",
  "officeHours": "Mon–Fri, 8:00 AM – 5:00 PM",
  "officials": [
    { "position": "Kagawad", "name": "Maria Santos" },
    { "position": "SK Chairperson", "name": "Pedro Reyes" }
  ]
}
```

The page shows "Details posted for X of 40 barangays", so you can see your progress. Set `lastUpdated` (YYYY-MM-DD) when you finish a round of checking; it appears on the page.

## Garbage collection schedule

Fill in each barangay's `days`. Barangays with no days show "hasn't been posted yet".

```json
{ "barangay": "Cacao", "days": ["Monday", "Thursday"], "time": "6:00 AM – 10:00 AM", "notes": "Biodegradable on Mondays, non-biodegradable on Thursdays." }
```

- **`days`:** full day names, from `"Monday"` to `"Sunday"`.
- **`source` and `lastUpdated`:** set them at the top of the file (e.g. `"City Environment and Natural Resources Office (CENRO)"`). Both appear on the page.
- **Remembered choice:** the page remembers each visitor's chosen barangay on their own device, so returning residents see their schedule right away.
