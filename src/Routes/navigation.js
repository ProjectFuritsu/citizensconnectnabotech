// Site navigation, shared by the navbar and the footer.
// Each item: { title, path, group } plus optional flags:
//   group: "Portal" | "Tools" -> which footer column it appears in
//   external: true    -> opens in a new tab, with an ↗ icon
//   disabled: true    -> shown greyed out with a "Soon" label, not clickable
//   hidden: true      -> not shown anywhere (keeps the entry ready to switch back on)
//   footerOnly: true  -> shown in the footer but not in the navbar
export const navigation = [
  { title: "Home", path: "/", group: "Portal" },
  { title: "Guide Hub", path: "/info", group: "Portal" },
  { title: "News & Updates", path: "/news-updates", group: "Portal", hidden: true },
  { title: "City Map", path: "https://nabomap.vercel.app", group: "Tools", external: true },
  { title: "Market Prices", path: "https://panapresyo.vercel.app", group: "Tools", disabled: true },
  {
    title: "City Events",
    path: "https://evently-panabo.vercel.app/",
    group: "Tools",
    external: true,
    footerOnly: true,
  },
];

export const navbarItems = navigation.filter(
  (item) => !item.hidden && !item.footerOnly,
);

// Visible items grouped into footer columns, in the order groups first appear
export const footerGroups = navigation
  .filter((item) => !item.hidden)
  .reduce((groups, item) => {
    const group = groups.find((g) => g.label === item.group);
    if (group) group.items.push(item);
    else groups.push({ label: item.group, items: [item] });
    return groups;
  }, []);
