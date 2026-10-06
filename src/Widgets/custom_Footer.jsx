import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { footerColumns } from "../Config/links";
import Custom_Logo from "./custom_Logo";
import Custom_SoonBadge from "./custom_SoonBadge";

// Columns (Portal, Tools, Resources) come from src/Config/site.config.json

const linkStyle =
  "inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors";

export default function Custom_Footer() {
  return (
    <footer className="bg-surface border-t border-line font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        {/* Branding and Mission */}
        <div className="max-w-sm">
          <Custom_Logo />
          <p className="mt-4 text-sm text-muted leading-relaxed">
            A community portal providing panabo citizens, businesses, and visitors with information and services.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16">
          {footerColumns.map((nav) => (
            <div key={nav.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {nav.label}
              </h4>
              <ul className="mt-4 space-y-3">
                {nav.items.map((item) => (
                  <li key={item.title}>
                    <FooterLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} Made by NaboTech.org
          </p>
        </div>
      </div>
    </footer>
  );
}

// Same flags as the navbar: disabled items are plain text with a "Soon" label
const FooterLink = ({ item }) => {
  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        title={`${item.title} is coming soon`}
        className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm text-subtle"
      >
        {item.title}
        <Custom_SoonBadge />
      </span>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className={linkStyle}
      >
        {item.title}
        <ArrowUpRight size={12} className="text-subtle" />
      </a>
    );
  }

  return (
    <Link to={item.path} className={linkStyle}>
      {item.title}
    </Link>
  );
};
