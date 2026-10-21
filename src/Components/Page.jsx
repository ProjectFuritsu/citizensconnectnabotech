import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import JsonLd from "../SEO/JsonLd";
import { breadcrumbSchema } from "../SEO/schema";

// Page layout shared by every inner page (DESIGN.md "Page patterns")

// The page wrapper: canvas background, and room above the footer
export const Page = ({ children }) => (
  <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">{children}</div>
);

// Same width and side padding as the navbar and footer, so edges line up
export const Container = ({ className = "", children, ...props }) => (
  <div className={`max-w-7xl mx-auto px-4 md:px-8 ${className}`} {...props}>
    {children}
  </div>
);

// Home › Guide Hub › …; a crumb marked `current` is the page you're on
export const Breadcrumb = ({ crumbs }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
    {crumbs.map((crumb, i) => (
      <Fragment key={crumb.path}>
        {i > 0 && <ChevronRight size={14} className="text-faint" />}
        {crumb.current ? (
          <span aria-current="page" className="font-medium text-ink">
            {crumb.name}
          </span>
        ) : (
          <Link to={crumb.path} className="hover:text-ink transition-colors">
            {crumb.name}
          </Link>
        )}
      </Fragment>
    ))}
  </nav>
);

// Inner page header: breadcrumb (Home › title), title, intro, an optional
// small note, then any controls (search, year chips, tabs). Also gives search
// engines the breadcrumb.
export function PageHeader({ title, path, intro, note, children }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path, current: true },
  ];
  return (
    <section className="bg-surface border-b border-line">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className={`pt-10 md:pt-14 ${children ? "pb-6" : "pb-10 md:pb-14"}`}>
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-balance">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted text-pretty">{intro}</p>}
        {note && <p className="mt-2 text-sm text-subtle">{note}</p>}
        {children}
      </Container>
    </section>
  );
}
