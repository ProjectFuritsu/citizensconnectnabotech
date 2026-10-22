import { ArrowUpRight } from "lucide-react";
import { footerColumns, site } from "../Services/SiteService";
import Logo from "./Logo";
import { Container } from "./Page";
import SiteLink from "./SiteLink";
import SoonBadge from "./SoonBadge";

// Link columns come from src/Data/Site/site.config.json (see SiteService
// footerColumns): one per group, in the order their first pages are listed,
// then Resources

// GitHub's mark (lucide-react has no brand icons)
const GitHubIcon = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-line font-sans">
      {/* Two columns from tablet up: branding on the left, the link columns
          side by side on the right. On phones, everything in one column. */}
      <Container className="py-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        {/* Branding, mission and source code */}
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted leading-relaxed">
            A community portal providing Panabo citizens, businesses, and visitors with information and services.
          </p>
          {site.repository && (
            <a
              href={site.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
            >
              <GitHubIcon />
              View the source on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>

        {/* Navigation Links */}
        <div className="grid gap-8 sm:grid-flow-col sm:auto-cols-fr sm:gap-6 lg:gap-10">
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

      {/* Bottom strip: who made it, and the reuse terms (see the Terms of Use) */}
      <div className="border-t border-line">
        <Container className="py-6">
          <p className="text-xs text-subtle">
            {new Date().getFullYear()} {site.name} · All content is public domain under{" "}
            <a href={site.license.url} target="_blank" rel="noopener noreferrer" className="link-quiet" title={site.license.name}>
              {site.license.short}
            </a>{" "}
            unless otherwise specified.
          </p>
        </Container>
      </div>
    </footer>
  );
}
