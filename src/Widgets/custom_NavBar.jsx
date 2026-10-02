import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import contactData from "../Data/contacts.json";
import { navbarItems } from "../Routes/navigation";
import Custom_Logo from "./custom_Logo";
import Custom_SoonBadge from "./custom_SoonBadge";

// Links and their flags (disabled, hidden, ...) live in src/Routes/navigation.js

const linkBase =
  "inline-flex items-center gap-1 rounded-control px-3 py-2 text-sm font-medium transition-colors";
const linkIdle = "text-muted hover:text-ink hover:bg-canvas";
const linkActive = "text-brand-700 bg-brand-50";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 1. HOTLINE MARQUEE */}
      <div className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-10 flex items-center gap-1">
          <span className="flex items-center gap-2 shrink-0 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="sm:hidden">Hotlines</span>
            <span className="hidden sm:inline">Emergency hotlines</span>
          </span>
          <span className="h-4 w-px shrink-0 bg-white/15" />
          {/* Empty onTouchStart lets iOS Safari apply :active, pausing on touch */}
          <div
            onTouchStart={() => {}}
            className="group flex min-w-0 grow overflow-hidden no-scrollbar motion-reduce:overflow-x-auto mask-[linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)]"
          >
            <HotlineTrack />
            <HotlineTrack duplicate />
          </div>
        </div>
      </div>

      {/* 2. MAIN NAV */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-6">
          <Custom_Logo />

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navbarItems.map((item) => (
              <li key={item.title}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden -mr-2 p-2 rounded-control text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* 3. MOBILE DROPDOWN */}
        {isMobileMenuOpen && (
          <ul className="md:hidden border-t border-line px-4 py-2 flex flex-col">
            {navbarItems.map((item) => (
              <li key={item.title}>
                <NavItem
                  item={item}
                  className="flex w-full py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </li>
            ))}
          </ul>
        )}
      </header>
    </>
  );
}

// One copy of the scrolling hotline row. The marquee renders two copies side
// by side; the duplicate is hidden from screen readers and keyboard focus,
// and dropped entirely when the visitor prefers reduced motion.
const HotlineTrack = ({ duplicate = false }) => (
  <ul
    aria-hidden={duplicate || undefined}
    className={`flex min-w-full shrink-0 items-center justify-around gap-8 px-4 animate-marquee group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none ${duplicate ? "motion-reduce:hidden" : ""}`}
  >
    {contactData.essential_contacts.map((contact) => (
      <li key={contact.name} className="shrink-0">
        <a
          href={`tel:${contact.number.replace(/\s/g, "")}`}
          tabIndex={duplicate ? -1 : undefined}
          className="group/link flex items-baseline gap-1.5 text-xs whitespace-nowrap"
        >
          <span className="text-white/60">{contact.name}</span>
          <span className="font-semibold tabular-nums group-hover/link:underline underline-offset-2">
            {contact.number}
          </span>
        </a>
      </li>
    ))}
  </ul>
);

// Internal pages get an active state; external tools open in a new tab;
// disabled items render as plain text so they can't be clicked or focused
const NavItem = ({ item, className = "", onClick }) => {
  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        title={`${item.title} is coming soon`}
        className={`${linkBase} cursor-not-allowed text-subtle ${className}`}
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
        onClick={onClick}
        className={`${linkBase} ${linkIdle} ${className}`}
      >
        {item.title}
        <ArrowUpRight size={14} className="text-subtle" />
      </a>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkIdle} ${className}`
      }
    >
      {item.title}
    </NavLink>
  );
};
