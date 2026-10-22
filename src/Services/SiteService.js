// Turns src/Data/Site/site.config.json and hotlines.json into the lists each
// part of the site renders. You shouldn't need to edit this file: edit the
// JSON instead (see src/Data/Site/README.md).
import config from "../Data/Site/site.config.json";
import hotlineConfig from "../Data/Site/hotlines.json";
import { GuideService } from "./GuideService";

export const site = config.site;

const visible = (item) => !item.hidden;

// One link shape for the navbar and footer:
// { title, path, external, disabled, description, icon }
const pageLink = (page) => ({
  title: page.title,
  path: page.path,
  description: page.description,
  icon: page.icon,
  disabled: page.disabled,
});
const toolLink = (tool) => ({
  title: tool.label,
  path: tool.url,
  icon: tool.icon,
  external: true,
  disabled: tool.disabled,
});
const resourceLink = (resource) => ({
  title: resource.title,
  path: resource.url,
  external: true,
  disabled: resource.disabled,
});

// Pages, then tools, that have the flag ("navbar" or "footer"), in the order
// they're listed. Items with a "group" are gathered into one entry,
// { group: "Services", pages, tools }, placed where the group's first item
// is; items without a group stay single links. In the footer, "footerGroup"
// overrides "group" (e.g. a plain navbar link that sits under Services).
const arrange = (flag) => {
  const entries = [];
  const groups = new Map();
  const add = (item, link) => {
    const name = (flag === "footer" && item.footerGroup) || item.group;
    if (!name) return entries.push(link);
    if (!groups.has(name)) {
      const group = { group: name, pages: [], tools: [] };
      groups.set(name, group);
      entries.push(group);
    }
    groups.get(name)[link.external ? "tools" : "pages"].push(link);
  };
  config.pages.filter((p) => visible(p) && p[flag]).forEach((p) => add(p, pageLink(p)));
  config.tools.filter((t) => visible(t) && t[flag]).forEach((t) => add(t, toolLink(t)));
  return entries;
};

// Navbar: plain links and group dropdowns
export const navbarEntries = arrange("navbar");

// Footer columns: one per group, plus "Portal" for pages without a group,
// each placed where its first page is listed (like the navbar dropdowns).
// Then tools without a group, then resources. Empty columns are left out.
const footerColumnsOf = (entries) => {
  const columns = [];
  let portal = null;
  for (const entry of entries) {
    if (entry.group) columns.push({ label: entry.group, items: [...entry.pages, ...entry.tools] });
    else if (!entry.external) {
      if (!portal) columns.push((portal = { label: "Portal", items: [] }));
      portal.items.push(entry);
    }
  }
  return columns;
};
const footerEntries = arrange("footer");
export const footerColumns = [
  ...footerColumnsOf(footerEntries),
  { label: "Tools", items: footerEntries.filter((e) => !e.group && e.external) },
  {
    label: "Resources",
    items: config.resources.filter((r) => visible(r) && r.footer).map(resourceLink),
  },
].filter((column) => column.items.length > 0);

// Every community tool, in the shape of a link (for the About page)
export const tools = config.tools.filter(visible).map(toolLink);

// Where to report a mistake: a mailto: or web link, or null when not set
const contact = (site.contact ?? "").trim();
export const contactLink = contact
  ? { label: contact, href: contact.includes("@") && !contact.includes("://") ? `mailto:${contact}` : contact }
  : null;

// Home page: "Popular" shortcuts under the search bar
export const homePopularGuides = config.popularGuides.filter((guide) => {
  if (!visible(guide)) return false;
  if (!GuideService.byId(guide.guideId)) {
    console.warn(
      `site.config.json: popular guide "${guide.label}" points to unknown guideId "${guide.guideId}" and was skipped.`,
    );
    return false;
  }
  return true;
});

// Emergency hotlines in display order: { name, number, category, description,
// tel }. `tel` is the tap-to-call link, with the spaces taken out.
export const hotlines = hotlineConfig.hotlines
  .filter(visible)
  .map((hotline) => ({ ...hotline, tel: `tel:${hotline.number.replace(/\s/g, "")}` }));
export const hotlinesUpdated = hotlineConfig.lastUpdated;

// Hotlines grouped by category for the Emergency Hotlines page, in this
// order; groups with no numbers are left out
const HOTLINE_CATEGORIES = [
  { id: "emergency", label: "Emergency response", icon: "Siren" },
  { id: "hospital", label: "Hospitals", icon: "Hospital" },
  { id: "towing", label: "Towing", icon: "Truck" },
  { id: "utility", label: "Utilities", icon: "PlugZap" },
  { id: "government", label: "City offices", icon: "Landmark" },
  { id: undefined, label: "Other numbers", icon: "Phone" },
];
export const hotlineGroups = HOTLINE_CATEGORIES.map((group) => ({
  ...group,
  items: hotlines.filter((h) =>
    group.id
      ? h.category === group.id
      : !HOTLINE_CATEGORIES.some((c) => c.id && c.id === h.category),
  ),
})).filter((group) => group.items.length > 0);

// Pages listed in sitemap.xml (each guide's page is added automatically)
export const sitemapPaths = config.pages
  .filter((p) => visible(p) && !p.disabled)
  .map((p) => p.path);
