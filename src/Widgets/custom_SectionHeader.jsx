import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Section title, one-line description and an optional right-aligned link
export default function Custom_SectionHeader({ title, desc, link }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {desc && <p className="mt-2 text-sm text-muted">{desc}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0"
        >
          {link.label}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}
