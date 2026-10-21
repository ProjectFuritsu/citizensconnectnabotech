import { useState } from "react";

// Sorts rows by a column; clicking the same column again flips the order.
// Text columns (`textKeys`) start A–Z, number columns start largest first.
export function useSort(rows, initial, textKeys = []) {
  const [sort, setSort] = useState(initial); // { key, dir: "asc" | "desc" }
  const isText = (key) => textKeys.includes(key);

  const sorted = [...rows].sort((a, b) => {
    const empty = isText(sort.key) ? "" : -Infinity;
    const av = a[sort.key] ?? empty;
    const bv = b[sort.key] ?? empty;
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const toggle = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: isText(key) ? "asc" : "desc" },
    );

  return { sorted, sort, toggle };
}
