# Citizen's Portal Design System

How the Panabo City Citizen's Portal looks and why. Read this before building or restyling a page.

**Style in one line:** minimal, but data-forward. Real numbers from `src/Data` do the work that decoration would do on other sites.

## Files in this folder

| File        | What it is                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `theme.css` | Design tokens (colors, radii, motion) as a Tailwind v4 `@theme` block, plus base page colors. Imported by `src/index.css`. |
| `display.js` | The data display rules below, as code: `formatFee`, `isFree`, `formatDate`, `pluralize`, and `categoryIcons`. Import these instead of re-writing them on a page. |
| `logo.svg`  | The portal emblem. Used by `custom_Logo.jsx` and as the SVG favicon (`index.html`). The PNG/ICO icons and share image in `public/` (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-image.png`) are rendered from it, so re-render them if the logo changes. |
| `DESIGN.md` | This guide.                                                                                        |

Shared building blocks that live outside this folder:

- `src/Widgets/custom_DynamicIcon.jsx`: renders a lucide icon from its name (e.g. `icon_type` in the JSON).
- `src/Widgets/custom_info_card.jsx`: the guide card.
- `src/Widgets/custom_SectionHeader.jsx`: section title, description and optional link.
- `InfoDataService.getCategories()`: primary categories with guide counts, largest first.

Change a token in `theme.css` and every utility that uses it updates. For example, swap the `--color-brand-*` values to rebrand the portal.

## Principles

1. **Data is the decoration.** Show counts, fees, processing times and dates instead of illustrations, gradients or glows.
2. **One accent color.** `brand` is only for links, active states and data bars. Everything else is neutral. The multicolor logo is the one exception, and its colors are never used in the UI.
3. **Color carries meaning.** `success` means free of charge and `danger` means emergency. Never use them for decoration.
4. **Borders, not shadows.** Use 1px `border-line` to separate things. Shadows are reserved for floating layers such as the search dropdown.
5. **Never hardcode numbers.** Compute counts, totals and dates from the JSON in `src/Data` so the page stays correct when data changes.
6. **Mobile first.** Use a 16px side gutter and avoid horizontal page scroll.
7. **Motion is rare and stoppable.** The hotline marquee is the only moving element. Anything that moves must pause on hover/touch/focus and stop for visitors who prefer reduced motion.

## Tokens

All tokens are Tailwind utilities: `text-*`, `bg-*`, `border-*`, `divide-*`, `decoration-*` and so on.

### Color

| Token                    | Matches     | Use for                                             |
| ------------------------ | ----------- | --------------------------------------------------- |
| `brand-50` … `brand-900` | blue scale  | Links (`600`), link hover (`700`), active nav (`50` bg + `700` text), data bars (`600`) |
| `ink`                    | slate-900   | Headings, primary text, hotline bar                 |
| `ink-soft`               | slate-700   | Values in tables, secondary strong text             |
| `muted`                  | slate-500   | Descriptions, labels, idle nav links                |
| `subtle`                 | slate-400   | Hints, column labels, idle icons                    |
| `faint`                  | slate-300   | Chevrons, link underlines                           |
| `line`                   | slate-200   | Borders, dividers, grid gaps                        |
| `track`                  | slate-100   | Empty part of data bars                             |
| `canvas`                 | slate-50    | Page background, panel header strips, row hover     |
| `surface`                | white       | Cards, panels, tables, navbar, footer               |
| `success`                | emerald-700 | "Free" fees and counts of free services             |
| `danger`                 | red-600     | Emergency icons and the hotline dot                 |
| `danger-strong`          | red-700     | Emergency text on hover                             |
| `danger-soft`            | red-50      | Emergency row hover background                      |

### Shape

| Token     | Utility           | Use for                  |
| --------- | ----------------- | ------------------------ |
| `card`    | `rounded-card`    | Cards, panels, tables    |
| `control` | `rounded-control` | Buttons, inputs, nav items, logo mark |

### Motion

| Token     | Utility           | Use for                                                       |
| --------- | ----------------- | ------------------------------------------------------------- |
| `marquee` | `animate-marquee` | Endless sideways scroll (30s per loop). Moves a row by its own width, so render the row twice side by side. |

## Typography

The site uses Tailwind's default sans-serif system font stack.

| Role                  | Classes                                                   |
| --------------------- | --------------------------------------------------------- |
| Page title (h1)       | `text-4xl md:text-5xl font-bold tracking-tight text-balance` |
| Section title (h2)    | `text-xl font-semibold tracking-tight`                    |
| Lead paragraph        | `text-lg text-muted`                                      |
| Body / descriptions   | `text-sm text-muted`                                      |
| Column & panel labels | `text-xs font-semibold uppercase tracking-wider text-muted` (or `text-subtle`) |
| Big numbers           | `text-3xl font-semibold tabular-nums`                     |
| Any number in a row   | add `tabular-nums` so digits line up                      |

Keep uppercase for small labels only. Don't use it for headings or nav items.

## Layout

- **Container:** `max-w-7xl mx-auto px-4 md:px-8` for every section, including the navbar and footer, so edges line up.
- **Vertical rhythm:**
  - Home hero: `py-16 md:py-24 lg:py-28`, with `gap-12 lg:gap-20` between its text column and side panel. Inner pages use a shorter header: `py-12 md:py-16`.
  - Sections: `pt-10 md:pt-12` (40px / 48px apart).
  - The page wrapper gets `pb-20 md:pb-24`, so whichever section is last has room above the footer.
  - Section header to content: `mt-8`. Section title to description: `mt-2`.
- **Backgrounds:** page content sits on `bg-canvas` so white cards stand out. The hero is a `bg-surface` strip with `border-b border-line`. (`<body>` itself is `surface`, set in `theme.css`.)
- **Gaps:** `gap-3` between small tiles, `gap-4` between content cards, `lg:gap-6` between table columns.

### Breakpoints

Tailwind defaults: `sm` 640px, `md` 768px (tablet), `lg` 1024px (small laptop / tablet landscape).

- Multi-column layouts with fixed-width columns (a data table, the home hero's side panel, the guide details sidebar) only switch on at `lg`. At `md` there isn't enough width, and fixed columns crush the flexible one.
- Card grids: 1 column, `md:grid-cols-2`, `lg:grid-cols-3`. Small tiles can go denser (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
- Rows of three wide cards (community tools) stack until `lg`.
- A full-width stat grid spreads out (`sm:grid-cols-4`) and goes back to `lg:grid-cols-2` once it sits in a side column.
- No sidebars below `lg`. Put filters in a row above the content instead.

## Site chrome

These live in `src/Widgets` and appear on every page.

### Hotline marquee (`custom_NavBar.jsx`)

- `bg-ink`, `h-10`, `text-xs`. A `bg-danger` dot marks it as emergency info. The label reads "Emergency hotlines", shortened to "Hotlines" on phones.
- Each number is a `tel:` link with spaces stripped from the number.
- The numbers scroll continuously with `animate-marquee`, with faded edges (`mask-image`). `HotlineTrack` is rendered twice; each copy is at least as wide as the bar (`min-w-full`), so the loop never shows a gap.
- It pauses on hover (desktop), while pressed (touch; the empty `onTouchStart` makes `:active` work on iOS) and when a link has keyboard focus.
- The duplicate copy is `aria-hidden` with `tabIndex={-1}` on its links, so screen readers and the Tab key see each number once.
- With reduced motion turned on, the animation stops, the duplicate is hidden and the bar becomes swipeable instead.

### Navbar (`custom_NavBar.jsx`)

- `sticky top-0 z-40`, `h-16`, `bg-surface/90 backdrop-blur`, `border-b border-line`.
- Internal pages use `NavLink`. Active state: `text-brand-700 bg-brand-50`; idle: `text-muted hover:text-ink hover:bg-canvas`.
- External tools open in a new tab and show a small `ArrowUpRight` icon.
- Links appear from `md` up; below that, a menu button opens a vertical list.
- Links come from the shared list in `src/Routes/navigation.js`, which the footer uses too. Change an item once and both update. Each item has `title`, `path` and `group` (its footer column: "Portal" or "Tools"), plus optional flags:
  - `external: true`: opens in a new tab and shows `ArrowUpRight`.
  - `disabled: true`: shown in `text-subtle` with a "Soon" pill (`Custom_SoonBadge`) and `cursor-not-allowed`. It renders as plain text (`aria-disabled="true"`), so it can't be clicked or tabbed to. Use it for features that are announced but not ready.
  - `hidden: true`: not shown anywhere. Use this instead of commenting the item out, so it's easy to switch back on.
  - `footerOnly: true`: listed in the footer but not the navbar. Use it for secondary links that would crowd the navbar.

### Footer (`custom_Footer.jsx`)

- `bg-surface border-t border-line`: logo and mission on the left, link columns on the right, copyright strip at the bottom.
- Column labels use the small uppercase label style. External links show `ArrowUpRight`.
- The Portal and Tools columns come from the shared navigation list (see Navbar), so the same flags apply. Only the Resources column (outside links such as the official city website) is defined in the footer itself.

### Home page lists (`HomePage.jsx`)

The "Popular" guide links and the Community tools cards accept the same `disabled` and `hidden` flags:

- **Popular links:** a disabled link is plain `text-subtle` text.
- **Tool cards:** a disabled card gets a dashed border, muted text and a "Soon" pill instead of the ↗ arrow, and can't be clicked.

### Logo (`custom_Logo.jsx`)

Use `<Custom_Logo />` wherever the brand appears; don't copy its markup. It shows the emblem (`logo.svg`, 40px) next to "Panabo City / Citizen's Portal" and links home. The emblem's `alt` is empty because the text beside it already names the link.

**The emblem (`logo.svg`)**, read from the outside in:

- **Arms:** two blue arms circle the city, and their hands clasp at the bottom. The city takes care of its people.
- **Residents:** three people in the middle (green, blue, orange) stand for the citizens the portal serves.
- **Services:** five segments arc across the top: safety (teal, shield), environment (green, leaf), city hall (blue, with dome and flag), transport (yellow, bus) and health (orange, cross).

Rules for using it:

- Show it on white or very light backgrounds only. White outlines separate its pieces, so on dark backgrounds those outlines show up as lines.
- Don't recolor, stretch or crop it, and don't use its green, yellow, orange or teal anywhere in the UI.
- Minimum size is 32px. Below that, use it only as the favicon, where the overall shape and colors still read.

## Page patterns

Reference implementations: `src/Pages/Home/HomePage.jsx`, `src/Pages/GuideHub/InfoLibPage.jsx` (Guide Hub list) and `src/Pages/GuideHub/InfoDetailsPage.jsx` (guide details).

### Section header

Title, one-line description and an optional right-aligned link (`Custom_SectionHeader`).

```jsx
<Custom_SectionHeader
  title="More Health guides"
  desc="Optional one-line description."
  link={{ to: "/info?tag=Health", label: "View all 9" }}
/>
```

### Panel

A bordered box with a header strip, used for "At a glance".

```jsx
<div className="overflow-hidden rounded-card border border-line bg-surface">
  <div className="px-5 py-3 border-b border-line bg-canvas">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">At a glance</h2>
  </div>
  {/* content */}
</div>
```

### Stat grid

Put cells in a grid with `gap-px bg-line` and give each cell `bg-surface`. The 1px gap shows through as hairline dividers, with no border math.

```jsx
<dl className="grid grid-cols-2 gap-px bg-line">
  <div className="bg-surface px-5 py-4">
    <dt className="text-xs text-muted">Service guides</dt>
    <dd className="mt-1 text-3xl font-semibold tabular-nums">16</dd>
  </div>
</dl>
```

### Category tile with share bar

*Not on any page right now; it was on the home page.* A bordered card with icon, name, count and a thin `h-1` bar (`bg-track` with a `bg-brand-600` fill) showing its share of the total. Link to the filtered Guide Hub: `/info?tag=<name>`.

### Data table

*Not on any page right now; it was the home page's "Featured services".* Header and rows share one column template (`serviceColumns`). On phones and tablets, wrap the meta cells in `flex ... lg:contents` so they stack under the title; from `lg` up, `lg:contents` turns them back into table columns. Add short labels below `lg` only, e.g. `<span className="lg:hidden">Fee: </span>`.

### Inner page header (Guide Hub)

A `bg-surface` strip with `border-b border-line` containing:

1. A breadcrumb (`Home › Guide Hub`) in `text-sm text-muted`, with the current page in `text-ink` and `aria-current="page"`.
2. The `h1` (page title size) and a one-line lead in `text-lg text-muted`.
3. A freshness line, e.g. "Updated Mar 17, 2026 by NaboTech.org", in `text-sm text-subtle`. Compute the date from the newest item.
4. The search input, at most `max-w-2xl`.

### Search input

`rounded-control border border-line bg-surface py-3.5 pl-12 pr-4 shadow-sm`, with a `Search` icon inside on the left. Focus: `focus:ring-2 focus:ring-brand-600 focus:border-transparent`. Give it an `aria-label` and a placeholder with a real example.

### Filter chips

A row of pill buttons (`rounded-full border px-3.5 py-2 text-sm`), each with an optional category icon and a count. Idle: `border-line bg-surface text-ink-soft`. Active: `border-brand-200 bg-brand-50 text-brand-700` with `aria-pressed`. The first chip is "All". On phones the row scrolls sideways (`overflow-x-auto no-scrollbar`, bleeding to the screen edges with `-mx-4 px-4`); from `md` it wraps. Keep the active filter in the URL (`?tag=Health`) so it can be linked and shared.

### Results bar

Sits between the filters and the results, with `border-b border-line pb-4`.

- **Left:** the result count, live-updating (`aria-live="polite"`): "Showing 1–12 of 16 guides", or just "9 guides" when everything fits on one page, plus "in Health" and "for “senior”" when filtered.
- **Right:** a "Reset" text button when any filter is active, and a "Sort" `select` styled like the search input.

### Guide card (`custom_info_card.jsx`)

The whole card links to the guide.

- **Top:** an icon tile (`bg-canvas rounded-control`), category in `text-brand-600`, and the date on the right.
- **Middle:** title (`font-semibold`), then the description clamped to 3 lines.
- **Bottom** (pinned with `mt-auto` so cards in a row line up): key facts as label/value rows (Fee, Processing time), then "6 requirements · 4 steps" and the `button_text` link.

### Pagination

12 items per page, so grids of 2 or 3 columns fill evenly. Layout: "Previous" on the left, page numbers in the middle, "Next" on the right. The current page is `bg-brand-50 text-brand-700` with `aria-current="page"`. Changing page scrolls to the top of the results (`scroll-mt-24` keeps them clear of the sticky navbar).

### Empty state

A dashed `border-line` box with a `SearchX` icon, a plain-language heading ("No guides match your search"), a hint, and a "Clear filters" button.

### Detail page header (guide details)

Like the inner page header, with these differences:

- The breadcrumb goes one level deeper (`Home › Guide Hub › Civil Registry`). The category links to the filtered Hub; the title is the `h1`, so it isn't repeated in the breadcrumb.
- The guide's icon sits in a `h-14 w-14` tile beside the title (from `sm` up).
- The freshness line includes the official source as a link.
- A **key facts** stat grid follows: Fee, Processing time, Requirements, Steps. Each cell has a small icon and a `text-lg font-semibold` value. The grid is 2×2 until `lg`, then 4 across, so long values like "10 Days, 2 hours and 43 minutes" don't squeeze.

### Numbered checklist (requirements)

An `<ol>` inside a bordered panel with `divide-y divide-line`. Each row: a `h-6 w-6` number circle (`bg-canvas text-muted`), the item in `text-sm font-medium`, and its copy count as a `bg-canvas` pill. The pill sits on the right from `sm`, and under the text on phones. Split the copy count off with `parseRequirement()`; text it can't split is shown whole, with no pill.

### Condition cards (additional requirements)

One card per condition, in a `md:grid-cols-2` grid. The condition is the heading, with an `Info` icon in `text-brand-600`, followed by a dotted list of documents. Leave out the whole section, and its "On this page" link, when there are no conditions.

### Step timeline

An `<ol>` in a bordered panel. Each step: a `h-8 w-8` number circle (`bg-brand-50 text-brand-700`), the action text, and a duration pill (`Clock` icon, `bg-canvas`). A `w-px bg-line` connector runs from each circle to the next. Durations are shown as written, including Tagalog text and "Part of Step 3". The section description gives the step count and total time.

### Sticky sidebar

From `lg` up, `lg:sticky lg:top-24 lg:self-start` beside the content (`lg:grid-cols-[minmax(0,1fr)_18rem]`). It holds:

- An **"On this page"** panel: anchor links with counts. Sections get `scroll-mt-24` so they land below the sticky navbar. Hidden below `lg`.
- An **"Official source"** panel, plus the disclaimer in `text-xs text-muted`.

Below `lg` the sidebar stacks under the content; the contents panel is hidden there.

### Related items

"More {category} guides": up to 3 other guides from the same category, newest first, as guide cards, with a "View all N" link to the filtered Hub. Leave the section out when there are none.

### Not-found state

A centered message with a `FileQuestionMark` icon, "Guide not found", one sentence of help, and a primary button back to the list.

### Primary button

For the single main action on a page: `rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700`. Use at most one per view; everything else is a text link or a bordered secondary button (`border border-line bg-surface hover:border-brand-300`).

### Links

- **Section link:** `text-sm font-medium text-brand-600 hover:text-brand-700` plus an `ArrowRight` that nudges right on hover.
- **Inline link:** `underline decoration-faint underline-offset-4 hover:text-brand-600 hover:decoration-brand-600`.
- **Card link:** the whole card is the link, with `hover:border-brand-300`. Titles turn `text-brand-700` on hover.

## Data display rules

These are implemented in `display.js`, so use those functions rather than re-writing the rules.

- **Fees:** show `"None"` as **Free** in `text-success`. Show any other value as written.
- **Dates:** format as `Mar 17, 2026` with `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })`. Using UTC keeps `2026-03-17` from shifting a day.
- **Counts:** pluralise correctly ("1 guide", "9 guides").
- **Missing values:** show `—`, never a blank or `undefined`. Never fill a gap with made-up data.
- **Copy counts:** `parseRequirement()` splits "Recent CEDULA - (2 photocopies)" into the item and "2 photocopies".

## Icons

- Use `lucide-react`: 16px (`h-4 w-4`) in dense rows and 20px (`h-5 w-5`) in cards.
- Idle icons are `text-subtle` and turn `text-brand-600` on hover. Emergency icons are always `text-danger`.
- Guide icons come from `icon_type` in `InfoData.json` and must be exact lucide export names (e.g. `IdCard`, not `IdentificationCard`). `Custom_DynamicIcon` falls back to a folder icon when a name doesn't exist.

## Accessibility

- Keep the browser's default focus outline; don't add `outline-none` without a `focus-visible` replacement.
- Icon-only buttons need an `aria-label` (see the mobile menu button).
- On phones, menu items are at least 44px tall, so they're easy to tap. The hotline marquee is compact by design; it pauses while pressed so its numbers can be tapped.
- `muted` text on `surface` or `canvas` passes WCAG AA for body text. Use `subtle` only for non-essential hints and labels.

## Do / Don't

| Do                                                | Don't                                                  |
| ------------------------------------------------- | ------------------------------------------------------ |
| Use tokens (`text-muted`, `border-line`)          | Use raw palette classes (`text-slate-500`) on new work |
| Compute numbers from `src/Data`                   | Type counts or dates into JSX                          |
| Separate with `border-line` and whitespace        | Add gradients, blurred blobs or heavy shadows          |
| Keep `brand` for interactive things               | Color headings or backgrounds with `brand`             |
| Use `success` and `danger` only for their meaning | Use green or red decoratively                          |

## Migrating older pages

These use the tokens: the home page, the Guide Hub list (`InfoLibPage.jsx`), guide details (`InfoDetailsPage.jsx`), the guide card, navbar, footer and logo. These still use raw Tailwind colors and can move over gradually: News pages, Volunteers, error pages, `custom_PageLayout.jsx` (now only used by `NewsPage.jsx`), and the search bar widget.

| Raw class                        | Token            |
| -------------------------------- | ---------------- |
| `slate-900`                      | `ink`            |
| `slate-700`, `slate-600`         | `ink-soft`       |
| `slate-500`                      | `muted`          |
| `slate-400`                      | `subtle`         |
| `slate-300`                      | `faint`          |
| `slate-200` (borders)            | `line`           |
| `slate-100`                      | `track`          |
| `slate-50`, `gray-50`            | `canvas`         |
| `white`                          | `surface`        |
| `blue-*`                         | `brand-*`        |
| `rounded-xl`                     | `rounded-card`   |
| `rounded-lg`                     | `rounded-control`|
