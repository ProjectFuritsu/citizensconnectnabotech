// CSV export: a header row, then one row per record

const cell = (value) =>
  value == null
    ? ""
    : /[",\r\n]/.test(String(value))
      ? `"${String(value).replace(/"/g, '""')}"`
      : String(value);

export const toCsv = (header, rows) =>
  [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");

// Saves the rows as a .csv file. The leading byte-order mark makes Excel read
// the peso sign and accented names correctly.
export function downloadCsv(fileName, { header, rows }) {
  const blob = new Blob(["﻿" + toCsv(header, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
