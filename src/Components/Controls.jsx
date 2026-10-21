import { Link } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import Icon from "./Icon";

// Buttons, chips, tabs, search and select: the controls every page shares
// (DESIGN.md "Filter chips", "Search input", "Primary button")

const BUTTON_VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
};
const BUTTON_SIZES = { sm: "px-3.5 py-2", md: "px-4 py-2.5" };
const buttonClass = (variant, size) =>
  `inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`;

// `icon` is a lucide component, e.g. icon={Download}
export const Button = ({ variant = "secondary", size = "sm", icon: IconComponent, children, ...props }) => (
  <button type="button" className={buttonClass(variant, size)} {...props}>
    {IconComponent && <IconComponent size={16} />}
    {children}
  </button>
);

// A link that looks like a button
export const ButtonLink = ({ to, variant = "primary", size = "md", children }) => (
  <Link to={to} className={buttonClass(variant, size)}>
    {children}
  </Link>
);

// A toggle pill for filters, years and categories, with an optional icon
// (a lucide name) and count
export const Chip = ({ active, onClick, icon, count, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium tabular-nums transition-colors ${
      active
        ? "border-brand-200 bg-brand-50 text-brand-700"
        : "border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700"
    }`}
  >
    {icon && <Icon name={icon} className={`h-4 w-4 ${active ? "text-brand-600" : "text-subtle"}`} />}
    {children}
    {count != null && (
      <span className={`text-xs ${active ? "text-brand-600" : "text-subtle"}`}>
        {count.toLocaleString("en-US")}
      </span>
    )}
  </button>
);

// A labelled row of chips: scrolls sideways on phones, wraps from md up
export const ChipGroup = ({ label, children }) => (
  <div
    role="group"
    aria-label={label}
    className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:flex-wrap md:px-0"
  >
    {children}
  </div>
);

// One chip per year (newest first), plus anything after them, e.g. a note
// about years not yet added
export const YearChips = ({ years, value, onChange, children }) => (
  <ChipGroup label="Choose a year">
    {years.map((y) => (
      <Chip key={y.year} active={y.year === value} onClick={() => onChange(y.year)}>
        {y.year}
      </Chip>
    ))}
    {children}
  </ChipGroup>
);

// View tabs at the bottom of a page header: [{ id, label }]
export const Tabs = ({ label, tabs, value, onChange }) => (
  <div role="group" aria-label={label} className="-mb-px flex gap-1 overflow-x-auto no-scrollbar">
    {tabs.map((tab) => {
      const active = tab.id === value;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={active}
          className={`shrink-0 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
            active ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

// A search box; size "lg" for a page's main search. onChange gets the text.
export const SearchInput = ({ value, onChange, label, placeholder, size = "md" }) => (
  <div className="relative">
    <Search
      size={size === "lg" ? 20 : 16}
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-subtle ${size === "lg" ? "left-4" : "left-3"}`}
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      placeholder={placeholder}
      className={`w-full rounded-control border border-line bg-surface text-ink placeholder:text-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600 ${
        size === "lg" ? "py-3.5 pl-12 pr-4 shadow-sm" : "py-2 pl-9 pr-3 text-sm"
      }`}
    />
  </div>
);

// A dropdown with its label in front, e.g. "Sort [Newest first ▾]".
// options: [{ id, label }]; onChange gets the chosen id.
export const Select = ({ label, value, onChange, options }) => (
  <label className="flex items-center gap-2 text-sm text-muted">
    {label}
    <span className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-control border border-line bg-surface py-2 pl-3 pr-9 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
      />
    </span>
  </label>
);
