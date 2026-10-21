import { useState } from "react";

// Long lists, a page at a time. The parent gives the list a new `key` when
// its filters change, so it starts over from the first page.
export function useShowMore(pageSize) {
  const [shown, setShown] = useState(pageSize);
  return { shown, showMore: () => setShown((n) => n + pageSize) };
}
