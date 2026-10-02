import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Custom_Logo from "./custom_Logo";

const footerNavs = [
  {
    label: "Portal",
    items: [
      { href: "/", name: "Home" },
      { href: "/info", name: "Guide Hub" },
      { href: "/news-updates", name: "News & Updates" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "https://nabomap.vercel.app", name: "City Map", external: true },
      { href: "https://panapresyo.vercel.app", name: "Market Prices", external: true },
      { href: "https://evently-panabo.vercel.app/", name: "City Events", external: true },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "https://panabocity.gov.ph/",
        name: "Panabo City Official Website",
        external: true,
      },
    ],
  },
];

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
            Your official source for public information. Ensuring transparency
            and access to knowledge for everyone.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16">
          {footerNavs.map((nav) => (
            <div key={nav.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {nav.label}
              </h4>
              <ul className="mt-4 space-y-3">
                {nav.items.map((item) => (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkStyle}
                      >
                        {item.name}
                        <ArrowUpRight size={12} className="text-subtle" />
                      </a>
                    ) : (
                      <Link to={item.href} className={linkStyle}>
                        {item.name}
                      </Link>
                    )}
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
