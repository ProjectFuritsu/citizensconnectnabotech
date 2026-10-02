import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  FileQuestionMark,
  Info,
  ListChecks,
  ListOrdered,
  Wallet,
} from "lucide-react";
import { InfoDataService } from "../../Services/InfoLibServices/InfoLibService";
import Custom_DynamicIcon from "../../Widgets/custom_DynamicIcon";
import Custom_InfoCard from "../../Widgets/custom_info_card";
import Custom_SectionHeader from "../../Widgets/custom_SectionHeader";
import {
  formatDate,
  formatFee,
  isFree,
  parseRequirement,
  pluralize,
} from "../../Theme/display";

export default function InfoDetailsPage() {
  const { id } = useParams();
  const doc = InfoDataService.getProgramById(id);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Use "auto" for an instant jump
    });
  }, [id]);

  // Other guides in the same category, newest first
  const relatedGuides = useMemo(() => {
    if (!doc) return [];
    return InfoDataService.getAllPrograms()
      .filter((g) => g.id !== doc.id && g.tags[0] === doc.tags[0])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [doc]);

  if (!doc) return <NotFoundState />;

  const category = doc.tags[0];
  const categoryLink = `/info?tag=${encodeURIComponent(category)}`;
  const requirements = doc.requirements ?? [];
  const situational = doc.situational_requirements ?? [];
  const steps = doc.guidelines ?? [];
  const categoryCount = InfoDataService.getAllPrograms().filter((g) =>
    g.tags.includes(category),
  ).length;

  const contents = [
    { id: "requirements", label: "Requirements", count: requirements.length },
    situational.length > 0 && {
      id: "additional",
      label: "Additional requirements",
      count: situational.length,
    },
    { id: "process", label: "Step-by-step process", count: steps.length },
  ].filter(Boolean);

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      {/* Header */}
      <section className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
          >
            <Link to="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <Link to="/info" className="hover:text-ink transition-colors">
              Guide Hub
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <Link
              to={categoryLink}
              className="hover:text-ink transition-colors"
            >
              {category}
            </Link>
          </nav>

          <div className="mt-6 flex items-start gap-5">
            <span className="hidden sm:grid h-14 w-14 shrink-0 place-items-center rounded-card border border-line bg-canvas">
              <Custom_DynamicIcon
                name={doc.icon_type}
                className={`h-6 w-6 ${doc.icon_color || "text-brand-500"}`}
              />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                {doc.title}
              </h1>
              <p className="mt-3 max-w-3xl text-lg text-muted text-pretty">
                {doc.desc}
              </p>
              <p className="mt-3 text-sm text-subtle">
                Updated {formatDate(doc.date)}
                {doc.sources?.url && (
                  <>
                    {" · Source: "}
                    <a
                      href={doc.sources.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      {doc.sources.name}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Key facts */}
          <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-card border border-line bg-line">
            <Fact
              icon={Wallet}
              label="Fee"
              value={formatFee(doc.fee)}
              valueClassName={isFree(doc.fee) ? "text-success" : "text-ink"}
            />
            <Fact
              icon={Clock}
              label="Processing time"
              value={doc.total_duration || "—"}
            />
            <Fact
              icon={ListChecks}
              label="Requirements"
              value={requirements.length}
            />
            <Fact icon={ListOrdered} label="Steps" value={steps.length} />
          </dl>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div className="min-w-0 space-y-10 md:space-y-12">
          {/* Requirements */}
          <section id="requirements" className="scroll-mt-24">
            <Custom_SectionHeader
              title="Requirements"
              desc={`Prepare these ${pluralize(requirements.length, "item")} before you go.`}
            />
            <ol className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {requirements.map((req, idx) => {
                const { name, copies } = parseRequirement(req);
                return (
                  <li key={idx} className="flex gap-4 px-5 py-4">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-muted tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="flex min-w-0 grow flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <p className="text-sm font-medium leading-relaxed">
                        {name}
                      </p>
                      {copies && (
                        <span className="self-start shrink-0 rounded-full bg-canvas px-2.5 py-0.5 text-xs text-muted">
                          {copies}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Additional (situational) requirements */}
          {situational.length > 0 && (
            <section id="additional" className="scroll-mt-24">
              <Custom_SectionHeader
                title="Additional requirements"
                desc="Only if one of these applies to you. Bring them on top of the requirements above."
              />
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {situational.map((group, idx) => (
                  <div
                    key={idx}
                    className="rounded-card border border-line bg-surface p-5"
                  >
                    <h3 className="flex items-start gap-2 text-sm font-semibold">
                      <Info
                        size={16}
                        className="mt-0.5 shrink-0 text-brand-600"
                      />
                      {group.condition}
                    </h3>
                    <ul className="mt-3 space-y-2 pl-6">
                      {group.docs.map((item, dIdx) => {
                        const { name, copies } = parseRequirement(item);
                        return (
                          <li
                            key={dIdx}
                            className="relative text-sm leading-relaxed text-ink-soft"
                          >
                            <span className="absolute -left-4 top-2.5 h-1 w-1 rounded-full bg-subtle" />
                            {name}
                            {copies && (
                              <span className="text-muted"> · {copies}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Step-by-step process */}
          <section id="process" className="scroll-mt-24">
            <Custom_SectionHeader
              title="Step-by-step process"
              desc={`${pluralize(steps.length, "step")}${doc.total_duration ? `, ${doc.total_duration} in total` : ""}.`}
            />
            <ol className="mt-6 rounded-card border border-line bg-surface p-5 md:p-6">
              {steps.map((step, idx) => (
                <li key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Connector line to the next step */}
                  {idx < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-10 bottom-1 w-px -translate-x-1/2 bg-line"
                    />
                  )}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 tabular-nums">
                    {step.step ?? idx + 1}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm leading-relaxed">{step.action}</p>
                    {step.duration && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">
                        <Clock size={12} />
                        {step.duration}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar: contents and source (stacks under the content below lg) */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="On this page"
            className="hidden lg:block rounded-card border border-line bg-surface p-5"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              On this page
            </h2>
            <ul className="mt-3 space-y-1">
              {contents.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-1.5 text-sm text-ink-soft hover:bg-canvas hover:text-brand-700 transition-colors"
                  >
                    {item.label}
                    <span className="text-xs text-subtle tabular-nums">
                      {item.count}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Official source
            </h2>
            {doc.sources?.url ? (
              <a
                href={doc.sources.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-start gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                {doc.sources.name}
                <ArrowUpRight size={14} className="mt-0.5 shrink-0" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted">—</p>
            )}
            <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
              This guide is for informational purposes only. No actions can be
              taken directly from this page.
            </p>
          </div>
        </aside>
      </div>

      {/* Related guides */}
      {relatedGuides.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12">
          <Custom_SectionHeader
            title={`More ${category} guides`}
            link={{
              to: categoryLink,
              label: `View all ${categoryCount}`,
            }}
          />
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((guide) => (
              <li key={guide.id}>
                <Custom_InfoCard doc={guide} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Sub-components for cleaner code
const Fact = ({ icon: Icon, label, value, valueClassName = "text-ink" }) => (
  <div className="bg-surface px-5 py-4">
    <dt className="flex items-center gap-1.5 text-xs text-muted">
      <Icon size={14} className="text-subtle" />
      {label}
    </dt>
    <dd
      className={`mt-1 text-lg font-semibold leading-snug tabular-nums ${valueClassName}`}
    >
      {value}
    </dd>
  </div>
);

function NotFoundState() {
  return (
    <div className="bg-canvas font-sans text-ink">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center">
        <FileQuestionMark size={40} className="text-subtle" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Guide not found
        </h1>
        <p className="mt-2 max-w-sm text-muted">
          This guide may have been moved or removed. Browse the Guide Hub for
          the latest list.
        </p>
        <Link
          to="/info"
          className="mt-6 inline-flex items-center rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Back to Guide Hub
        </Link>
      </div>
    </div>
  );
}
