import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Section title, one-line description and an optional right-aligned link.
// `icon` (an element) sits before the title.
export function SectionHeader({ title, desc, link, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          {icon}
          {title}
        </h2>
        {desc && <p className="mt-2 text-sm text-muted">{desc}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0"
        >
          {link.label}
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// A page section: the header, then its content, spaced like every other
// section. With an `id`, in-page links land just below the sticky navbar.
export const Section = ({ title, desc, link, icon, id, children }) => (
  <section id={id} className="pt-10 md:pt-12 scroll-mt-24">
    {title && <SectionHeader title={title} desc={desc} link={link} icon={icon} />}
    <div className="mt-6">{children}</div>
  </section>
);

// A section whose content sits on a white card: charts and lists
export const Panel = ({ children, ...section }) => (
  <Section {...section}>
    <div className="rounded-card border border-line bg-surface p-5 md:p-6">{children}</div>
  </Section>
);
