import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Custom_HomePageSearchBar from "../../Widgets/custom_HomePageSearchBar";
import Custom_DynamicIcon from "../../Widgets/custom_DynamicIcon";
import Custom_SectionHeader from "../../Widgets/custom_SectionHeader";
import { InfoDataService } from "../../Services/InfoLibServices/InfoLibService";
import { formatDate, isFree } from "../../Theme/display";
import contactData from "../../Data/contacts.json";

// Shortcuts shown under the hero search bar
const popularGuides = [
  { label: "Marriage License", id: "PANABO-MARRIAGE-LICENSE-2026" },
  { label: "Senior Citizen ID", id: "PANABO-SENIOR-CITIZEN-ID-2026" },
  { label: "Scholarship", id: "PANABO-SCHOLARSHIP-PROGRAM-2026" },
  { label: "Medical Certificate", id: "PANABO-MEDICAL-CERTIFICATE-2026" },
];

// External NaboTech tools (also linked in the navbar)
const tools = [
  {
    name: "NaboMap",
    title: "Explore the city",
    desc: "Food spots, cafés, pharmacies and tourist spots on an interactive map.",
    href: "https://nabomap.vercel.app",
    icon: "MapPinned",
  },
  {
    name: "PanaPresyo",
    title: "Market prices",
    desc: "Recent prices of goods in local markets, before you shop.",
    href: "https://panapresyo.vercel.app",
    icon: "ShoppingBasket",
  },
  {
    name: "Evently",
    title: "City events",
    desc: "Community activities, festivals and official city gatherings.",
    href: "https://evently-panabo.vercel.app/",
    icon: "CalendarDays",
  },
];

export default function HomePage() {
  const guides = InfoDataService.getAllPrograms();
  const hotlines = contactData.essential_contacts;
  const categories = InfoDataService.getCategories();

  const freeCount = guides.filter((g) => isFree(g.fee)).length;

  // Date of the most recently added guide (ISO dates compare as strings)
  const newestDate = guides.reduce(
    (latest, guide) => (guide.date > latest ? guide.date : latest),
    "",
  );
  const lastUpdated = newestDate ? formatDate(newestDate) : "—";

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      {/* Hero Section */}
      <section className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-28 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20 lg:items-center">
          <div>
            <p className="text-sm font-medium text-brand-600">
              Panabo City Citizen's Portal
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Public information, made easy to find.
            </h1>
            <p className="mt-5 text-lg text-muted max-w-xl text-pretty">
              Requirements, fees and processing times for city services, all
              in one place.
            </p>

            {/* Search Bar */}
            <div className="mt-10 max-w-2xl">
              <Custom_HomePageSearchBar />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-subtle">Popular:</span>
              {popularGuides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/info/${guide.id}`}
                  className="text-ink-soft underline decoration-faint underline-offset-4 hover:text-brand-600 hover:decoration-brand-600 transition-colors"
                >
                  {guide.label}
                </Link>
              ))}
            </div>
          </div>

          {/* At a Glance */}
          <aside className="overflow-hidden rounded-card border border-line">
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-line bg-canvas">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                At a glance
              </h2>
              <span className="text-xs text-subtle">
                Updated {lastUpdated}
              </span>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-px bg-line">
              <GlanceStat value={guides.length} label="Service guides" />
              <GlanceStat value={categories.length} label="Categories" />
              <GlanceStat
                value={freeCount}
                label="Free of charge"
                valueClassName="text-success"
              />
              <GlanceStat value={hotlines.length} label="Emergency hotlines" />
            </dl>
          </aside>
        </div>
      </section>

      {/* Community Tools */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12">
        <Custom_SectionHeader
          title="Community tools"
          desc="More NaboTech services for Panabo City."
        />

        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
            >
              <Custom_DynamicIcon
                name={tool.icon}
                className="mt-0.5 h-5 w-5 shrink-0 text-subtle group-hover:text-brand-600 transition-colors"
              />
              <div className="grow">
                <p className="flex items-center gap-1.5 font-semibold group-hover:text-brand-700 transition-colors">
                  {tool.title}
                  <span className="text-xs font-normal text-subtle">
                    · {tool.name}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-faint group-hover:text-brand-600 transition-colors"
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// Sub-components for cleaner code
const GlanceStat = ({ value, label, valueClassName = "text-ink" }) => (
  <div className="bg-surface px-5 py-4">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className={`mt-1 text-3xl font-semibold tabular-nums ${valueClassName}`}>
      {value}
    </dd>
  </div>
);
