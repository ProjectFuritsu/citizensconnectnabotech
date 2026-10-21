import reportsFile from "../Data/Audit/reports.json";

// COA Annual Audit Reports: the original files in src/Data/Audit/reports/<year>/,
// listed in reports.json (see src/Data/Audit/README.md). Vite gives each file
// an address the browser can open or download.
const fileUrls = import.meta.glob("../Data/Audit/reports/*/*", {
  query: "?url",
  import: "default",
  eager: true,
});

// "2024/09-PanaboCity2024_Part1-FS.pdf" → its address on the site, or null
const fileUrl = (path) => {
  const url = fileUrls[`../Data/Audit/reports/${path}`];
  if (!url) console.warn(`Audit report file not found: src/Data/Audit/reports/${path}`);
  return url ?? null;
};

const reports = reportsFile.reports.map((report) => ({
  ...report,
  files: report.files.map((file) => ({ ...file, url: fileUrl(file.file) })),
}));

export const AuditService = {
  fileUrl,

  // A year's report, each file with its `url`, or null
  reportFor: (year) => reports.find((report) => report.year === year) ?? null,
};
