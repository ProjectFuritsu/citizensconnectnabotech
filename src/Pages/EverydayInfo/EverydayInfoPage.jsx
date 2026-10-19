import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock,
  Droplet,
  MapPin,
  Phone,
  Search,
  SearchX,
  Siren,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import {
  EverydayInfoService,
  hasText,
} from "../../Services/EverydayInfoServices/EverydayInfoService";
import Custom_SectionHeader from "../../Widgets/custom_SectionHeader";
import { formatDate, formatTimeRange } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import JsonLd from "../../SEO/JsonLd";
import { breadcrumbSchema } from "../../SEO/schema";

// Data lives in src/Data/EverydayInfo (see the README there)
const sections = [
  { id: "interruptions", label: "Service interruptions", icon: Zap },
  { id: "barangays", label: "Barangay directory", icon: Building2 },
  { id: "garbage", label: "Garbage collection", icon: Trash2 },
];

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STORAGE_KEY = "everyday.garbageBarangay";

export default function EverydayInfoPage() {
  usePageMeta({
    title: "Everyday Info",
    description:
      "Planned power and water interruptions, barangay directory and garbage collection schedules for Panabo City.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Everyday Info", path: "/everyday" },
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
              Everyday Info
            </span>
          </nav>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Everyday Info
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl text-pretty">
            Planned power and water interruptions, barangay contacts and garbage
            collection days, in one place.
          </p>

          {/* Jump links */}
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                <Icon size={16} className="text-subtle" />
                {label}
              </a>
            ))}
            <Link
              to="/hotlines"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-danger-strong hover:border-danger hover:bg-danger-soft transition-colors"
            >
              <Siren size={16} className="text-danger" />
              Emergency hotlines
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </section>

      <InterruptionsSection />
      <BarangayDirectorySection />
      <GarbageSection />
    </div>
  );
}

// --- Service interruptions ---

function InterruptionsSection() {
  const interruptions = EverydayInfoService.getCurrentInterruptions();
  const sources = EverydayInfoService.getOfficialSources();

  return (
    <section
      id="interruptions"
      className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12 scroll-mt-24"
    >
      <Custom_SectionHeader
        title="Service interruptions"
        desc="Planned power and water outages in Panabo City."
      />

      {interruptions.length > 0 ? (
        <ul className="mt-8 grid gap-3 lg:grid-cols-2">
          {interruptions.map((item) => (
            <InterruptionCard
              key={`${item.provider}-${item.start}-${item.title}`}
              item={item}
            />
          ))}
        </ul>
      ) : (
        // Honest empty state: nothing posted here doesn't mean no outages
        <div className="mt-8 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
          <CalendarClock size={28} className="mx-auto text-subtle" />
          <h3 className="mt-3 font-semibold">
            No interruptions posted here yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Planned outages will be listed here once announced. For the latest
            advisories, check the official sources below.
          </p>
        </div>
      )}

      {sources.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>Official advisories:</span>
          {sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              {source.type === "water" ? (
                <Droplet size={14} />
              ) : (
                <Zap size={14} />
              )}
              {source.name}
              <ArrowUpRight size={14} />
            </a>
          ))}
        </p>
      )}
    </section>
  );
}

const InterruptionCard = ({ item }) => {
  const isPower = item.type === "power";
  const ongoing = item.status === "ongoing";
  return (
    <li className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
          {isPower ? <Zap size={14} /> : <Droplet size={14} />}
          {isPower ? "Power" : "Water"} · {item.provider}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            ongoing
              ? "bg-danger-soft text-danger-strong"
              : "bg-brand-50 text-brand-700"
          }`}
        >
          {ongoing ? "Ongoing" : "Upcoming"}
        </span>
      </div>
      <h3 className="mt-2 font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm text-ink-soft tabular-nums">
        {formatTimeRange(item.start, item.end)}
      </p>
      {item.areas.length > 0 && (
        <p className="mt-3 text-sm">
          <span className="text-muted">Affected areas: </span>
          {item.areas.join(", ")}
        </p>
      )}
      {hasText(item.details) && (
        <p className="mt-2 text-sm text-muted">{item.details}</p>
      )}
      {hasText(item.sourceUrl) && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          Official advisory
          <ArrowUpRight size={14} />
        </a>
      )}
    </li>
  );
};

// --- Barangay directory ---

function BarangayDirectorySection() {
  const [query, setQuery] = useState("");
  const all = EverydayInfoService.getBarangays();
  const results = EverydayInfoService.searchBarangays(query);
  const postedCount = all.filter(EverydayInfoService.hasDetails).length;
  const updated = EverydayInfoService.getDirectoryUpdated();

  return (
    <section
      id="barangays"
      className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12 scroll-mt-24"
    >
      <Custom_SectionHeader
        title="Barangay directory"
        desc={`Officials, hall locations, hotlines and office hours for Panabo City's ${all.length} barangays.`}
      />

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search barangays"
            placeholder="Search by barangay or captain"
            className="w-full rounded-control border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          Details posted for{" "}
          <span className="font-semibold text-ink tabular-nums">
            {postedCount}
          </span>{" "}
          of {all.length} barangays
          {hasText(updated) && ` · Updated ${formatDate(updated)}`}
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((barangay) => (
            <BarangayCard key={barangay.name} barangay={barangay} />
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
          <SearchX size={28} className="mx-auto text-subtle" />
          <p className="mt-3 text-sm text-muted">
            No barangay matches “{query}”.
          </p>
        </div>
      )}
    </section>
  );
}

const BarangayCard = ({ barangay }) => {
  const officials = barangay.officials ?? [];
  return (
    <li className="rounded-card border border-line bg-surface p-5">
      <h3 className="font-semibold">{barangay.name}</h3>
      {EverydayInfoService.hasDetails(barangay) ? (
        <>
          <dl className="mt-3 space-y-2.5 text-sm">
            <DetailRow icon={UserRound} label="Punong Barangay">
              {barangay.captain}
            </DetailRow>
            <DetailRow icon={MapPin} label="Barangay hall">
              {hasText(barangay.hallAddress) && (
                <>
                  {barangay.hallAddress}
                  {hasText(barangay.mapUrl) && (
                    <a
                      href={barangay.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex items-center gap-0.5 text-brand-600 hover:text-brand-700"
                    >
                      Map
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </>
              )}
            </DetailRow>
            <DetailRow icon={Phone} label="Hotline">
              {hasText(barangay.hotline) && (
                <a
                  href={`tel:${barangay.hotline.replace(/\s/g, "")}`}
                  className="font-medium tabular-nums text-brand-600 hover:text-brand-700"
                >
                  {barangay.hotline}
                </a>
              )}
            </DetailRow>
            <DetailRow icon={Clock} label="Office hours">
              {barangay.officeHours}
            </DetailRow>
          </dl>

          {officials.length > 0 && (
            <details className="mt-3 border-t border-line pt-3 text-sm">
              <summary className="cursor-pointer font-medium text-brand-600 hover:text-brand-700">
                Barangay officials ({officials.length})
              </summary>
              <ul className="mt-2 space-y-1.5">
                {officials.map((official) => (
                  <li
                    key={`${official.position}-${official.name}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-muted">{official.position}</span>
                    <span className="text-right">{official.name}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      ) : (
        <p className="mt-1 text-sm text-subtle">Details not yet posted.</p>
      )}
    </li>
  );
};

// One labelled detail; shows "Not yet posted" when the value is empty
const DetailRow = ({ icon: Icon, label, children }) => {
  const empty = !children || (typeof children === "string" && !hasText(children));
  return (
    <div className="flex gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-subtle" />
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className={empty ? "text-subtle" : "text-ink"}>
          {empty ? "Not yet posted" : children}
        </dd>
      </div>
    </div>
  );
};

// --- Garbage collection ---

function GarbageSection() {
  const barangays = EverydayInfoService.getBarangays();
  const info = EverydayInfoService.getGarbageInfo();

  // Remember the visitor's barangay on this device (optional convenience)
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return barangays.some((b) => b.name === saved) ? saved : "";
    } catch {
      return "";
    }
  });

  const handleChange = (e) => {
    setSelected(e.target.value);
    try {
      localStorage.setItem(STORAGE_KEY, e.target.value);
    } catch {
      // Storage unavailable (private mode, blocked): the page still works
    }
  };

  const schedule = selected
    ? EverydayInfoService.getGarbageSchedule(selected)
    : null;

  return (
    <section
      id="garbage"
      className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12 scroll-mt-24"
    >
      <Custom_SectionHeader
        title="Garbage collection"
        desc="Choose your barangay to see its pickup days."
      />

      <div className="mt-8 rounded-card border border-line bg-surface p-5 md:p-6">
        <label htmlFor="garbage-barangay" className="block text-sm font-medium">
          Your barangay
        </label>
        <div className="relative mt-2 max-w-md">
          <select
            id="garbage-barangay"
            value={selected}
            onChange={handleChange}
            className="w-full cursor-pointer appearance-none rounded-control border border-line bg-surface py-2.5 pl-3 pr-10 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Choose a barangay…</option>
            {barangays.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
          />
        </div>

        <div className="mt-6" aria-live="polite">
          {!selected && (
            <p className="text-sm text-muted">
              Pick a barangay to see its collection days.
            </p>
          )}
          {selected && !schedule && (
            <p className="text-sm text-muted">
              The schedule for{" "}
              <span className="font-medium text-ink">{selected}</span> hasn't
              been posted yet.
            </p>
          )}
          {schedule && (
            <>
              <ul className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Pickup days">
                {WEEK.map((day) => {
                  const pickup = schedule.days.includes(day);
                  return (
                    <li
                      key={day}
                      className={`rounded-control border py-2.5 text-center text-xs sm:text-sm ${
                        pickup
                          ? "border-brand-200 bg-brand-50 font-semibold text-brand-700"
                          : "border-transparent bg-canvas text-subtle"
                      }`}
                    >
                      <span aria-hidden="true">{day.slice(0, 3)}</span>
                      <span className="sr-only">
                        {day}: {pickup ? "pickup" : "no pickup"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm">
                Pickup on{" "}
                <span className="font-semibold">
                  {schedule.days.join(", ")}
                </span>
                {hasText(schedule.time) && (
                  <span className="text-muted"> · {schedule.time}</span>
                )}
              </p>
              {hasText(schedule.notes) && (
                <p className="mt-1 text-sm text-muted">{schedule.notes}</p>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Schedules posted for{" "}
        <span className="font-semibold text-ink tabular-nums">
          {info.postedCount}
        </span>{" "}
        of {barangays.length} barangays
        {hasText(info.source) && ` · Source: ${info.source}`}
        {hasText(info.lastUpdated) && ` · Updated ${formatDate(info.lastUpdated)}`}
      </p>
    </section>
  );
}
