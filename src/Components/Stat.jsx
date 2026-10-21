// Headline figures (DESIGN.md "Stat grid")

// A bordered grid of figures with hairline dividers. Pass the column classes,
// e.g. "sm:grid-cols-2 lg:grid-cols-4".
export const StatGrid = ({ className = "", children }) => (
  <dl className={`grid gap-px overflow-hidden rounded-card border border-line bg-line ${className}`}>
    {children}
  </dl>
);

// One figure: a label (with an optional icon), the value, then an optional
// exact amount, a note, or a meter as children. size "md" for smaller values.
export const Stat = ({ label, icon: IconComponent, value, exact, note, size = "lg", valueClassName = "text-ink", children }) => (
  <div className="bg-surface px-5 py-4">
    <dt className="flex items-center gap-1.5 text-xs text-muted">
      {IconComponent && <IconComponent size={14} className="text-subtle" />}
      {label}
    </dt>
    <dd
      className={`mt-1 font-semibold tabular-nums ${size === "lg" ? "text-3xl" : "text-lg leading-snug"} ${valueClassName}`}
    >
      {value}
    </dd>
    {exact && <dd className="mt-0.5 text-xs text-muted tabular-nums">{exact}</dd>}
    {note && <dd className="mt-0.5 text-xs text-muted">{note}</dd>}
    {children}
  </div>
);
