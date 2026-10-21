import { DynamicIcon, iconNames } from "lucide-react/dynamic";

// A lucide icon by name, for names that come from data: the site config
// ("MapPinned") or the guides. Each icon is downloaded only when it's shown,
// so the site doesn't carry the whole icon set. An unknown name shows a folder.
// Browse names at https://lucide.dev/icons.
const known = new Set(iconNames);
const toKebab = (name = "") =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

export default function Icon({ name, className = "" }) {
  const kebab = toKebab(name);
  return (
    <DynamicIcon
      name={known.has(kebab) ? kebab : "folder"}
      className={className}
      aria-hidden="true"
      // Holds the icon's space while it loads, so nothing shifts
      fallback={() => <span aria-hidden="true" className={`inline-block ${className}`} />}
    />
  );
}
