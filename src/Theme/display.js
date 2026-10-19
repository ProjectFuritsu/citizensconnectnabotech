// Data display rules from DESIGN.md, shared by every page that shows guides

// Icon for each primary guide category (lucide-react export names)
export const categoryIcons = {
  Health: "HeartPulse",
  "Civil Registry": "ScrollText",
  Legal: "Scale",
  "Senior Citizen": "HandHeart",
  Property: "Landmark",
  Scholarship: "GraduationCap",
};

export const isFree = (fee) => fee === "None";

// "None" reads as "Free"; any other fee is shown as written
export const formatFee = (fee) => (isFree(fee) ? "Free" : fee);

// "2026-03-17" -> "Mar 17, 2026". UTC keeps the date from shifting a day.
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// Start/end of an outage in Philippine time, whatever the visitor's timezone:
// same day  -> "Sat, Oct 10 · 8:00 AM – 5:00 PM"
// multi-day -> "Sat, Oct 10, 8:00 AM – Sun, Oct 11, 5:00 PM"
export const formatTimeRange = (start, end) => {
  const zone = { timeZone: "Asia/Manila" };
  const day = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      ...zone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const time = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      ...zone,
      hour: "numeric",
      minute: "2-digit",
    });
  return day(start) === day(end)
    ? `${day(start)} · ${time(start)} – ${time(end)}`
    : `${day(start)}, ${time(start)} – ${day(end)}, ${time(end)}`;
};

// Pesos: exact for tables ("₱2,850,123,456"), compact for headline
// figures and chart axes ("₱2.85B", "₱415.25M")
export const formatPeso = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatPesoCompact = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);

// 0.3214 -> "32.1%"
export const formatPercent = (fraction, digits = 1) =>
  `${(fraction * 100).toFixed(digits)}%`;

// pluralize(1, "guide") -> "1 guide", pluralize(9, "guide") -> "9 guides"
export const pluralize = (count, word) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

// Splits a trailing copy count off a requirement so it can be shown apart:
// "Recent CEDULA - (2 photocopies)" -> { name: "Recent CEDULA", copies: "2 photocopies" }
// Text in any other format comes back whole, with copies: null.
export const parseRequirement = (text) => {
  const match = text.match(/^(.*?)\s+-\s+\(([^()]*)\)\s*$/);
  return match
    ? { name: match[1], copies: match[2] }
    : { name: text, copies: null };
};
