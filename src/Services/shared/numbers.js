// Number helpers shared by the data services

// Pesos to the centavo, without floating-point leftovers (0.1 + 0.2)
export const round = (n) => Math.round(n * 100) / 100;

// Adds up one value of every item, e.g. sumBy(lines, (line) => line.final)
export const sumBy = (items, valueOf) =>
  round(items.reduce((total, item) => total + (valueOf(item) ?? 0), 0));

// part ÷ whole, or null when there's nothing to divide by
export const ratio = (part, whole) => (whole ? part / whole : null);
