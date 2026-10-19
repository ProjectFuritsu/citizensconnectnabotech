import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Phone } from "lucide-react";
import Custom_DynamicIcon from "../../Widgets/custom_DynamicIcon";
import { hotlineGroups, hotlinesUpdated } from "../../Config/links";
import { formatDate } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import JsonLd from "../../SEO/JsonLd";
import { breadcrumbSchema } from "../../SEO/schema";

// Kept deliberately light so it loads fast: numbers come from
// src/Config/hotlines.config.json, grouped by their "category"
export default function HotlinesPage() {
  usePageMeta({
    title: "Emergency Hotlines",
    description:
      "Police, fire, rescue and other emergency numbers for Panabo City. Tap a number to call.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Emergency Hotlines", path: "/hotlines" },
        ])}
      />

      {/* Header */}
      <section className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted"
          >
            <Link to="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <span aria-current="page" className="font-medium text-ink">
              Emergency Hotlines
            </span>
          </nav>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Emergency Hotlines
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl text-pretty">
            Tap a number to call. Save the ones you need before an emergency
            happens.
          </p>
          {hotlinesUpdated && (
            <p className="mt-2 text-sm text-subtle">
              Numbers last checked {formatDate(hotlinesUpdated)}
            </p>
          )}
        </div>
      </section>

      {/* Groups */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {hotlineGroups.map((group) => (
          <section key={group.label} className="pt-10 md:pt-12">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Custom_DynamicIcon
                name={group.icon}
                className={`h-5 w-5 ${group.id === "emergency" ? "text-danger" : "text-subtle"}`}
              />
              {group.label}
            </h2>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((hotline) => (
                <li key={hotline.name}>
                  <a
                    href={`tel:${hotline.number.replace(/\s/g, "")}`}
                    className="group flex h-full items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 hover:border-danger hover:bg-danger-soft transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{hotline.name}</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight group-hover:text-danger-strong transition-colors">
                        {hotline.number}
                      </p>
                      {hotline.description && (
                        <p className="mt-1 text-sm text-muted">
                          {hotline.description}
                        </p>
                      )}
                    </div>
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-canvas text-muted group-hover:bg-danger group-hover:text-white transition-colors"
                    >
                      <Phone size={18} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
