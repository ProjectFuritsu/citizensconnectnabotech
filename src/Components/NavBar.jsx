import { useEffect, useId, useRef, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { hotlines, navbarEntries } from "../Services/SiteService";
import Icon from "./Icon";
import Logo from "./Logo";
import SiteLink from "./SiteLink";
import SoonBadge from "./SoonBadge";

// Links, groups and their flags (disabled, hidden, ...) come from
// src/Data/Site/site.config.json

const linkBase =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-control px-3 py-2 text-sm font-medium transition-colors";
const linkIdle = "text-muted hover:text-ink hover:bg-canvas";
const linkActive = "text-brand-700 bg-brand-50";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* 1. HOTLINE MARQUEE */}
      <div className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-10 flex items-center gap-1">
          {/* Label opens the full Emergency Hotlines page */}
          <Link
            to="/hotlines"
            className="flex items-center gap-2 shrink-0 text-xs font-medium hover:underline underline-offset-2"
          >
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="sm:hidden">Hotlines</span>
            <span className="hidden sm:inline">Emergency hotlines</span>
          </Link>
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
          <Logo />

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navbarEntries.map((entry) => (
              <li key={entry.group ?? entry.title}>
                {entry.group ? <NavGroup group={entry} /> : <NavItem item={entry} />}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden -mr-2 p-2 rounded-control text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* 3. MOBILE DROPDOWN: groups become labelled sections. Scrolls on
            its own when it's taller than the screen (the header is sticky). */}
        {isMobileMenuOpen && (
          <ul className="lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line px-4 py-2 flex flex-col">
            {navbarEntries.map((entry) => (
              <li
                key={entry.group ?? entry.title}
                className={`border-t border-line first:border-t-0 ${entry.group ? "py-2" : ""}`}
              >
                {entry.group ? (
                  <GroupLinks group={entry} mobile onNavigate={closeMobileMenu} />
                ) : (
                  <NavItem item={entry} className="flex w-full py-3" onClick={closeMobileMenu} />
                )}
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
    {hotlines.map((contact) => (
      <li key={contact.name} className="shrink-0">
        <a
          href={contact.tel}
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

// A plain navbar link: active state for this site's pages, an arrow for tools
const NavItem = ({ item, className = "", onClick }) => (
  <SiteLink
    item={item}
    onClick={onClick}
    className={({ isActive }) =>
      `${linkBase} ${item.disabled ? "cursor-not-allowed text-subtle" : isActive ? linkActive : linkIdle} ${className}`
    }
  >
    {item.title}
    {item.disabled && <SoonBadge />}
    {item.external && !item.disabled && <ArrowUpRight size={14} className="text-subtle" />}
  </SiteLink>
);

// --- Groups ---

// A navbar dropdown (disclosure pattern): the button opens a panel with the
// group's pages and tools. It closes on Escape, a click outside, a link
// click, or when focus moves out of it.
const NavGroup = ({ group }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname } = useLocation();
  // Highlighted while you're on one of its pages (or a page under it)
  const active = group.pages.some((page) => matchPath({ path: page.path, end: false }, pathname));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (event.relatedTarget && !rootRef.current.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`${linkBase} ${active ? linkActive : open ? "text-ink bg-canvas" : linkIdle}`}
      >
        {group.group}
        <ChevronDown
          size={14}
          className={`text-subtle transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={panelId}
          className={`absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-card border border-line bg-surface p-2 shadow-lg ${
            group.tools.length > 0 ? "w-[36rem]" : "w-80"
          }`}
        >
          <GroupLinks group={group} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

// A group's pages (with their descriptions), then its tools under
// "Community tools". Shared by the desktop dropdown and the mobile menu,
// where the group's name is shown as a section heading.
const GroupLinks = ({ group, mobile = false, onNavigate }) => (
  <>
    {mobile && (
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-subtle">
        {group.group}
      </p>
    )}
    {group.pages.length > 0 && (
      <ul>
        {group.pages.map((page) => (
          <li key={page.title}>
            <GroupPageLink page={page} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    )}
    {group.tools.length > 0 && (
      <div className={group.pages.length > 0 && !mobile ? "mt-1 border-t border-line" : ""}>
        <p className="px-3 pt-3 pb-1 text-xs font-medium text-subtle">Community tools</p>
        <ul className={`grid gap-0.5 ${mobile ? "sm:grid-cols-2" : "grid-cols-2"}`}>
          {group.tools.map((tool) => (
            <li key={tool.title}>
              <ToolLink tool={tool} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);

// The icon tile shared by pages and tools in a group
const ItemIcon = ({ name, muted }) => (
  <span
    className={`grid h-8 w-8 shrink-0 place-items-center rounded-control ${
      muted ? "bg-canvas text-subtle" : "bg-brand-50 text-brand-600"
    }`}
  >
    <Icon name={name} className="h-4 w-4" />
  </span>
);

// A page in a group: icon (if set), title and a one-line description
const GroupPageLink = ({ page, onNavigate }) => (
  <SiteLink
    item={page}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-start gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
        page.disabled
          ? "cursor-not-allowed text-subtle"
          : isActive
            ? "bg-brand-50 text-brand-700"
            : "text-ink hover:bg-canvas"
      }`
    }
  >
    {page.icon && <ItemIcon name={page.icon} muted={page.disabled} />}
    <span className="min-w-0">
      <span className="flex items-center gap-1.5">
        {page.title}
        {page.disabled && <SoonBadge />}
      </span>
      {page.description && (
        <span className="mt-0.5 block text-xs font-normal text-muted">{page.description}</span>
      )}
    </span>
  </SiteLink>
);

// A community tool: its icon, its name, and an arrow (it opens in a new tab)
// or a "Soon" label when it's disabled
const ToolLink = ({ tool, onNavigate }) => (
  <SiteLink
    item={tool}
    onClick={onNavigate}
    className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-sm leading-snug transition-colors ${
      tool.disabled ? "cursor-not-allowed text-subtle" : "font-medium text-ink-soft hover:bg-canvas hover:text-ink"
    }`}
  >
    <ItemIcon name={tool.icon} muted={tool.disabled} />
    <span className="min-w-0">{tool.title}</span>
    {tool.disabled ? (
      <SoonBadge className="ml-auto" />
    ) : (
      <ArrowUpRight size={14} className="ml-auto shrink-0 text-subtle" />
    )}
  </SiteLink>
);
