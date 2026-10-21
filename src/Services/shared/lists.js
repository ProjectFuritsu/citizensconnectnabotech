// List helpers shared by the data services

// Items grouped by a key, in first-seen order: Map { key => [items] }.
// (Map.groupBy does the same but is missing on older phones.)
export const groupBy = (items, keyOf) => {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
};
