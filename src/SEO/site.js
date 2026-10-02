// The site's public identity, in one place. Used by page titles and
// descriptions (usePageMeta), structured data, and at build time by
// vite.config.js for index.html, sitemap.xml and robots.txt.

// Change this if the portal moves to a custom domain (no trailing slash)
export const SITE_URL = "https://citizensconnectnabotech.vercel.app";

export const SITE_NAME = "Panabo City Citizen's Portal";

export const DEFAULT_TITLE = `${SITE_NAME} – Requirements, Fees & Steps for City Services`;

export const DEFAULT_DESCRIPTION =
  "Step-by-step guides to Panabo City services: requirements, fees and processing times for civil registry, health, legal, senior citizen, property and scholarship services.";

export const PUBLISHER = { name: "NaboTech.org" };

// Paths that belong in sitemap.xml besides each guide's own page
export const STATIC_PATHS = ["/", "/info"];
