// Helpers for data kept as one file per year (years/2024.json and so on),
// found with import.meta.glob

// "…/years/2024.json" → 2024
export const yearOf = (path) => Number(path.match(/(\d{4})\.\w+$/)?.[1]);

// { "…/2024.json": value } → Map { 2024 => value }
export const byYear = (files) =>
  new Map(Object.entries(files).map(([path, value]) => [yearOf(path), value]));

// Loads a year's file once per visit and keeps the result. A failed load is
// forgotten, so trying again starts afresh. `prepare(raw, year)` shapes the
// file for the page.
export function cachedLoader(loaders, what, prepare = (raw) => raw) {
  const loaded = new Map();
  return (year) => {
    const load = loaders.get(year);
    if (!load) return Promise.reject(new Error(`There's no ${what} file for ${year}.`));
    if (!loaded.has(year)) {
      const pending = load().then((raw) => prepare(raw, year));
      pending.catch(() => loaded.delete(year));
      loaded.set(year, pending);
    }
    return loaded.get(year);
  };
}
