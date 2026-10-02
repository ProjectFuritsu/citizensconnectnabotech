import * as LucideIcons from "lucide-react";

// Renders a lucide icon from its export name, e.g. icon_type in InfoData.json
export default function Custom_DynamicIcon({ name, className }) {
  const IconComponent = LucideIcons[name];
  // Fallback to Folder icon if the name is misspelled or missing
  if (!IconComponent) return <LucideIcons.Folder className={className} />;
  return <IconComponent className={className} />;
}
