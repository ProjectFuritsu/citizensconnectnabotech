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
