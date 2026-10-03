// Turns site.config.json and hotlines.config.json into the lists each part of
// the site renders. You shouldn't need to edit this file: edit the JSON instead.
import config from "./site.config.json";
import hotlineConfig from "./hotlines.config.json";
import guideData from "../Data/InfoLib/InfoData.json";

export const site = config.site;

const visible = (item) => !item.hidden;

// One link shape for the navbar and footer: { title, path, external, disabled }
const pageLink = (page) => ({
  title: page.title,
  path: page.path,
  disabled: page.disabled,
});
const toolLink = (tool) => ({
  title: tool.label,
  path: tool.url,
  external: true,
  disabled: tool.disabled,
});
const resourceLink = (resource) => ({
  title: resource.title,
  path: resource.url,
  external: true,
  disabled: resource.disabled,
});

// Navbar: pages first, then tools, in the order they're listed
export const navbarLinks = [
  ...config.pages.filter((p) => visible(p) && p.navbar).map(pageLink),
  ...config.tools.filter((t) => visible(t) && t.navbar).map(toolLink),
];

// Footer columns; empty columns are left out
export const footerColumns = [
  {
    label: "Portal",
    items: config.pages.filter((p) => visible(p) && p.footer).map(pageLink),
  },
  {
    label: "Tools",
    items: config.tools.filter((t) => visible(t) && t.footer).map(toolLink),
  },
  {
    label: "Resources",
    items: config.resources.filter((r) => visible(r) && r.footer).map(resourceLink),
  },
].filter((column) => column.items.length > 0);

// Home page: Community tools cards and "Popular" shortcuts
export const homeTools = config.tools.filter((t) => visible(t) && t.home);

const guideIds = new Set(guideData.data.map((guide) => guide.id));
export const homePopularGuides = config.popularGuides.filter((guide) => {
  if (!visible(guide)) return false;
  if (!guideIds.has(guide.guideId)) {
    console.warn(
      `site.config.json: popular guide "${guide.label}" points to unknown guideId "${guide.guideId}" and was skipped.`,
    );
    return false;
  }
  return true;
});

// Emergency hotlines: { name, number } in display order
export const hotlines = hotlineConfig.hotlines.filter(visible);

// Pages listed in sitemap.xml (each guide's page is added automatically)
export const sitemapPaths = config.pages
  .filter((p) => visible(p) && !p.disabled)
  .map((p) => p.path);
