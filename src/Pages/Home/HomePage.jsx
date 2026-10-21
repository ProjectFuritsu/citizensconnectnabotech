import { Link } from "react-router-dom";
import { Container } from "../../Components/Page";
import { Stat } from "../../Components/Stat";
import { GuideService } from "../../Services/GuideService";
import { homePopularGuides, hotlines } from "../../Services/SiteService";
import { formatDate, isFree } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import JsonLd from "../../SEO/JsonLd";
import { websiteSchema } from "../../SEO/schema";
import GuideSearch from "./components/GuideSearch";

// The home page is only about itself: search, "Popular" shortcuts (from
// src/Data/Site/site.config.json) and an at-a-glance summary. Guide Hub, the
// community tools and the transparency pages are reached from the navbar.
export default function HomePage() {
  usePageMeta();

  const { guides, categories, lastUpdated } = GuideService;
  const freeCount = guides.filter((guide) => isFree(guide.fee)).length;

  return (
    // A single section, so no bottom padding: the footer's top border is the divider
    <div className="bg-surface font-sans text-ink">
      <JsonLd data={websiteSchema()} />

      <Container className="py-16 md:py-24 lg:py-28 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20 lg:items-center">
        <div>
          <p className="text-sm font-medium text-brand-600">Panabo City Citizen's Portal</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Public information, made easy to find.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-xl text-pretty">
            Requirements, fees and processing times for city services, all in one place.
          </p>

          <div className="mt-10 max-w-2xl">
            <GuideSearch />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-subtle">Popular:</span>
            {homePopularGuides.map((guide) =>
              guide.disabled ? (
                <span key={guide.guideId} aria-disabled="true" className="cursor-not-allowed text-subtle">
                  {guide.label}
                </span>
              ) : (
                <Link key={guide.guideId} to={`/info/${guide.guideId}`} className="link-quiet text-ink-soft">
                  {guide.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* At a glance */}
        <aside className="overflow-hidden rounded-card border border-line">
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-line bg-canvas">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">At a glance</h2>
            <span className="text-xs text-subtle">Updated {lastUpdated ? formatDate(lastUpdated) : "—"}</span>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-px bg-line">
            <Stat label="Service guides" value={guides.length} />
            <Stat label="Categories" value={categories.length} />
            <Stat label="Free of charge" value={freeCount} valueClassName="text-success" />
            <Stat label="Emergency hotlines" value={hotlines.length} />
          </dl>
        </aside>
      </Container>
    </div>
  );
}
