import { ArrowUpRight } from "lucide-react";
import { footerColumns } from "../Services/SiteService";
import Logo from "./Logo";
import { Container } from "./Page";
import SiteLink from "./SiteLink";
import SoonBadge from "./SoonBadge";

// Columns come from src/Data/Site/site.config.json: Portal (pages without a
// group), one per group (e.g. Services, Transparency), then Resources

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-line font-sans">
      <Container className="py-12 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        {/* Branding and Mission */}
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted leading-relaxed">
            A community portal providing Panabo citizens, businesses, and visitors with information and services.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
          {footerColumns.map((column) => (
            <div key={column.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">{column.label}</h4>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item.title}>
                    <SiteLink
                      item={item}
                      className={`text-sm ${
                        item.disabled
                          ? "cursor-not-allowed text-subtle"
                          : "inline-flex items-center gap-1 text-muted hover:text-ink transition-colors"
                      }`}
                    >
                      {item.title}
                      {/* Inline, so long names wrap naturally with the label after them */}
                      {item.disabled && <SoonBadge className="ml-1.5 align-middle" />}
                      {item.external && !item.disabled && <ArrowUpRight size={12} className="text-subtle" />}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Bottom Copyright Section */}
      <div className="border-t border-line">
        <Container className="py-6">
          <p className="text-xs text-subtle">© {new Date().getFullYear()} Made by NaboTech.org</p>
        </Container>
      </div>
    </footer>
  );
}
