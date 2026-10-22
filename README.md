# BetterPanabo

The Panabo City Community Portal.

Public information about Panabo City, made easy to find: step-by-step guides to city services, emergency hotlines, and transparency dashboards for the city budget and government procurement. [Visit BetterPanabo](https://citizensconnectnabotech.vercel.app).

Built with React 19, Vite 7, Tailwind CSS 4 and React Router 7; deployed on Vercel.

## Run it

```bash
npm install --legacy-peer-deps
npm run dev
```

`--legacy-peer-deps` is needed until `eslint-plugin-react-hooks` supports ESLint 10 (see [TODO.md](TODO.md)). Other commands: `npm run lint`, `npm run build`, `npm run preview`.

## Where things are

```
src/
├── Data/         everything the site shows: settings, content, original documents
├── Pages/        one folder per page; page-only parts in its components/
├── Components/   shared UI: page layout, sections, stats, controls, states, tables, charts
├── Services/     reads and prepares the data (one per data folder) + shared helpers
├── Hooks/        shared React hooks (year data, URL state, sorting, paging)
├── Routes/       the list of pages
├── SEO/          page titles, link previews, structured data
└── Theme/        design tokens, display helpers, logo, DESIGN.md
scripts/          data pipelines (procurement) and the logo builder (logo)
public/           icons and the share image
```

- **To change content or links,** edit `src/Data/`. No code change is needed; [src/Data/README.md](src/Data/README.md) explains each folder and its source.
- **To change how things look,** read [src/Theme/DESIGN.md](src/Theme/DESIGN.md) and reuse `src/Components/`.
- **For open work, and which file to edit for common changes,** see [TODO.md](TODO.md).
